import express from 'express';
import { body, validationResult } from 'express-validator';
import xss from 'xss';

import {
  getUsers,
  getSingleUser,
  patchUser,
  paramCheckUser,
  getMe,
  patchMeUp,
  isAdmin,
} from '../users.js';
import {
  login,
  requireAuthentication,
} from '../login.js';
import { catchErrors } from '../utils.js';
import { register } from '../register.js';

export const router = express.Router();

/**
 * Validators
 */
const emailPattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const validationMiddleware = [
  body('username')
    .isLength({ min: 1, max: 256 })
    .withMessage('username is required, max 256 characters'),
  body('password')
    .isLength({ min: 10, max: 256 })
    .withMessage('password is required, min 10 characters, max 256 characters'),
  body('email')
    .matches(new RegExp(emailPattern))
    .withMessage('email is required, max 256 characters'),
];
export const validationUpdateUser = [
  body('password')
    .isLength({ min: 10, max: 256 })
    .optional({ nullable: true })
    .withMessage('min 10 characters, max 256 characters'),
  body('email')
    .matches(new RegExp(emailPattern))
    .optional({ nullable: true })
    .withMessage('Needs to be email, max 256 characters'),
];
export async function validationCheck(req, res, next) {
  const validation = validationResult(req);

  if (!validation.isEmpty()) {
    return res.json({ errors: validation.errors });
  }
  return next();
}

const xssSanitizationMiddleware = [
  body('username').customSanitizer((v) => xss(v)),
  body('email').customSanitizer((v) => xss(v)),
  body('password').customSanitizer((v) => xss(v)),
];
router.use(xssSanitizationMiddleware);

/** ** GET ROUTERS */
router.get('/',
  requireAuthentication,
  isAdmin,
  catchErrors(getUsers));
router.get('/me',
  requireAuthentication,
  catchErrors(getMe));
router.get('/:id',
  requireAuthentication,
  isAdmin,
  paramCheckUser,
  catchErrors(getSingleUser));

/** * POST ROUTERS ** */
router.post('/register',
  validationMiddleware,
  validationCheck,
  catchErrors(register));
router.post('/login',
  validationMiddleware,
  validationCheck,
  catchErrors(login));

/** ** PATCH ROUTERS */
router.patch('/me',
  requireAuthentication,
  validationUpdateUser,
  validationCheck,
  catchErrors(patchMeUp));
router.patch('/:id',
  requireAuthentication,
  isAdmin,
  paramCheckUser,
  catchErrors(patchUser));
