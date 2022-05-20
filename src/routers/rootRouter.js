import express from 'express';
import {
  getJoin,
  postJoin,
  getLogin,
  postLogin,
} from '../controllers/userController';
import {
  home,
  search,
  deleteVideoInHome,
} from '../controllers/videoController';

const rootRouter = express.Router();

rootRouter.route('/').get(home).post(deleteVideoInHome);
rootRouter.route('/join').get(getJoin).post(postJoin);
rootRouter.route('/login').get(getLogin).post(postLogin);
rootRouter.get('/search', search);

export default rootRouter;
