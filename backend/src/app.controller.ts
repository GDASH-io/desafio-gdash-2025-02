import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
    @Get()
    getHello(): string {
        return `
            <html>
                <body style="font-family: sans-serif; text-align: center; padding-top: 50px;">
                    <h1>GDASH API is running 🚀</h1>
                    <p>This is the backend API service.</p>
                    <p>To access the Dashboard, please visit: <a href="http://localhost:5173">http://localhost:5173</a></p>
                </body>
            </html>
        `;
    }
}
