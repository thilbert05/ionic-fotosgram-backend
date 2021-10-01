import { NextFunction, Request, Response } from 'express';
import Token from '../classes/token';

export const verificaToken = (
	req: any,
	res: Response,
	next: NextFunction
) => {
	
		
		const userToken = req.header('x-token') || '';
		Token.validarToken(userToken)
			.then((decoded) => {
				if (!decoded) {
					const error = new Error('Token incorrecto');
					const code = 404;
					throw { error, code };
				}
				console.log('Decoded', decoded);
				req.usuario = decoded.usuario;
				next();
			})
			.catch((err) => {
				console.log(err);
				next(err);
			});
	
};