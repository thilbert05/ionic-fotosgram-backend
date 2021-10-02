"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = __importDefault(require("./classes/server"));
const express_1 = __importDefault(require("express"));
const express_fileupload_1 = __importDefault(require("express-fileupload"));
const usuario_1 = __importDefault(require("./routes/usuario"));
const post_1 = __importDefault(require("./routes/post"));
const mongoose_1 = __importDefault(require("mongoose"));
const server = new server_1.default();
//Express Body parser
server.app.use(express_1.default.urlencoded({ extended: true }));
server.app.use(express_1.default.json());
//FileUpload
server.app.use(express_fileupload_1.default({ useTempFiles: true }));
//Usar rutas
server.app.use('/user', usuario_1.default);
server.app.use('/posts', post_1.default);
//Manejo de errores
server.app.use((err, req, res, next) => {
    if (err.code && err.error.message) {
        return res.status(err.code).json({
            ok: false,
            message: err.error.message
        });
    }
    else if (err.errors) {
        if (err.errors.email) {
            return res.status(500).json({
                ok: false,
                message: err.errors.email.message
            });
        }
        else if (err.errors.nombre) {
            return res.status(500).json({
                ok: false,
                message: err.errors.nombre.message
            });
        }
        else if (err.errors.usuario) {
            return res.status(500).json({
                ok: false,
                message: err.errors.usuario.message
            });
        }
    }
    else {
        // console.log('Error', err);
        return res.status(500).json({
            ok: false,
            message: err.message
        });
    }
});
//ConectarDB
mongoose_1.default.connect('mongodb://localhost:27017/fotosgram', (err) => {
    if (err) {
        throw err;
    }
    else {
        console.log('Conectado a la base de datos');
        //Levantar Express
        server.start(() => {
            console.log(`Servidor corriendo en el puerto ${server.port}`);
        });
    }
});
