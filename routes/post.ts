import { Router, Request, Response, NextFunction } from 'express';
import { FileUpload } from '../interfaces/file-upload';
import { verificaToken } from '../middlewares/auth';
import { Post } from '../models/post.model';
import FileSystem from '../classes/file-system';

const postRoutes = Router();
const fileSystem = new FileSystem();

//Obtener Post Paginados
postRoutes.get('/', async (req: any, res: Response, next: NextFunction) => {
  const pagina = +req.query.pagina || 1;
  const porPagina = +req.query.porPagina || 10;
  let skip = pagina - 1;
  skip = skip * porPagina;
  const posts = await Post.find()
                          .sort({_id: -1})
                          .skip(skip)
                          .limit(porPagina)
                          .populate('usuario', '-password')
                          .exec();
  res.json({
    ok: true,
    pagina,
    posts
  })
});

//Crear Post
postRoutes.post(
	'/',
	verificaToken,
	(req: any, res: Response, next: NextFunction) => {
    const body = req.body;
    body.usuario = req.usuario._id;

    const imagenes = fileSystem.imagenesTempAPost(req.usuario._id);
    body.imgs = imagenes;

    Post.create(body).then(async (postDB) => {
      await postDB.populate('usuario', '-password');
      if (!postDB) {
        const error = new Error('No se pudo crear el post');
        const code = 500;
        throw {code, error};
      }
      res.json({
        ok: true,
        post: postDB
      })
    }).catch((err) => {
      next(err);
    });

  }
);

//Servicio para subir archivo

postRoutes.post('/upload', [verificaToken], async (req: any, res: Response, next: NextFunction) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).json({
      ok: false,
      message: 'No se subio ningun archivo'
    });
  }
  const file: FileUpload = req.files.image

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
    const nombreArchivo = await fileSystem.guardarImagenTemporal(file, req.usuario._id);
    if (nombreArchivo) {
      return res.json({
        ok: true,
        file: file.mimetype
      });
    }
    
  } catch (err) {
    next(err);
  }

})

postRoutes.get('/imagen/:userId/:img', (req: any, res: Response, next: NextFunction) => {
  const userId = req.params.userId;
  const img = req.params.img;

  const pathPhoto = fileSystem.getFotoUrl(userId, img);
  // console.log(pathPhoto);
  res.sendFile(pathPhoto);
});



export default postRoutes;
