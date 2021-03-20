import express from 'express';
import { body, validationResult } from 'express-validator';

import {
    getUsers,
    getSingleUser,
    patchUser,
    paramCheckUser,
    getMe,
    patchMeUp,
    isAdmin
} from './../users.js'
import {
    login,
    requireAuthentication
} from './../login.js';
import { catchErrors } from './../utils.js'
import { register } from './../register.js'




export const router = express.Router();

/**
 * Error handlers
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
        .withMessage('email is required, max 256 characters')
];
export const validationUpdateUser = [
    body('password')
        .isLength({ min: 10, max: 256 })
        .optional({ nullable: true })
        .withMessage('min 10 characters, max 256 characters'),
    body('email')
        .matches(new RegExp(emailPattern))
        .optional({ nullable: true })
        .withMessage('Needs to be email, max 256 characters')
];
export async function validationCheck(req, res, next) {

    const validation = validationResult(req);

    if (!validation.isEmpty()) {
        return res.json({ errors: validation.errors });
    }

    return next();
}



router.post('/register',
    validationMiddleware,
    validationCheck,
    catchErrors(register)
); 
router.post('/login',
    validationMiddleware,
    validationCheck,
    catchErrors(login)
);
router.get('/me',
    requireAuthentication,
    getMe
);
router.patch('/me',
    requireAuthentication,
    validationUpdateUser,
    validationCheck,
    catchErrors(patchMeUp)
); // Óklárað
router.get('/:id',
    requireAuthentication,
    isAdmin,
    paramCheckUser,
    catchErrors(getSingleUser)
);
router.patch('/:id',
    requireAuthentication,
    isAdmin,
    paramCheckUser,
    catchErrors(patchUser)
);
router.get('/',
    requireAuthentication,
    isAdmin,
    catchErrors(getUsers)
);


