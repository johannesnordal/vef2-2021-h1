import express from 'express';
import dotenv from 'dotenv';
import { body, validationResult } from 'express-validator';
import xss from 'xss';

import {isAdmin} from './db.js'
import {getUsers} from './users.js'
import passport from './login.js'
import {catchErrors} from './utils.js'
import {
  login,
  requireAuthentication
} from './login.js';
import {  register} from './register.js'


dotenv.config();

const {
  PORT: port = 3000,
} = process.env;

const app = express();
export const router = express.Router();

// Notum JSON middleware til að geta tekið við JSON frá client
router.use(express.json());
router.use(passport.initialize());

router.get('/', (rew, res) => {
  res.json({ maggi: "hallo heimur" })
})

/**
 * Error handlers
 */
export const emailPattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
export const validationMiddleware = [
  body('username')
    .isLength({ min: 1 , max:256})
    .withMessage('username is required, max 256 characters'),
  body('password')
    .isLength({ min: 10, max: 256 })
    .withMessage('password is required, min 10 characters, max 256 characters'),
  body('email')
    .matches(new RegExp(emailPattern))
    .withMessage('email is required, max 256 characters')
];
export async function validationCheck(req, res, next) {
  const {
    username, email, password,
  } = req.body;
  const validation = validationResult(req);

  if (!validation.isEmpty()) {
    return res.json({  errors: validation.errors });
  }

  return next();
}
const xssSanitizationMiddleware = [
  body('username').customSanitizer((v) => xss(v)),
  body('email').customSanitizer((v) => xss(v)),
  body('password').customSanitizer((v) => xss(v)),
];
/**
 * POSTS
 */
router.post('/tv/:id/season/:id/episode/:id', func);
router.post('/tv/:id/season/:id/episode', func);
router.post('/tv/:id/season/:id', func);
router.post('/tv/:id/season', func);
router.post('/tv/:id', func);
router.post('/tv', func);

router.post('/genres', func);

router.post('/users/register',xssSanitizationMiddleware,validationMiddleware,validationCheck,catchErrors(register));
router.post('/users/login', catchErrors(login));

router.post('/users/:id', func);
router.post('/users/me',func);
router.get('/users', requireAuthentication,isAdmin,catchErrors(getUsers));
//router.get('/users', requireAuthentication,catchErrors(getUsers));

app.use('/', router);

app.listen(port, () => {
  console.info(`Server running at http://localhost:${port}/`);
});

function func(req,res){
  console.log("Ekki alvöru fall")
}