import express from 'express';
import session from 'express-session';
import dotenv from 'dotenv';

import { pass as passport } from './login.js';

dotenv.config();

const {
  PORT: port = 3000,
} = process.env;

const app = express();

/** * Passport og session virkni */
const sessionSecret = 'leyndarmál';
app.use(session({
  secret: sessionSecret,
  resave: false,
  saveUninitialized: false,
  maxAge: 600 * 1000, // 10 mín
}));
app.use(passport.initialize());
app.use(passport.session());


app.get('/', (rew,res)=>{
    res.json({maggi:"hallo heimur"})
})

app.listen(port, () => {
    console.info(`Server running at http://localhost:${port}/`);
  });