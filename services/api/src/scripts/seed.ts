import { AppModule } from "@/app.module";
import { HashService } from "@/modules/auth/infrastructure/services/hash.service";
import { UserRepository } from "@/modules/users/infrastructure/repositories/user.repository";
import { Logger } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";

async function seed() {
    const logger = new Logger('Seed')

    logger.log('Starting data seed...');

    const app = await NestFactory.createApplicationContext(AppModule);

    const userRepository = app.get(UserRepository);
    const hashService = app.get(HashService);

    try {
        const defaultEmail = process.env.DEFAULT_USER_EMAIL || 'admin@admin.com';
        const existingUser = await userRepository.findByEmail(defaultEmail);

        if (existingUser) {
            logger.log(`Default user already exists: ${defaultEmail}`);
        } else {
            const defaultPassword = process.env.DEFAULT_USER_PASSWORD || 'Admin123456';
            const hashedPassword = await hashService.hash(defaultPassword);

            await userRepository.create({
                email: defaultEmail,
                password: hashedPassword,
                name: 'Administrador',
                roles: ['admin', 'user']
            });

            logger.log('Default user created!');

            const totalUsers = await userRepository.count();
            logger.log(`📊 Total users in database: ${totalUsers}`);
            logger.log('Database seeded');
        }
    } catch (error) {
        logger.error('Seed failed:', error.message)
        throw error;
    } finally {
        await app.close()
    }
}

seed();