import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
    uri:
        process.env.MONGODB_URI ||
        `mongodb://${process.env.MONGO_USER || 'admin'}:${process.env.MONGO_PASS || 'admin123'}@${process.env.MONGO_HOST || 'mongodb'}:${process.env.MONGO_PORT || '27017'}/${process.env.MONGO_DB || 'gdash'}?authSource=admin`,
    options: {
        retryWrites: true,
        w: 'majority'
    }
}))