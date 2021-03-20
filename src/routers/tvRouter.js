import express from 'express';
import { body, validationResult } from 'express-validator';

import {
    get,
    post,
    patch,
    takeOut
} from './../tv.js'
import { catchErrors } from './../utils.js'
import {
    isAdmin
} from './../users.js'
import {
    requireAuthentication
} from './../login.js';
import { router as seasonRouter } from './seasonRouter.js'


export const router = express.Router();

/**
 * Error handlers
 */
const dateFormat = /[0-9]{4}-[0-9]{1,2}-[0-9]{1,2}/;
export const serieValidationMiddleware = [
    body('name')
        .isLength({ min: 1, max: 128 })
        .withMessage('username is required, max 128 characters'),
    body('air_date')
        .matches(new RegExp(dateFormat))
        .withMessage('airdate must be a date. Format yyyy-mm-dd'),
    body('in_production')
        .isLength({ min: 1, max: 5 })
        .withMessage('inproduction is required'),
    body('in_production')
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
]
export async function validationCheck(req, res, next) {

    const validation = validationResult(req);
    if (!validation.isEmpty()) {
        return res.json({ errors: validation.errors });
    }

    return next();
}

/** LessGetit */
router.get('/', catchErrors(get.series))
router.get('/:id', catchErrors(get.singleSerie))
router.get('/:id/season', catchErrors(get.seasons))
router.get('/:id/season/:seasonID', catchErrors(get.singleSeason))
router.get('/:id/season/:seasonID/episode/:episodeID', catchErrors(get.singleEpisode)) /**Óklárað */

/** LessPostit */
router.post('/', serieValidationMiddleware, validationCheck, post.serie)
router.post('/:id/season', seasonValidationMiddleware, validationCheck, post.season)
router.post('/:id/season/:seasonID/episode', episodeValidationMiddleware, validationCheck, post.episode)

/** PATCH'it up */
router.patch('/:id',
    requireAuthentication,
    //isAdmin,
    patch.serie)

/**DELETe */
router.delete('/:id',takeOut.serie)
router.delete('/:id/season/:seasonID',takeOut.season)
router.delete('/:id/season/:seasonID/episode/:episodeID',takeOut.episode)



//router.use('/:id/season', seasonRouter);
