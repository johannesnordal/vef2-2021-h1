import express from 'express';
import dotenv from 'dotenv';
import { body } from 'express-validator';

import instructions from './instructions.js'
import {router as usersRouter} from './routers/usersRoute.js'
import {router as tvRouter} from './routers/tvRouter.js'
import { router as genresRouter } from './routers/genresRouter.js';
import passport from './login.js'

dotenv.config();

const {
  PORT: port = 3000,
} = process.env;

const app = express();

// Notum JSON middleware til að geta tekið við JSON frá client
app.use(express.json());
app.use(passport.initialize());

app.get('/', (rew, res) => {
  res.json(instructions)
})

app.use('/genres', genresRouter);

app.use('/tv', tvRouter)
app.use('/users', usersRouter);

app.listen(port, () => {
  console.info(`Server running at http://localhost:${port}/`);
});
