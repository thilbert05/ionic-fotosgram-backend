"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const uniqid_1 = __importDefault(require("uniqid"));
class FileSystem {
    constructor() {
    }
    guardarImagenTemporal(file, userId) {
        return new Promise((resolve, reject) => {
            // Crear Carpetas
            const path = this.crearCarpetaUsuario(userId);
            //Nombre del Archivo
            const nombreArchivo = this.generarNombreUnico(file.name);
            //mover el archivo a la carpeta del usuario/temp
            file.mv(`${path}/${nombreArchivo}`, (err) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(nombreArchivo);
                }
            });
        });
    }
    generarNombreUnico(nombreOriginal) {
        const nombreArr = nombreOriginal.split('.');
        const extension = nombreArr[nombreArr.length - 1];
        //crear el nombre unico
        const idUnico = uniqid_1.default();
        return `${idUnico}.${extension}`;
    }
    imagenesTempAPost(userId) {
        const pathTemp = path_1.default.resolve(__dirname, '..', 'uploads', userId, 'temp');
        const pathPost = path_1.default.resolve(__dirname, '..', 'uploads', userId, 'posts');
        if (!fs_1.default.existsSync(pathTemp)) {
            return [];
        }
        if (!fs_1.default.existsSync(pathPost)) {
            fs_1.default.mkdirSync(pathPost);
        }
        const imagenesTemp = this.obtenerImagenesEnTemp(userId);
        imagenesTemp.forEach(imagen => {
            fs_1.default.renameSync(`${pathTemp}/${imagen}`, `${pathPost}/${imagen}`);
        });
        return imagenesTemp;
    }
    getFotoUrl(userId, img) {
        //path Posts
        const pathPhoto = path_1.default.resolve(__dirname, '..', 'uploads', userId, 'posts', img);
        const pathImgNoImg = path_1.default.resolve(__dirname, '..', 'assets', '400x250.jpeg');
        //verificar si la imagen existe
        if (!fs_1.default.existsSync(pathPhoto)) {
            return pathImgNoImg;
        }
        // console.log(pathFoto);
        return pathPhoto;
    }
    obtenerImagenesEnTemp(userId) {
        const pathTemp = path_1.default.resolve(__dirname, '..', 'uploads', userId, 'temp');
        return fs_1.default.readdirSync(pathTemp) || [];
    }
    crearCarpetaUsuario(userId) {
        const pathUser = path_1.default.resolve(__dirname, '..', 'uploads', userId);
        const pathUserTemp = pathUser + '/temp';
        // console.log(pathUser);
        if (!fs_1.default.existsSync(pathUser)) {
            fs_1.default.mkdirSync(pathUser);
            fs_1.default.mkdirSync(pathUserTemp);
        }
        return pathUserTemp;
    }
}
exports.default = FileSystem;
