import User from '../models/User';
import fetch from 'node-fetch';
import bcrypt from 'bcrypt';
import { param } from 'express/lib/request';

export const getJoin = (req, res) => {
  res.render('join', { pageTitle: 'Join' });
};

export const postJoin = async (req, res) => {
  const { name, username, password, password2, email, location } = req.body;
  if (password !== password2) {
    return res.status(400).render('join', {
      pageTitle: 'Join',
      errorMessage: 'Password confirmation does not match.',
    });
  }

  const exists = await User.exists({ $or: [{ username }, { email }] });
  if (exists) {
    return res.status(400).render('join', {
      pageTitle: 'Join',
      errorMessage: 'This username or email is already taken.',
    });
  }
  try {
    await User.create({ name, username, password, email, location });
  } catch (error) {
    return res.status(400).render('join', {
      pageTitle: 'Create User',
      errorMessage: error._message,
    });
  }
  return res.redirect('/login');
};

export const getLogin = (req, res) =>
  res.render('login', { pageTitle: 'Login' });

export const postLogin = async (req, res) => {
  const { username, password } = req.body;
  const pageTitle = 'Login';

  const user = await User.findOne({ username, socialOnly: false });

  if (!user) {
    return res.status(400).render('login', {
      pageTitle,
      errorMessage: '이 이름으로 된 계정은 없습니다',
    });
  }

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) {
    return res.status(400).render('login', {
      pageTitle,
      errorMessage: '비밀번호가 잘못되었습니다.',
    });
  }
  console.log('logged in');
  req.session.loggedIn = true;
  req.session.user = user;
  res.redirect('/');
};

export const startGithubLogin = (req, res) => {
  const baseUrl = `https://github.com/login/oauth/authorize`;
  const config = {
    client_id: process.env.GH_CLIENT,
    allow_signup: false,
    scope: 'read:user user:email',
  };
  const params = new URLSearchParams(config).toString();
  const finalURL = `${baseUrl}?${params}`;
  return res.redirect(finalURL);
};

export const finishGithubLogin = async (req, res) => {
  const baseUrl = `https://github.com/login/oauth/access_token`;

  const config = {
    client_id: process.env.GH_CLIENT,
    client_secret: process.env.GH_SECRET,
    code: req.query.code,
  };
  const params = new URLSearchParams(config).toString();
  const finalUrl = `${baseUrl}?${params}`;

  const tokenRequest = await (
    await fetch(finalUrl, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
      },
    })
  ).json();

  if ('access_token' in tokenRequest) {
    //access api
    const { access_token } = tokenRequest;
    const apiUrl = 'https://api.github.com';
    const userData = await (
      await fetch(`${apiUrl}/user`, {
        method: 'GET',
        access_token,
        headers: { Authorization: `token ${access_token}` },
      })
    ).json();
    const emailData = await (
      await fetch(`${apiUrl}/user/emails`, {
        headers: { Authorization: `token ${access_token}` },
      })
    ).json();
    const emailObj = emailData.find(
      (email) => email.primary === true && email.verified === true
      //primary(주요 이메일)하고 verified(인증된)된 이메일을 찾음
    );
    if (!emailObj) {
      return res.redirect('/login');
    }
    let user = await User.findOne({ email: emailObj.email }); //User db에 존재하는 이메일이라면, 계정이 이미 있다는 뜻
    if (!user) {
      // 존재한 계정이 없다면 계정 생성
      user = await User.create({
        name: userData.name ? userData.name : userData.login,
        username: userData.login,
        password: '',
        email: emailObj.email,
        socialOnly: true,
        location: userData.location,
        avatarUrl: userData.avatarUrl,
      });
    }
    // 이후, 로그인 진행
    req.session.loggedIn = true;
    req.session.user = user;
    res.redirect('/');
  } else {
    // if access_token is not in tokenRequest
    res.redirect('/login');
  }
};

export const logout = (req, res) => {
  req.session.destroy();
  res.redirect('/');
};

export const startKakaoLogin = (req, res) => {
  const baseUrl = 'https://kauth.kakao.com/oauth/authorize';
  const config = {
    client_id: process.env.KAKAO_CLIENT,
    redirect_uri: 'http://localhost:4000/users/kakao/finish',
    response_type: 'code',
  };
  const params = new URLSearchParams(config).toString();

  const finalUrl = `${baseUrl}?${params}`;
  console.log(finalUrl);
  return res.redirect(finalUrl);
};

export const finishKakaoLogin = async (req, res) => {
  const baseUrl = 'https://kauth.kakao.com/oauth/token';
  const config = {
    client_id: process.env.KAKAO_CLIENT,
    client_secret: process.env.KAKAO_SECRET,
    grant_type: 'authorization_code',
    redirect_uri: 'http://localhost:4000/users/kakao/finish',
    code: req.query.code,
  };
  const params = new URLSearchParams(config).toString();
  const finalUrl = `${baseUrl}?${params}`;
  const kakaoTokenRequest = await (
    await fetch(finalUrl, {
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
      },
    })
  ).json();

  if ('access_token' in kakaoTokenRequest) {
    const { access_token } = kakaoTokenRequest;
    const userRequest = await (
      await fetch('https://kapi.kakao.com/v2/user/me', {
        headers: {
          Authorization: `Bearer ${access_token}`,
          'Content-type': 'application/json',
        },
      })
    ).json();

    const userData = userRequest.kakao_account;
    let emailData;
    if (userData.is_email_valid && userData.is_email_verified) {
      emailData = userRequest.kakao_account.email;
    }

    if (!emailData) {
      return res.redirect('/login');
    }
    let user = await User.findOne({ email: emailData }); //User db에 존재하는 이메일이라면, 계정이 이미 있다는 뜻
    if (!user) {
      // 존재한 계정이 없다면 계정 생성
      user = await User.create({
        name: userData.profile.nickname,
        username: userData.profile.nickname,
        password: '',
        email: emailData,
        socialOnly: true,
        location: '',
        avatarUrl: '',
      });
    }
    // 이후, 로그인 진행
    req.session.loggedIn = true;
    req.session.user = user;
    res.redirect('/');
  } else {
    res.redirect('/login');
  }
};

export const see = (req, res) => res.send('See User');
