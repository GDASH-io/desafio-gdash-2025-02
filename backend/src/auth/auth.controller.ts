import { Controller, Post, Body, Res, Get, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Post('login')
	async login(@Body() body: LoginDto, @Res() res: Response) {
		const { user, accessToken, expiresIn } = await this.authService.login(body);
		res.cookie('access_token', accessToken, {
			httpOnly: true,
			secure: true, // ajuste para false em dev sem HTTPS se necessário
			sameSite: 'lax',
			maxAge: expiresIn * 1000
		});
		return res.json({ user, expiresIn });
	}

	@Post('logout')
	@UseGuards(JwtAuthGuard)
	async logout(@Res() res: Response) {
		res.clearCookie('access_token');
		return res.json({ loggedOut: true });
	}

	@Get('me')
	@UseGuards(JwtAuthGuard)
	async me(@Res() res: Response) {
		// usuário já validado pela estratégia; payload está em req.user
		const req: any = res.req;
		return res.json({ user: req.user });
	}
}
