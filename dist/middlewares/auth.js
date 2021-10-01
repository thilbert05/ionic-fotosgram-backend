"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verificaToken = void 0;
const token_1 = __importDefault(require("../classes/token"));
const verificaToken = (req, res, next) => {
    const userToken = req.header('x-token') || '';
    token_1.default.validarToken(userToken)
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
exports.verificaToken = verificaToken;
