import { FileUpload } from '../interfaces/file-upload';
import fs from 'fs';
import path from 'path';
import uniqid from 'uniqid';

export default class FileSystem {
  constructor() {

  }

  guardarImagenTemporal(file: FileUpload, userId: string) {

    return new Promise((resolve, reject) => {
      // Crear Carpetas
      const path = this.crearCarpetaUsuario(userId);
  
      //Nombre del Archivo
      const nombreArchivo = this.generarNombreUnico(file.name);
      
      //mover el archivo a la carpeta del usuario/temp
      file.mv(`${path}/${nombreArchivo}`,(err) => {
        if (err) {
          reject(err)
        } else {
          resolve(nombreArchivo);
        }
      });
      
    });

  }

  private generarNombreUnico(nombreOriginal:string) {
    const nombreArr = nombreOriginal.split('.');
    const extension = nombreArr[nombreArr.length - 1];

    //crear el nombre unico
    const idUnico = uniqid();

    return `${idUnico}.${extension}`;

  }

  imagenesTempAPost(userId: string) {
    const pathTemp = path.resolve(__dirname, '..', 'uploads', userId, 'temp');
    const pathPost = path.resolve(__dirname, '..', 'uploads', userId, 'posts');

    if (!fs.existsSync(pathTemp)) {
      return [];
    }
    if (!fs.existsSync(pathPost)) {
      fs.mkdirSync(pathPost);
    }

    const imagenesTemp = this.obtenerImagenesEnTemp(userId);

    imagenesTemp.forEach(imagen => {
      fs.renameSync(`${pathTemp}/${imagen}`, `${pathPost}/${imagen}`)
    })

    return imagenesTemp;
  }

  getFotoUrl(userId: string, img: string) {
    //path Posts
    const pathPhoto = path.resolve(__dirname, '..', 'uploads', userId, 'posts', img);
    const pathImgNoImg = path.resolve(__dirname, '..', 'assets', '400x250.jpeg')
    //verificar si la imagen existe
    if (!fs.existsSync(pathPhoto)) {
      return pathImgNoImg;
    }
    // console.log(pathFoto);
    
    return pathPhoto;
  }

  private obtenerImagenesEnTemp(userId: string) {
    const pathTemp = path.resolve(__dirname, '..', 'uploads', userId, 'temp');

    return fs.readdirSync(pathTemp) || [];
  }

  private crearCarpetaUsuario(userId: string) {
    const pathUser = path.resolve(__dirname, '..', 'uploads', userId);
    const pathUserTemp = pathUser + '/temp';
    // console.log(pathUser);

    if (!fs.existsSync(pathUser)) {
      fs.mkdirSync(pathUser);
      fs.mkdirSync(pathUserTemp);
    }
    return pathUserTemp;
  }

}