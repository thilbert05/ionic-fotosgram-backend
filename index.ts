import Server from './classes/server';
import express, {Request, Response, NextFunction} from 'express';
import fileupload from 'express-fileupload';

import userRoutes from './routes/usuario';
import postRoutes from './routes/post';

import mongoose from 'mongoose';

const server = new Server();

//Express Body parser

server.app.use(express.urlencoded({extended: true}));
server.app.use(express.json());

//FileUpload

server.app.use(fileupload({useTempFiles: true}));

//Usar rutas

server.app.use('/user', userRoutes);
server.app.use('/posts', postRoutes);

//Manejo de errores
server.app.use((err, req: Request, res: Response, next: NextFunction) => {
  if (err.code && err.error.message) {
    return res.status(err.code).json({
      ok: false,
      message: err.error.message
    });
  } else if(err.errors) {
    if (err.errors.email) {
      return res.status(500).json({
        ok: false,
        message: err.errors.email.message
      });
    } else if (err.errors.nombre) {
      return res.status(500).json({
        ok: false,
        message: err.errors.nombre.message
      });
    } else if (err.errors.usuario) {
      return res.status(500).json({
        ok: false,
        message: err.errors.usuario.message
      });
    }
  } else {
    // console.log('Error', err);
    return res.status(500).json({
      ok: false,
      message: err.message
    });
  }
});

//ConectarDB

mongoose.connect('mongodb://localhost:27017/fotosgram', (err) => {
  if (err) {
    throw err;
  } else {
    console.log('Conectado a la base de datos');

    //Levantar Express
    
    server.start(() => {
      console.log(`Servidor corriendo en el puerto ${server.port}`);
    });
  }
});
