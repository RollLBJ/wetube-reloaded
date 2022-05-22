import express from 'express';
import {
  logout,
  see,
  startGithubLogin,
  finishGithubLogin,
  startKakaoLogin,
  finishKakaoLogin,
} from '../controllers/userController';

const userRouter = express.Router();

userRouter.get(':id', see);
userRouter.get('/logout', logout);
userRouter.get('/github/start', startGithubLogin);
userRouter.get('/github/finish', finishGithubLogin);
userRouter.get('/kakao/start', startKakaoLogin);
userRouter.get('/kakao/finish', finishKakaoLogin);

export default userRouter;
