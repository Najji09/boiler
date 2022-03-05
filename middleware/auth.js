const { User } = require('../model/User');

let auth = (req, res, next) => {
  //인증처리
  //클라이언트 쿠키에서 토큰을 가져옴
  let token = req.cookies.x_auth;

  //토큰 복호화후 유저를 찾는다
  User.findByToken(token, (err, user) => {
    if (err) throw err;
    if (!user) return res.json({ isAuth: false, error: true });

    req.token = token;
    req.user = user;
    next();
  });
  //유저있으면 인증ok
  //유저 없으면 인증no
};

module.exports = { auth };
