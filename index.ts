import Server from './classes/server';
import userRoutes from './routes/usuario';
import mongoose from 'mongoose';
import express from 'express';
import {Request, Response, NextFunction} from 'express';

const server = new Server();

//Express Body parser

server.app.use(express.urlencoded({extended: true}));
server.app.use(express.json());

//Usar rutas

server.app.use('/user', userRoutes);

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
    }
  } else {
    console.log('Error', err);
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
