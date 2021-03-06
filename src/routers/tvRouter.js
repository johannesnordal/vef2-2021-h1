import express from 'express';
import { body, validationResult } from 'express-validator';

import {
  get,
  post,
  patch,
  takeOut,
} from '../tv.js';
import {
  requireAuthentication,
  maybeAuthentication,
} from '../login.js';
import { catchErrors } from '../utils.js';
import { isAdmin } from '../users.js';

export const router = express.Router();

/**
 * Validators
 */
const dateFormat = /[0-9]{4}-[0-9]{1,2}-[0-9]{1,2}/;
export const serieValidationMiddleware = [
  body('name')
    .isLength({ min: 1, max: 128 })
    .withMessage('username is required, max 128 characters'),
  body('airdate')
    .matches(new RegExp(dateFormat))
    .withMessage('airdate must be a date. Format yyyy-mm-dd'),
  body('inproduction')
    .isLength({ min: 1, max: 5 })
    .withMessage('inproduction is required'),
  body('inproduction')
    .isBoolean()
    .withMessage('inproduction must be a boolean'),
  body('image')
    .isLength({ min: 1, max: 256 })
    .withMessage('image is required'),
  body('description')
    .isString()
    .withMessage('description must be a string'),
  body('language')
    .isString()
    .withMessage('language must be a string of length 2'),
  body('language')
    .isLength(2)
    .withMessage('language must be a string of length 2'),
];

export const seasonValidationMiddleware = [
  body('name')
    .isLength({ min: 1, max: 128 })
    .withMessage('username is required, max 128 characters'),
  body('number')
    .isInt({ min: 1 })
    .withMessage('number must be an integer larger than 0'),
  body('image')
    .isString({ min: 1, max: 512 })
    .withMessage('image is required, must be string (url)'),
  body('overview')
    .isString()
    .withMessage('overview must be a string'),
];

const episodeValidationMiddleware = [
  body('name')
    .isLength({ min: 1, max: 128 })
    .withMessage('username is required, max 128 characters'),
  body('number')
    .isInt({ min: 1 })
    .withMessage('number must be an integer larger than 0'),
  body('overview')
    .isString()
    .withMessage('overview must be a string'),
];

export async function validationCheck(req, res, next) {
  const validation = validationResult(req);
  if (!validation.isEmpty()) {
    return res.json({ errors: validation.errors });
  }
  return next();
}

/** **** GET ROUTERS ***** */
router.get('/', catchErrors(get.series));
router.get('/:id',
  maybeAuthentication, // Tékkar hvort notandi er loggaður inn
  catchErrors(get.singleSerie));
router.get('/:id/season', catchErrors(get.seasons));
router.get('/:id/season/:seasonID', catchErrors(get.singleSeason));
router.get('/:id/season/:seasonID/episode/:episodeID', catchErrors(get.singleEpisode)); /** Óklárað */

/** ************ POST ROUTERS ********* */
router.post('/',
  requireAuthentication,
  isAdmin,
  serieValidationMiddleware,
  validationCheck,
  catchErrors(post.serie));

router.post('/:id/season',
  requireAuthentication,
  isAdmin,
  seasonValidationMiddleware,
  validationCheck,
  catchErrors(post.season));
router.post('/:id/season/:seasonID/episode',
  requireAuthentication,
  isAdmin,
  episodeValidationMiddleware,
  validationCheck,
  catchErrors(post.episode));

/** ********** PATCH ROUTERS */
router.patch('/:id',
  requireAuthentication,
  isAdmin,
  catchErrors(patch.serie));

/** ********** DELETE ROUTERS */
router.delete('/:id',
  isAdmin,
  catchErrors(takeOut.serie));
router.delete('/:id/season/:seasonID',
  isAdmin,
  catchErrors(takeOut.season));
router.delete('/:id/season/:seasonID/episode/:episodeID',
  isAdmin,
  catchErrors(takeOut.episode));

/** * Rate og state */
/** **** POST ****** */
router.post('/:id/rate',
  requireAuthentication,
  catchErrors(post.usersRate));
router.post('/:id/state',
  requireAuthentication,
  catchErrors(post.userState));

/** Patch */
router.patch('/:id/rate',
  requireAuthentication,
  catchErrors(patch.usersRate));
router.patch('/:id/state',
  requireAuthentication,
  catchErrors(patch.usersRate));

/** Delete */
router.delete('/:id/rate',
  requireAuthentication,
  catchErrors(takeOut.usersRate));
router.delete('/:id/state',
  requireAuthentication,
  catchErrors(takeOut.usersState));
