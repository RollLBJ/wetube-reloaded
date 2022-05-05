import express from 'express';
import morgan from 'morgan';

const PORT = 4000;

const app = express();
const loggerMiddleware = morgan('dev');

const handleHome = (req, res, next) => {
  // 홈(root) 경로를 접속할 시에 실행하는 함수
  return res.send('hello this is response'); // 페이지에 해당 메세지를 띄움
};

app.use(loggerMiddleware);
// 전단에서 적용되는 함수

app.get('/', handleHome);
// 해당 라우트에서 작동하는 함수

const handleListening = () =>
  console.log(`✅ Server listening on port http://localhost:${PORT} 🚀`);

app.listen(PORT, handleListening);
