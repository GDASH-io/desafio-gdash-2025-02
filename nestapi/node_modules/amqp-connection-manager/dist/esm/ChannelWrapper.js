import * as crypto from 'crypto';
import { EventEmitter } from 'events';
import pb from 'promise-breaker';
import { promisify } from 'util';
const MAX_MESSAGES_PER_BATCH = 1000;
const randomBytes = promisify(crypto.randomBytes);
const IRRECOVERABLE_ERRORS = [
    403, // AMQP Access Refused Error.
    404, // AMQP Not Found Error.
    406, // AMQP Precondition Failed Error.
    501, // AMQP Frame Error.
    502, // AMQP Frame Syntax Error.
    503, // AMQP Invalid Command Error.
    504, // AMQP Channel Not Open Error.
    505, // AMQP Unexpected Frame.
    530, // AMQP Not Allowed Error.
    540, // AMQP Not Implemented Error.
    541, // AMQP Internal Error.
];
/**
 * Calls to `publish()` or `sendToQueue()` work just like in amqplib, but messages are queued internally and
 * are guaranteed to be delivered.  If the underlying connection drops, ChannelWrapper will wait for a new
 * connection and continue.
 *
 * Events:
 * * `connect` - emitted every time this channel connects or reconnects.
 * * `error(err, {name})` - emitted if an error occurs setting up the channel.
 * * `drop({message, err})` - called when a JSON message was dropped because it could not be encoded.
 * * `close` - emitted when this channel closes via a call to `close()`
 *
 */
