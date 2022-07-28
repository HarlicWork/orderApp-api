const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/User');
const JWT_KEY = process.env.JWT_KEY;

// set token age (3 days)
const tokenAge = 3 * 24 * 60 * 60;

// token creation
const createToken = (id) => {
  return jwt.sign({ id }, JWT_KEY, {
    expiresIn: tokenAge,
  });
};

//error handlers
const handleErrors = (err) => {
  console.log(err.message, err.code);
  let errors = { email: '', password: '' };

  //incorrect email checks
  if (err.message === 'incorrect email') {
    errors.email = 'Email is incorrect';
  }

  //incorrect password checks
  if (err.message === 'incorrect password') {
    errors.password = 'Password is incorrect';
  }

  //duplicate error code
  if (err.code === 11000) {
    errors.email = 'email already exists';
    return errors;
  }

  //validation errors
  if (err.message.includes('user validation failed')) {
    Object.values(err.errors).map(({ properties }) => {
      errors[properties.path] = properties.message;
    });
  }
  return errors;
};

exports.user_get_all = async (req, res, next) => {
  try {
    const users = await User.find().sort({ userName: 1 });
    res.status(200).json({ users });
  } catch (err) {
    return res.status(500).json({
      error: err,
    });
  }
};

exports.user_get_by_id = async (req, res, next) => {
  const { id } = req.params;
  try {
    const users = await User.findById(id).sort({ userName: 1 });
    res.status(200).json(users);
  } catch (err) {
    return res.status(500).json({
      error: err,
    });
  }
};

exports.users_signup = async (req, res, next) => {
  const { userName, email, password } = req.body;

  try {
    // check user
    const user = await User.find({ email });
    if (user.length >= 1) {
      return res.status(409).json({
        message: 'User already exists!',
      });
    }
    // create hash password
    bcrypt.hash(password, 10, (err, hash) => {
      if (err) {
        return res.status(500).json({
          error: err,
        });
      } else {
        // create new user object
        const newUser = new User({
          _id: new mongoose.Types.ObjectId(),
          userName,
          email,
          password: hash,
          createdAt: new Date().toISOString(),
        });

        // save user credential in db then pass user id
        newUser.save().then((result) => {
          res.status(201).json({
            message: 'User successfully created',
            postId: result._id,
          });
        });
      }
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      error: err,
    });
  }
};

exports.users_login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    // check user email is exist
    const user = await User.findOne({ email });
    if (user) {
      // authenticate password
      const auth = await bcrypt.compare(password, user.password);

      // user is found
      if (auth) {
        const token = createToken(user._id);
        res.cookie('jwt', token, { httpOnly: true, maxAge: tokenAge * 1000 });
        res
          .status(200)
          .json({ user: user._id, userName: user.userName, authToken: token });
      }
    }
  } catch (err) {
    // error handler
    const errors = handleErrors(err);
    res.status(400).json({ errors });
  }
};

exports.users_logout = (req, res, next) => {
  res.cookie('jwt', '', { maxAge: 1 });
  res.status(200).json({
    message: 'Successfully logout! ',
  });
};

exports.users_delete = async (req, res, next) => {
  const { userId } = req.params;

  try {
    const result = await User.deleteOne({ _id: userId });
    res.status(200).json({
      message: 'User successfully deleted',
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      error: err,
    });
  }
};
