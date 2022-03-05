const express = require('express');
const app = express();
const port = 5000;
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const config = require('./config/key');

app.use(bodyParser.urlencoded({ extended: true }));

app.use(bodyParser.json());

app.use(cookieParser());

const { User } = require('./model/User');

const { auth } = require('./middleware/auth');

const mongoose = require('mongoose');
mongoose
  .connect(config.mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    //   useCreateIndex: true,
    //   useFindAndModify: false,
  })
  .then(() => console.log('MongoDB Connected...'))
  .catch((err) => console.log(err));

app.get('/', (req, res) => res.send('Hello World! 메롱하세요!'));
app.post('/api/users/register', (req, res) => {
  //회원가입에 필요한 정보들을 client 에서 가져오면
  //데이터 베이스에 넣어준다.

  const user = new User(req.body);
  user.save((err, userInfo) => {
    if (err) {
      return res.json({ success: false, err });
    }
    return res.status(200).json({
      success: true,
    });
  });
});

app.post('/api/users/login', (req, res) => {
  //요청된 이메일을 데이터베이스에서 가져옴
  User.findOne({ email: req.body.email }, (err, user) => {
    if (!user) {
      return res.json({
        loginsuccess: false,
        message: '제공된 이메일에 해당하는 유저가 없습니다.',
      });
    } else {
      user.comparePassword(req.body.password, (err, isMatch) => {
        if (!isMatch)
          return res.json({
            loginsuccess: false,
            message: '비밀번호가 틀렸습니다.',
          });
        user.generateToken((err, user) => {
          if (err) return res.status(400).send(err);

          //토큰을 저장한다... 어디에?
          //쿠키or 로컬스토리지

          res
            .cookie('x_auth', user.token)
            .status(200)
            .json({ loginsuccess: true, userId: user._id });
        });
      });
    }
  });
  //이메일이 있다면 맞는 비번인지 확인
  //비번까지 맞다면 토큰생성
});

app.post('api/users/auth', auth, (req, res) => {
  //여기까지 미들웨어 통과한건 authentication이 true
  res.status(200).json({
    _id: req.user._id,
    isAdmin: req.user.role === 0 ? false : true,
    email: req.user.email,
    name: req.user.name,
    lastname: req.user.lastname,
    role: req.user.role,
    image: req.user.image,
  });
});

app.listen(port, () => console.log('Example app listening on' + port + '!'));
