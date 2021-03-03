import { Router } from 'express';
import User from '../models/userModel';

const router = Router();

router.post('/register', async (req, res, next) => {
  try {
    const { body } = req;
    console.log(body);

    if (
      !body.hasOwnProperty('username') ||
      !body.hasOwnProperty('password') ||
      !body.hasOwnProperty('email')
    ) {
      return res.status(400).json({
        error: 'Username, email and password required!',
      });
    }
    const { username, email, password } = body;

    const checkUsername = await User.findOne({ username });
    if (checkUsername) {
      return res.status(400).json({ error: 'Username is taken' });
    }

    const checkEmail = await User.findOne({ email });
    if (checkEmail) {
      return res.status(400).json({ error: 'email is taken' });
    }

    const user = new User(body);
    await user.save();

    return res.status(201).json({ success: true });
  } catch (e) {
    next(e);
  }
});
export default router;
