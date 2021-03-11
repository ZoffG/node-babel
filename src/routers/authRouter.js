import { Router } from 'express';
import argon2 from 'argon2';
// import { v4 as uuidv4 } from 'uuid';
import User from '../models/userModel';
import jwt from 'jsonwebtoken';
import registerSchema from '../validation/authRegisterUser';
import loginSchema from '../validation/authLoginUser';

const SECRET = process.env.SECRET;

const router = Router();

router.post('/register', async (req, res, next) => {
  try {
    const { body } = req;

    const validValues = await registerSchema.validateAsync(body);
    console.log('validValues:', validValues);

    const { username, email, password } = validValues;

    const checkUsername = await User.findOne({ username });
    if (checkUsername) {
      return res.status(400).json({ error: 'Username is taken' });
    }

    const checkEmail = await User.findOne({ email });
    if (checkEmail) {
      return res.status(400).json({ error: 'email is taken' });
    }

    const hash = await argon2.hash(password);

    const user = new User({
      ...body,
      usernameLowercase: username.toLowerCase(),
      password: hash,
    });

    user.password = hash;

    await user.save();

    return res.status(201).json({ success: true });
  } catch (e) {
    if (e.message.startsWith('Invalid')) {
      return res.status(400).json({ error: e.message });
    }
    next(e);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    // login with username
    const { body } = req;

    const validValues = await loginSchema.validateAsync(body);
    console.log('validValues:', validValues);

    const { username, password } = validValues;

    const checkUser = await User.findOne({
      usernameLowercase: username.toLowerCase(),
    });
    if (!Boolean(checkUser)) {
      return res.status(404).json({ error: 'User not found!' });
    }

    if (!(await argon2.verify(checkUser.password, password))) {
      return res.status(400).json({ error: 'Incorrect Password' });
    }

    const header = {
      alg: 'HS256',
      typ: 'JWT',
    };

    const payload = {
      sub: checkUser._id,
      name: checkUser.username,
      data: { owner: [], admin: [] },
    };

    const jwtToken = jwt.sign(payload, SECRET);
    console.log(jwtToken);

    return res.status(200).json({ success: true, jwtToken });
  } catch (e) {
    if (e.message.startsWith('Invalid')) {
      return res.status(400).json({ error: e.message });
    }

    next(e);
  }
});

export default router;
