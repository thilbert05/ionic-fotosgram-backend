import { NextFunction, Request, Response, Router } from 'express';
import { Usuario } from '../models/usuario.model';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Token from '../classes/token';
import { verificaToken } from '../middlewares/auth';

const userRoutes = Router();

//Login
userRoutes.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  const body = req.body;

  try {
    const usuarioDB = await Usuario.findOne({email: body.email});
    if (!usuarioDB) {
      const error = new Error();
      error.message = 'El usuario no existe en la base de datos';
      const code = 404;
      throw {error, code};
    }
    const passwordDecoded =  usuarioDB.compararPassword(body.password)
    if (passwordDecoded) {
      const token = Token.getJwtToken({
        _id: usuarioDB._id,
        nombre: usuarioDB.nombre,
        email: usuarioDB.email,
        avatar: usuarioDB.avatar
      });
      res.json({
        ok: true,
        token
      });
    } else {
      const error = new Error();
      error.message = 'Contraseña incorrecta';
      const code = 401;
      throw {error, code};
    }

  } catch (err) {
    next(err);
  }


})

//Crear un usuario
userRoutes.post('/create', (req: Request, res: Response, next: NextFunction) => {
  const {nombre, email, password, avatar} = req.body;

  const user = {
    nombre,
    email,
    password,
    avatar
  };

  Usuario.findOne({email})
  .then(userDB => {
    console.log(userDB);
    if (userDB) {
      const error = new Error();
      error.message = 'El usuario ya existe en la base de datos';
      const code = 500;
      throw {error, code};
    }
    const hashedPassword = bcrypt.hashSync(user.password, 12);
    user.password = hashedPassword;
    return Usuario.create(user)
  })
  .then( userDB => {
    const token = Token.getJwtToken({
      _id: userDB._id,
      nombre: userDB.nombre,
      email: userDB.email,
      avatar: userDB.avatar
    });
    res.json({
      ok: true,
      token
    });
  }).catch(err => {
    next(err);
  })
  
});

//actualizar usuarios

userRoutes.post(
	'/update',
	[verificaToken],
	(req: any, res: Response, next: NextFunction) => {
    
    const user = {
      nombre: req.body.nombre,
      email: req.body.email,
      avatar: req.body.avatar
    }

    Usuario.findByIdAndUpdate(req.usuario._id, user, {
      new: true
    }).then(userDB => {
      if (!userDB) {
        const error = new Error('No existe un usuario con este id');
        const code = 500;
        throw {code, error};
      }

      const token = Token.getJwtToken({
        _id: userDB._id,
        nombre: userDB.nombre,
        email: userDB.email,
        avatar: userDB.avatar
      });

      return res.json({
        ok: true,
        token
      });
    }).catch((err) => {
      next(err);
    })

	}
);

export default userRoutes;