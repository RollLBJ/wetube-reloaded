import express from 'express';
import { join, login } from '../controllers/userController';
import { home, search, deleteVideoInHome } from '../controllers/videoController';

const rootRouter = express.Router();

rootRouter.get('/', home);
rootRouter.post('/', deleteVideoInHome);
rootRouter.get('/join', join);
rootRouter.get('/login', login);
rootRouter.get('/search', search);

export default rootRouter;
