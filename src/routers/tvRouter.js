import express from 'express';
import { body, validationResult } from 'express-validator';

import {
    series,
    singleSerie,
    seriesSeason
} from './../tv.js'
import { catchErrors } from './../utils.js'





export const router = express.Router();

/**
 * Error handlers
 */
export const validationMiddleware = [ // BREYTA
    body('username')
        .isLength({ min: 1, max: 256 })
        .withMessage('username is required, max 256 characters'),
    body('password')
        .isLength({ min: 10, max: 256 })
        .withMessage('password is required, min 10 characters, max 256 characters'),
];
export async function validationCheck(req, res, next) {

    const validation = validationResult(req);

    if (!validation.isEmpty()) {
        return res.json({ errors: validation.errors });
    }

    return next();
}

/** LessGetit */
router.get('/', catchErrors(series))
router.get('/:id', catchErrors(singleSerie))
router.get('/:id/season', catchErrors(seriesSeason))