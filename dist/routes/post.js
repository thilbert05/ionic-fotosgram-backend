"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middlewares/auth");
const post_model_1 = require("../models/post.model");
const file_system_1 = __importDefault(require("../classes/file-system"));
const postRoutes = express_1.Router();
const fileSystem = new file_system_1.default();
//Obtener Post Paginados
postRoutes.get('/', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const pagina = +req.query.pagina || 1;
    const porPagina = +req.query.porPagina || 10;
    let skip = pagina - 1;
    skip = skip * porPagina;
    const posts = yield post_model_1.Post.find()
        .sort({ _id: -1 })
        .skip(skip)
        .limit(porPagina)
        .populate('usuario', '-password')
        .exec();
    res.json({
        ok: true,
        pagina,
        posts
    });
}));
//Crear Post
postRoutes.post('/', auth_1.verificaToken, (req, res, next) => {
    const body = req.body;
    body.usuario = req.usuario._id;
    const imagenes = fileSystem.imagenesTempAPost(req.usuario._id);
    body.imgs = imagenes;
    post_model_1.Post.create(body).then((postDB) => __awaiter(void 0, void 0, void 0, function* () {
        yield postDB.populate('usuario', '-password');
        if (!postDB) {
            const error = new Error('No se pudo crear el post');
            const code = 500;
            throw { code, error };
        }
        res.json({
            ok: true,
            post: postDB
        });
    })).catch((err) => {
        next(err);
    });
});
//Servicio para subir archivo
postRoutes.post('/upload', [auth_1.verificaToken], (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).json({
            ok: false,
            message: 'No se subio ningun archivo'
        });
    }
    const file = req.files.image;
    if (!file) {
        return res.status(400).json({
            ok: false,
            message: 'No se subio ningun archivo - image'
        });
    }
    if (!file.mimetype.includes('image')) {
        return res.status(400).json({
            ok: false,
            message: 'El archivo no es una imagen'
        });
    }
    try {
        const nombreArchivo = yield fileSystem.guardarImagenTemporal(file, req.usuario._id);
        if (nombreArchivo) {
            return res.json({
                ok: true,
                file: file.mimetype
            });
        }
    }
    catch (err) {
        next(err);
    }
}));
postRoutes.get('/imagen/:userId/:img', (req, res, next) => {
    const userId = req.params.userId;
    const img = req.params.img;
    const pathPhoto = fileSystem.getFotoUrl(userId, img);
    // console.log(pathPhoto);
    res.sendFile(pathPhoto);
});
exports.default = postRoutes;
