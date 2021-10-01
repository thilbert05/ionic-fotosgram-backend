import jwt, { JsonWebTokenError, JwtPayload } from 'jsonwebtoken';

export default class Token {
	private static seed: string = 'este-es-un-super-login-token';

	private static caducidad: string = '30d';

	constructor() {}

	static getJwtToken(payload: any): string {
		return jwt.sign(
			{
				usuario: payload,
			},
			this.seed,
			{ expiresIn: this.caducidad }
		);
	}

	static validarToken(userToken: string): Promise<JwtPayload> {
		return new Promise((resolve, reject) => {
			jwt.verify(
				userToken,
				this.seed,
				(err: JsonWebTokenError, decoded: JwtPayload) => {
					if (err) {
						//no confiar
						console.log(err);
						reject(err);
					} else {
						resolve(decoded);
					}
				}
			);
		});
	}
} 