import express from 'express';
import dotenv from 'dotenv';

import passport from './login.js'
import {
  login,
  requireAuthentication
} from './login.js';
import {
  register
} from './register.js'

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

router.post('/tv/:id/season/:id/episode/:id', func);
router.post('/tv/:id/season/:id/episode', func);
router.post('/tv/:id/season/:id', func);
router.post('/tv/:id/season', func);
router.post('/tv/:id', func);
router.post('/tv', func);

router.post('/genres', func);

router.post('/users/regiser',register);
router.post('/users/login', login); // Komið
router.post('/users/:id', func);
router.post('/users/me',func);
router.post('/users', func);

app.use('/', router);

app.listen(port, () => {
  console.info(`Server running at http://localhost:${port}/`);
});

function func(req,res){
  console.log("Ekki alvöru fall")
}