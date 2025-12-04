import type * as amqplib from 'amqplib';
import { Options } from 'amqplib';
import { EventEmitter } from 'events';
import pb from 'promise-breaker';
import { IAmqpConnectionManager } from './AmqpConnectionManager.js';
export type Channel = amqplib.ConfirmChannel | amqplib.Channel;
export type SetupFunc = ((channel: Channel, callback: (error?: Error) => void) => void) | ((channel: Channel) => Promise<void>) | ((channel: amqplib.ConfirmChannel, callback: (error?: Error) => void) => void) | ((channel: amqplib.ConfirmChannel) => Promise<void>);
export interface CreateChannelOpts {
    /**  Name for this channel. Used for debugging. */
    name?: string;
    /**
     * A function to call whenever we reconnect to the broker (and therefore create a new underlying channel.)
     * This function should either accept a callback, or return a Promise. See addSetup below
     */
    setup?: SetupFunc;
    /**
     * True to create a ConfirmChannel (default). False to create a regular Channel.
     */
    confirm?: boolean;
    /**
     * if true, then ChannelWrapper assumes all messages passed to publish() and sendToQueue() are plain JSON objects.
     * These will be encoded automatically before being sent.
     */
    json?: boolean;
    /**
     * Default publish timeout in ms. Messages not published within the given time are rejected with a timeout error.
     */
    publishTimeout?: number;
}
export interface PublishOptions extends Options.Publish {
    /** Message will be rejected after timeout ms */
    timeout?: number;
}
export interface ConsumerOptions extends amqplib.Options.Consume {
    prefetch?: number;
}
export interface Consumer {
    consumerTag: string | null;
    queue: string;
    onMessage: (msg: amqplib.ConsumeMessage) => void;
    options: ConsumerOptions;
}
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
    private _connectionManager;
    private _json;
    /** If we're in the process of creating a channel, this is a Promise which
     * will resolve when the channel is set up.  Otherwise, this is `null`.
     */
    private _settingUp;
    private _setups;
    /** Queued messages, not yet sent. */
    private _messages;
    /** Oublished, but not yet confirmed messages. */
    private _unconfirmedMessages;
    /** Reason code during publish or sendtoqueue messages. */
    private _irrecoverableCode;
    /** Consumers which will be reconnected on channel errors etc. */
    private _consumers;
    /**
     * The currently connected channel.  Note that not all setup functions
     * have been run on this channel until `@_settingUp` is either null or
     * resolved.
     */
    private _channel?;
    /**
     * True to create a ConfirmChannel. False to create a regular Channel.
     */
    private _confirm;
    /**
     * True if the "worker" is busy sending messages.  False if we need to
     * start the worker to get stuff done.
     */
    private _working;
    /**
     *  We kill off workers when we disconnect.  Whenever we start a new
     * worker, we bump up the `_workerNumber` - this makes it so if stale
     * workers ever do wake up, they'll know to stop working.
     */
    private _workerNumber;
    /**
     * True if the underlying channel has room for more messages.
     */
    private _channelHasRoom;
    /**
     * Default publish timeout
     */
    private _publishTimeout?;
    name?: string;
    addListener(event: string, listener: (...args: any[]) => void): this;
    addListener(event: 'connect', listener: () => void): this;
    addListener(event: 'error', listener: (err: Error, info: {
        name: string;
    }) => void): this;
    addListener(event: 'close', listener: () => void): this;
    on(event: string, listener: (...args: any[]) => void): this;
    on(event: 'connect', listener: () => void): this;
    on(event: 'error', listener: (err: Error, info: {
        name: string;
    }) => void): this;
    on(event: 'close', listener: () => void): this;
    once(event: string, listener: (...args: any[]) => void): this;
    once(event: 'connect', listener: () => void): this;
    once(event: 'error', listener: (err: Error, info: {
        name: string;
    }) => void): this;
    once(event: 'close', listener: () => void): this;
    prependListener(event: string, listener: (...args: any[]) => void): this;
    prependListener(event: 'connect', listener: () => void): this;
    prependListener(event: 'error', listener: (err: Error, info: {
        name: string;
    }) => void): this;
    prependListener(event: 'close', listener: () => void): this;
    prependOnceListener(event: string, listener: (...args: any[]) => void): this;
    prependOnceListener(event: 'connect', listener: () => void): this;
    prependOnceListener(event: 'error', listener: (err: Error, info: {
        name: string;
    }) => void): this;
    prependOnceListener(event: 'close', listener: () => void): this;
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
    addSetup(setup: SetupFunc, done?: pb.Callback<void>): Promise<void>;
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
    removeSetup(setup: SetupFunc, teardown?: SetupFunc, done?: pb.Callback<void>): Promise<void>;
    /**
     * Returns a Promise which resolves when this channel next connects.
     * (Mainly here for unit testing...)
     *
     * @param [done] - Optional callback.
     * @returns - Resolves when connected.
     */
    waitForConnect(done?: pb.Callback<void>): Promise<void>;
    publish(exchange: string, routingKey: string, content: Buffer | string | unknown, options?: PublishOptions, done?: pb.Callback<boolean>): Promise<boolean>;
    sendToQueue(queue: string, content: Buffer | string | unknown, options?: PublishOptions, done?: pb.Callback<boolean>): Promise<boolean>;
    private _enqueueMessage;
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
    constructor(connectionManager: IAmqpConnectionManager, options?: CreateChannelOpts);
    private _onConnect;
    private _onChannelClose;
    /** Called whenever the channel drains. */
    private _onChannelDrain;
    private _onDisconnect;
    queueLength(): number;
    close(): Promise<void>;
    private _shouldPublish;
    private _startWorker;
    private _canWaitReconnection;
    private _messageResolved;
    private _messageRejected;
    private _getEncodedMessage;
    private _publishQueuedMessages;
    /**
     * Setup a consumer
     * This consumer will be reconnected on cancellation and channel errors.
     */
    consume(queue: string, onMessage: Consumer['onMessage'], options?: ConsumerOptions): Promise<amqplib.Replies.Consume>;
    private _consume;
    private _reconnectConsumer;
    /**
     * Cancel all consumers
     */
    cancelAll(): Promise<void>;
    cancel(consumerTag: string): Promise<void>;
    /** Send an `ack` to the underlying channel. */
    ack(message: amqplib.Message, allUpTo?: boolean): void;
    /** Send an `ackAll` to the underlying channel. */
    ackAll(): void;
    /** Send a `nack` to the underlying channel. */
    nack(message: amqplib.Message, allUpTo?: boolean, requeue?: boolean): void;
    /** Send a `nackAll` to the underlying channel. */
    nackAll(requeue?: boolean): void;
    /** Send a `purgeQueue` to the underlying channel. */
    purgeQueue(queue: string): Promise<amqplib.Replies.PurgeQueue>;
    /** Send a `checkQueue` to the underlying channel. */
    checkQueue(queue: string): Promise<amqplib.Replies.AssertQueue>;
    /** Send a `assertQueue` to the underlying channel. */
    assertQueue(queue: string, options?: amqplib.Options.AssertQueue): Promise<amqplib.Replies.AssertQueue>;
    /** Send a `bindQueue` to the underlying channel. */
    bindQueue(queue: string, source: string, pattern: string, args?: any): Promise<void>;
    /** Send a `unbindQueue` to the underlying channel. */
    unbindQueue(queue: string, source: string, pattern: string, args?: any): Promise<void>;
    /** Send a `deleteQueue` to the underlying channel. */
    deleteQueue(queue: string, options?: Options.DeleteQueue): Promise<amqplib.Replies.DeleteQueue>;
    /** Send a `assertExchange` to the underlying channel. */
    assertExchange(exchange: string, type: 'direct' | 'topic' | 'headers' | 'fanout' | 'match' | string, options?: Options.AssertExchange): Promise<amqplib.Replies.AssertExchange>;
    /** Send a `bindExchange` to the underlying channel. */
    bindExchange(destination: string, source: string, pattern: string, args?: any): Promise<amqplib.Replies.Empty>;
    /** Send a `checkExchange` to the underlying channel. */
    checkExchange(exchange: string): Promise<amqplib.Replies.Empty>;
    /** Send a `deleteExchange` to the underlying channel. */
    deleteExchange(exchange: string, options?: Options.DeleteExchange): Promise<amqplib.Replies.Empty>;
    /** Send a `unbindExchange` to the underlying channel. */
    unbindExchange(destination: string, source: string, pattern: string, args?: any): Promise<amqplib.Replies.Empty>;
    /** Send a `get` to the underlying channel. */
    get(queue: string, options?: Options.Get): Promise<amqplib.GetMessage | false>;
}
