import AmqpConnectionManager, { AmqpConnectionManagerOptions, ConnectionUrl, IAmqpConnectionManager } from './AmqpConnectionManager.js';
import CW, { PublishOptions } from './ChannelWrapper.js';
export type { AmqpConnectionManagerOptions, ConnectionUrl, IAmqpConnectionManager as AmqpConnectionManager, } from './AmqpConnectionManager.js';
export type { CreateChannelOpts, SetupFunc, Channel } from './ChannelWrapper.js';
export type ChannelWrapper = CW;
import { Options as AmqpLibOptions } from 'amqplib';
export declare namespace Options {
    type Connect = AmqpLibOptions.Connect;
    type AssertQueue = AmqpLibOptions.AssertQueue;
    type DeleteQueue = AmqpLibOptions.DeleteQueue;
    type AssertExchange = AmqpLibOptions.AssertExchange;
    type DeleteExchange = AmqpLibOptions.DeleteExchange;
    type Publish = PublishOptions;
    type Consume = AmqpLibOptions.Consume;
    type Get = AmqpLibOptions.Get;
}
export declare function connect(urls: ConnectionUrl | ConnectionUrl[] | undefined | null, options?: AmqpConnectionManagerOptions): IAmqpConnectionManager;
export { AmqpConnectionManager as AmqpConnectionManagerClass };
declare const amqp: {
    connect: typeof connect;
};
export default amqp;
