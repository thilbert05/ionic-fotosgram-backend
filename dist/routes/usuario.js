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
const usuario_model_1 = require("../models/usuario.model");
const bcrypt_1 = __importDefault(require("bcrypt"));
const token_1 = __importDefault(require("../classes/token"));
const auth_1 = require("../middlewares/auth");
const userRoutes = express_1.Router();
//Login
userRoutes.post('/login', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const body = req.body;
    try {
        const usuarioDB = yield usuario_model_1.Usuario.findOne({ email: body.email });
        if (!usuarioDB) {
            const error = new Error();
            error.message = 'El usuario no existe en la base de datos';
            const code = 404;
            throw { error, code };
        }
        const passwordDecoded = usuarioDB.compararPassword(body.password);
        if (passwordDecoded) {
            const token = token_1.default.getJwtToken({
                _id: usuarioDB._id,
                nombre: usuarioDB.nombre,
                email: usuarioDB.email,
                avatar: usuarioDB.avatar
            });
            res.json({
                ok: true,
                token
            });
        }
        else {
            const error = new Error();
            error.message = 'Contraseña incorrecta';
            const code = 401;
            throw { error, code };
        }
    }
    catch (err) {
        next(err);
    }
}));
//Crear un usuario
userRoutes.post('/create', (req, res, next) => {
    const { nombre, email, password, avatar } = req.body;
    const user = {
        nombre,
        email,
        password,
        avatar
    };
    usuario_model_1.Usuario.findOne({ email })
        .then(userDB => {
        console.log(userDB);
        if (userDB) {
            const error = new Error();
            error.message = 'El usuario ya existe en la base de datos';
            const code = 500;
            throw { error, code };
        }
        const hashedPassword = bcrypt_1.default.hashSync(user.password, 12);
        user.password = hashedPassword;
        return usuario_model_1.Usuario.create(user);
    })
        .then(userDB => {
        const token = token_1.default.getJwtToken({
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
    });
});
//actualizar usuarios
userRoutes.post('/update', [auth_1.verificaToken], (req, res, next) => {
    const user = {
        nombre: req.body.nombre,
        email: req.body.email,
        avatar: req.body.avatar
    };
    usuario_model_1.Usuario.findByIdAndUpdate(req.usuario._id, user, {
        new: true
    }).then(userDB => {
        if (!userDB) {
            const error = new Error('No existe un usuario con este id');
            const code = 500;
            throw { code, error };
        }
        const token = token_1.default.getJwtToken({
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
    });
});
exports.default = userRoutes;
