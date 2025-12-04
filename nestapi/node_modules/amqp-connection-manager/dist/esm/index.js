/* eslint-disable @typescript-eslint/no-namespace */
import AmqpConnectionManager from './AmqpConnectionManager.js';
export function connect(urls, options) {
    const conn = new AmqpConnectionManager(urls, options);
    conn.connect().catch(() => {
        /* noop */
    });
    return conn;
}
export { AmqpConnectionManager as AmqpConnectionManagerClass };
const amqp = { connect };
export default amqp;
//# sourceMappingURL=index.js.map