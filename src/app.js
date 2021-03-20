import express from 'express';
import dotenv from 'dotenv';
import xss from 'xss';
import { body } from 'express-validator';


import {router as usersRouter} from './routers/usersRoute.js'
import {router as tvRouter} from './routers/tvRouter.js'
import { router as genresRouter } from './routers/genresRouter.js';

import passport from './login.js'


dotenv.config();

const {
  PORT: port = 3000,
} = process.env;

const app = express();
//export const router = express.Router();

// Notum JSON middleware til að geta tekið við JSON frá client
app.use(express.json());
app.use(passport.initialize());



app.get('/', (rew, res) => {
  res.json({ maggi: "hallo heimur" })
})

const xssSanitizationMiddleware = [
  body('username').customSanitizer((v) => xss(v)),
  body('email').customSanitizer((v) => xss(v)),
  body('password').customSanitizer((v) => xss(v)),
];
//app.use(xssSanitizationMiddleware)



app.use('/genres', genresRouter);

app.use('/tv', tvRouter)
app.use('/users', usersRouter);



app.listen(port, () => {
  console.info(`Server running at http://localhost:${port}/`);
});