export default class ChannelWrapper extends EventEmitter {
    addListener(event, listener) {
        return super.addListener(event, listener);
    }
    on(event, listener) {
        return super.on(event, listener);
    }
    once(event, listener) {
        return super.once(event, listener);
    }
    prependListener(event, listener) {
        return super.prependListener(event, listener);
    }
    prependOnceListener(event, listener) {
        return super.prependOnceListener(event, listener);
    }
    /**
     *  Adds a new 'setup handler'.
     *
     * `setup(channel, [cb])` is a function to call when a new underlying channel is created - handy for asserting
     * exchanges and queues exists, and whatnot.  The `channel` object here is a ConfigChannel from amqplib.
     * The `setup` function should return a Promise (or optionally take a callback) - no messages will be sent until
     * this Promise resolves.
     *
     * If there is a connection, `setup()` will be run immediately, and the addSetup Promise/callback won't resolve
     * until `setup` is complete.  Note that in this case, if the setup throws an error, no 'error' event will
     * be emitted, since you can just handle the error here (although the `setup` will still be added for future
     * reconnects, even if it throws an error.)
     *
     * Setup functions should, ideally, not throw errors, but if they do then the ChannelWrapper will emit an 'error'
     * event.
     *
     * @param setup - setup function.
     * @param [done] - callback.
     * @returns - Resolves when complete.
     */
    addSetup(setup, done) {
        return pb.addCallback(done, (this._settingUp || Promise.resolve()).then(() => {
            this._setups.push(setup);
            if (this._channel) {
                return pb.call(setup, this, this._channel);
            }
            else {
                return undefined;
            }
        }));
    }
    /**
     * Remove a setup function added with `addSetup`.  If there is currently a
     * connection, `teardown(channel, [cb])` will be run immediately, and the
     * returned Promise will not resolve until it completes.
     *
     * @param {function} setup - the setup function to remove.
     * @param {function} [teardown] - `function(channel, [cb])` to run to tear
     *   down the channel.
     * @param {function} [done] - Optional callback.
     * @returns {void | Promise} - Resolves when complete.
     */
    removeSetup(setup, teardown, done) {
        return pb.addCallback(done, () => {
            this._setups = this._setups.filter((s) => s !== setup);
            return (this._settingUp || Promise.resolve()).then(() => this._channel && teardown ? pb.call(teardown, this, this._channel) : undefined);
        });
    }
    /**
     * Returns a Promise which resolves when this channel next connects.
     * (Mainly here for unit testing...)
     *
     * @param [done] - Optional callback.
     * @returns - Resolves when connected.
     */
    waitForConnect(done) {
        return pb.addCallback(done, this._channel && !this._settingUp
            ? Promise.resolve()
            : new Promise((resolve) => this.once('connect', resolve)));
    }
    /*
     * Publish a message to the channel.
     *
     * This works just like amqplib's `publish()`, except if the channel is not
     * connected, this will wait until the channel is connected.  Returns a
     * Promise which will only resolve when the message has been succesfully sent.
     * The returned promise will be rejected if `close()` is called on this
     * channel before it can be sent, if `options.json` is set and the message
     * can't be encoded, or if the broker rejects the message for some reason.
     *
     */
    publish(exchange, routingKey, content, options, done) {
        return pb.addCallback(done, new Promise((resolve, reject) => {
            const { timeout, ...opts } = options || {};
            this._enqueueMessage({
                type: 'publish',
                exchange,
                routingKey,
                content: this._getEncodedMessage(content),
                resolve,
                reject,
                options: opts,
                isTimedout: false,
            }, timeout || this._publishTimeout);
            this._startWorker();
        }));
    }
    /*
     * Send a message to a queue.
     *
     * This works just like amqplib's `sendToQueue`, except if the channel is not connected, this will wait until the
     * channel is connected.  Returns a Promise which will only resolve when the message has been succesfully sent.
     * The returned promise will be rejected only if `close()` is called on this channel before it can be sent.
     *
     * `message` here should be a JSON-able object.
     */
    sendToQueue(queue, content, options, done) {
        const encodedContent = this._getEncodedMessage(content);
        return pb.addCallback(done, new Promise((resolve, reject) => {
            const { timeout, ...opts } = options || {};
            this._enqueueMessage({
                type: 'sendToQueue',
                queue,
                content: encodedContent,
                resolve,
                reject,
                options: opts,
                isTimedout: false,
            }, timeout || this._publishTimeout);
            this._startWorker();
        }));
    }
    _enqueueMessage(message, timeout) {
        if (timeout) {
            message.timeout = setTimeout(() => {
                let idx = this._messages.indexOf(message);
                if (idx !== -1) {
                    this._messages.splice(idx, 1);
                }
                else {
                    idx = this._unconfirmedMessages.indexOf(message);
                    if (idx !== -1) {
                        this._unconfirmedMessages.splice(idx, 1);
                    }
                }
                message.isTimedout = true;
                message.reject(new Error('timeout'));
            }, timeout);
        }
        this._messages.push(message);
    }
    /**
     * Create a new ChannelWrapper.
     *
     * @param connectionManager - connection manager which
     *   created this channel.
     * @param [options] -
     * @param [options.name] - A name for this channel.  Handy for debugging.
     * @param [options.setup] - A default setup function to call.  See
     *   `addSetup` for details.
     * @param [options.json] - if true, then ChannelWrapper assumes all
     *   messages passed to `publish()` and `sendToQueue()` are plain JSON objects.
     *   These will be encoded automatically before being sent.
     *
     */
    constructor(connectionManager, options = {}) {
        var _a, _b;
        super();
        /** If we're in the process of creating a channel, this is a Promise which
         * will resolve when the channel is set up.  Otherwise, this is `null`.
         */
        this._settingUp = undefined;
        /** Queued messages, not yet sent. */
        this._messages = [];
        /** Oublished, but not yet confirmed messages. */
        this._unconfirmedMessages = [];
        /** Consumers which will be reconnected on channel errors etc. */
        this._consumers = [];
        /**
         * True to create a ConfirmChannel. False to create a regular Channel.
         */
        this._confirm = true;
        /**
         * True if the "worker" is busy sending messages.  False if we need to
         * start the worker to get stuff done.
         */
        this._working = false;
        /**
         *  We kill off workers when we disconnect.  Whenever we start a new
         * worker, we bump up the `_workerNumber` - this makes it so if stale
         * workers ever do wake up, they'll know to stop working.
         */
        this._workerNumber = 0;
        /**
         * True if the underlying channel has room for more messages.
         */
        this._channelHasRoom = true;
        this._onConnect = this._onConnect.bind(this);
        this._onDisconnect = this._onDisconnect.bind(this);
        this._connectionManager = connectionManager;
        this._confirm = (_a = options.confirm) !== null && _a !== void 0 ? _a : true;
        this.name = options.name;
        this._publishTimeout = options.publishTimeout;
        this._json = (_b = options.json) !== null && _b !== void 0 ? _b : false;
        // Array of setup functions to call.
        this._setups = [];
        this._consumers = [];
        if (options.setup) {
            this._setups.push(options.setup);
        }
        const connection = connectionManager.connection;
        if (connection) {
            this._onConnect({ connection });
        }
        connectionManager.on('connect', this._onConnect);
        connectionManager.on('disconnect', this._onDisconnect);
    }
    // Called whenever we connect to the broker.
    async _onConnect({ connection }) {
        this._irrecoverableCode = undefined;
        try {
            let channel;
            if (this._confirm) {
                channel = await connection.createConfirmChannel();
            }
            else {
                channel = await connection.createChannel();
            }
            this._channel = channel;
            this._channelHasRoom = true;
            channel.on('close', () => this._onChannelClose(channel));
            channel.on('drain', () => this._onChannelDrain());
            this._settingUp = Promise.all(this._setups.map((setupFn) => 
            // TODO: Use a timeout here to guard against setupFns that never resolve?
            pb.call(setupFn, this, channel).catch((err) => {
                if (err.name === 'IllegalOperationError') {
                    // Don't emit an error if setups failed because the channel closed.
                    return;
                }
                this.emit('error', err, { name: this.name });
            })))
                .then(() => {
                return Promise.all(this._consumers.map((c) => this._reconnectConsumer(c)));
            })
                .then(() => {
                this._settingUp = undefined;
            });
            await this._settingUp;
            if (!this._channel) {
                // Can happen if channel closes while we're setting up.
                return;
            }
            // Since we just connected, publish any queued messages
            this._startWorker();
            this.emit('connect');
        }
        catch (err) {
            this.emit('error', err, { name: this.name });
            this._settingUp = undefined;
            this._channel = undefined;
        }
    }
    // Called whenever the channel closes.
    _onChannelClose(channel) {
        if (this._channel === channel) {
            this._channel = undefined;
        }
        // Wait for another reconnect to create a new channel.
    }
    /** Called whenever the channel drains. */
    _onChannelDrain() {
        this._channelHasRoom = true;
        this._startWorker();
    }
    // Called whenever we disconnect from the AMQP server.
    _onDisconnect(ex) {
        this._irrecoverableCode = ex.err instanceof Error ? ex.err.code : undefined;
        this._channel = undefined;
        this._settingUp = undefined;
        // Kill off the current worker.  We never get any kind of error for messages in flight - see
        // https://github.com/squaremo/amqp.node/issues/191.
        this._working = false;
    }
    // Returns the number of unsent messages queued on this channel.
    queueLength() {
        return this._messages.length;
    }
    // Destroy this channel.
    //
    // Any unsent messages will have their associated Promises rejected.
    //
    close() {
        return Promise.resolve().then(() => {
            this._working = false;
            if (this._messages.length !== 0) {
                // Reject any unsent messages.
                this._messages.forEach((message) => {
                    if (message.timeout) {
                        clearTimeout(message.timeout);
                    }
                    message.reject(new Error('Channel closed'));
                });
            }
            if (this._unconfirmedMessages.length !== 0) {
                // Reject any unconfirmed messages.
                this._unconfirmedMessages.forEach((message) => {
                    if (message.timeout) {
                        clearTimeout(message.timeout);
                    }
                    message.reject(new Error('Channel closed'));
                });
            }
            this._connectionManager.removeListener('connect', this._onConnect);
            this._connectionManager.removeListener('disconnect', this._onDisconnect);
            const answer = (this._channel && this._channel.close()) || undefined;
            this._channel = undefined;
            this.emit('close');
            return answer;
        });
    }
    _shouldPublish() {
        return (this._messages.length > 0 && !this._settingUp && !!this._channel && this._channelHasRoom);
    }
    // Start publishing queued messages, if there isn't already a worker doing this.
    _startWorker() {
        if (!this._working && this._shouldPublish()) {
            this._working = true;
            this._workerNumber++;
            this._publishQueuedMessages(this._workerNumber);
        }
    }
    // Define if a message can cause irrecoverable error
    _canWaitReconnection() {
        return !this._irrecoverableCode || !IRRECOVERABLE_ERRORS.includes(this._irrecoverableCode);
    }
    _messageResolved(message, result) {
        removeUnconfirmedMessage(this._unconfirmedMessages, message);
        message.resolve(result);
    }
    _messageRejected(message, err) {
        if (!this._channel && this._canWaitReconnection()) {
            // Tried to write to a closed channel.  Leave the message in the queue and we'll try again when
            // we reconnect.
            removeUnconfirmedMessage(this._unconfirmedMessages, message);
            this._messages.push(message);
        }
        else {
            // Something went wrong trying to send this message - could be JSON.stringify failed, could be
            // the broker rejected the message. Either way, reject it back
            removeUnconfirmedMessage(this._unconfirmedMessages, message);
            message.reject(err);
        }
    }
    _getEncodedMessage(content) {
        let encodedMessage;
        if (this._json) {
            encodedMessage = Buffer.from(JSON.stringify(content));
        }
        else if (typeof content === 'string') {
            encodedMessage = Buffer.from(content);
        }
        else if (content instanceof Buffer) {
            encodedMessage = content;
        }
        else if (typeof content === 'object' && typeof content.toString === 'function') {
            encodedMessage = Buffer.from(content.toString());
        }
        else {
            console.warn('amqp-connection-manager: Sending JSON message, but json option not speicifed');
            encodedMessage = Buffer.from(JSON.stringify(content));
        }
        return encodedMessage;
    }
    _publishQueuedMessages(workerNumber) {
        const channel = this._channel;
        if (!channel ||
            !this._shouldPublish() ||
            !this._working ||
            workerNumber !== this._workerNumber) {
            // Can't publish anything right now...
            this._working = false;
            return;
        }
        try {
            // Send messages in batches of 1000 - don't want to starve the event loop.
            let sendsLeft = MAX_MESSAGES_PER_BATCH;
            while (this._channelHasRoom && this._messages.length > 0 && sendsLeft > 0) {
                sendsLeft--;
                const message = this._messages.shift();
                if (!message) {
                    break;
                }
                let thisCanSend = true;
                switch (message.type) {
                    case 'publish': {
                        if (this._confirm) {
                            this._unconfirmedMessages.push(message);
                            thisCanSend = this._channelHasRoom = channel.publish(message.exchange, message.routingKey, message.content, message.options, (err) => {
                                if (message.isTimedout) {
                                    return;
                                }
                                if (message.timeout) {
                                    clearTimeout(message.timeout);
                                }
                                if (err) {
                                    this._messageRejected(message, err);
                                }
                                else {
                                    this._messageResolved(message, thisCanSend);
                                }
                            });
                        }
                        else {
                            if (message.timeout) {
                                clearTimeout(message.timeout);
                            }
                            thisCanSend = this._channelHasRoom = channel.publish(message.exchange, message.routingKey, message.content, message.options);
                            message.resolve(thisCanSend);
                        }
                        break;
                    }
                    case 'sendToQueue': {
                        if (this._confirm) {
                            this._unconfirmedMessages.push(message);
                            thisCanSend = this._channelHasRoom = channel.sendToQueue(message.queue, message.content, message.options, (err) => {
                                if (message.isTimedout) {
                                    return;
                                }
                                if (message.timeout) {
                                    clearTimeout(message.timeout);
                                }
                                if (err) {
                                    this._messageRejected(message, err);
                                }
                                else {
                                    this._messageResolved(message, thisCanSend);
                                }
                            });
                        }
                        else {
                            if (message.timeout) {
                                clearTimeout(message.timeout);
                            }
                            thisCanSend = this._channelHasRoom = channel.sendToQueue(message.queue, message.content, message.options);
                            message.resolve(thisCanSend);
                        }
                        break;
                    }
                    /* istanbul ignore next */
                    default:
                        throw new Error(`Unhandled message type ${message.type}`);
                }
            }
            // If we didn't send all the messages, send some more...
            if (this._channelHasRoom && this._messages.length > 0) {
                setImmediate(() => this._publishQueuedMessages(workerNumber));
            }
            else {
                this._working = false;
            }
            /* istanbul ignore next */
        }
        catch (err) {
            this._working = false;
            this.emit('error', err);
        }
    }
    /**
     * Setup a consumer
     * This consumer will be reconnected on cancellation and channel errors.
     */
    async consume(queue, onMessage, options = {}) {
        const consumerTag = options.consumerTag || (await randomBytes(16)).toString('hex');
        const consumer = {
            consumerTag: null,
            queue,
            onMessage,
            options: {
                ...options,
                consumerTag,
            },
        };
        if (this._settingUp) {
            await this._settingUp;
        }
        this._consumers.push(consumer);
        await this._consume(consumer);
        return { consumerTag };
    }
    async _consume(consumer) {
        if (!this._channel) {
            return;
        }
        const { prefetch, ...options } = consumer.options;
        if (typeof prefetch === 'number') {
            this._channel.prefetch(prefetch, false);
        }
        const { consumerTag } = await this._channel.consume(consumer.queue, (msg) => {
            if (!msg) {
                consumer.consumerTag = null;
                this._reconnectConsumer(consumer).catch((err) => {
                    if (err.code === 404) {
                        // Ignore errors caused by queue not declared. In
                        // those cases the connection will reconnect and
                        // then consumers reestablished. The full reconnect
                        // might be avoided if we assert the queue again
                        // before starting to consume.
                        return;
                    }
                    this.emit('error', err);
                });
                return;
            }
            consumer.onMessage(msg);
        }, options);
        consumer.consumerTag = consumerTag;
    }
    async _reconnectConsumer(consumer) {
        if (!this._consumers.includes(consumer)) {
            // Intentionally canceled
            return;
        }
        await this._consume(consumer);
    }
    /**
     * Cancel all consumers
     */
    async cancelAll() {
        const consumers = this._consumers;
        this._consumers = [];
        if (!this._channel) {
            return;
        }
        const channel = this._channel;
        await Promise.all(consumers.reduce((acc, consumer) => {
            if (consumer.consumerTag) {
                acc.push(channel.cancel(consumer.consumerTag));
            }
            return acc;
        }, []));
    }
    async cancel(consumerTag) {
        const idx = this._consumers.findIndex((x) => x.options.consumerTag === consumerTag);
        if (idx === -1) {
            return;
        }
        const consumer = this._consumers[idx];
        this._consumers.splice(idx, 1);
        if (this._channel && consumer.consumerTag) {
            await this._channel.cancel(consumer.consumerTag);
        }
    }
    /** Send an `ack` to the underlying channel. */
    ack(message, allUpTo) {
        this._channel && this._channel.ack(message, allUpTo);
    }
    /** Send an `ackAll` to the underlying channel. */
    ackAll() {
        this._channel && this._channel.ackAll();
    }
    /** Send a `nack` to the underlying channel. */
    nack(message, allUpTo, requeue) {
        this._channel && this._channel.nack(message, allUpTo, requeue);
    }
    /** Send a `nackAll` to the underlying channel. */
    nackAll(requeue) {
        this._channel && this._channel.nackAll(requeue);
    }
    /** Send a `purgeQueue` to the underlying channel. */
    async purgeQueue(queue) {
        if (this._channel) {
            return await this._channel.purgeQueue(queue);
        }
        else {
            throw new Error(`Not connected.`);
        }
    }
    /** Send a `checkQueue` to the underlying channel. */
    async checkQueue(queue) {
        if (this._channel) {
            return await this._channel.checkQueue(queue);
        }
        else {
            throw new Error(`Not connected.`);
        }
    }
    /** Send a `assertQueue` to the underlying channel. */
    async assertQueue(queue, options) {
        if (this._channel) {
            return await this._channel.assertQueue(queue, options);
        }
        else {
            return { queue, messageCount: 0, consumerCount: 0 };
        }
    }
    /** Send a `bindQueue` to the underlying channel. */
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    async bindQueue(queue, source, pattern, args) {
        if (this._channel) {
            await this._channel.bindQueue(queue, source, pattern, args);
        }
    }
    /** Send a `unbindQueue` to the underlying channel. */
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    async unbindQueue(queue, source, pattern, args) {
        if (this._channel) {
            await this._channel.unbindQueue(queue, source, pattern, args);
        }
    }
    /** Send a `deleteQueue` to the underlying channel. */
    async deleteQueue(queue, options) {
        if (this._channel) {
            return await this._channel.deleteQueue(queue, options);
        }
        else {
            throw new Error(`Not connected.`);
        }
    }
    /** Send a `assertExchange` to the underlying channel. */
    async assertExchange(exchange, type, options) {
        if (this._channel) {
            return await this._channel.assertExchange(exchange, type, options);
        }
        else {
            return { exchange };
        }
    }
    /** Send a `bindExchange` to the underlying channel. */
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    async bindExchange(destination, source, pattern, args) {
        if (this._channel) {
            return await this._channel.bindExchange(destination, source, pattern, args);
        }
        else {
            throw new Error(`Not connected.`);
        }
    }
    /** Send a `checkExchange` to the underlying channel. */
    async checkExchange(exchange) {
        if (this._channel) {
            return await this._channel.checkExchange(exchange);
        }
        else {
            throw new Error(`Not connected.`);
        }
    }
    /** Send a `deleteExchange` to the underlying channel. */
    async deleteExchange(exchange, options) {
        if (this._channel) {
            return await this._channel.deleteExchange(exchange, options);
        }
        else {
            throw new Error(`Not connected.`);
        }
    }
    /** Send a `unbindExchange` to the underlying channel. */
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    async unbindExchange(destination, source, pattern, args) {
        if (this._channel) {
            return await this._channel.unbindExchange(destination, source, pattern, args);
        }
        else {
            throw new Error(`Not connected.`);
        }
    }
    /** Send a `get` to the underlying channel. */
    async get(queue, options) {
        if (this._channel) {
            return await this._channel.get(queue, options);
        }
        else {
            throw new Error(`Not connected.`);
        }
    }
}
function removeUnconfirmedMessage(arr, message) {
    const toRemove = arr.indexOf(message);
    if (toRemove === -1) {
        throw new Error(`Message is not in _unconfirmedMessages!`);
    }
    const removed = arr.splice(toRemove, 1);
    return removed[0];
}
//# sourceMappingURL=ChannelWrapper.js.map