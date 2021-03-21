import passport from 'passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

import { comparePasswords, findByUsername } from './users.js';
import { select } from './db.js';

dotenv.config();

const {
  JWT_SECRET: jwtSecret,
  TOKEN_LIFETIME: tokenLifetime = 6000, //600 sek
  DATABASE_URL: databaseUrl,
} = process.env;

if (!jwtSecret || !databaseUrl) {
  console.error('Vantar .env gildi');
  process.exit(1);
}

const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: jwtSecret,
};

async function strat(data, next) {
  // fáum id gegnum data sem geymt er í token
  const user = await select.user(data.id);
  if (user) {
    next(null, user);
  } else {
    next(null, false);
  }
}

passport.use(new Strategy(jwtOptions, strat));

/**
 * Athugar hvort notandi er skráður inn
 */
export function requireAuthentication(req, res, next) {
  return passport.authenticate(
    'jwt',
    { session: false },
    (err, user, info) => {
      if (err) {
        return next(err);
      }

      if (!user) {
        const error = info.name === 'TokenExpiredError'
          ? 'expired token' : 'invalid token';

        return res.status(401).json({ error });
      }

      // Látum notanda vera aðgengilegan í rest af middlewares
      req.user = user;

      return next();
    },
  )(req, res, next);
}

/**
 * Setur user í req.user ef notandi er loggaður inn,
 * annars ekki.
 */
export function maybeAuthentication(req, res, next) {
  return passport.authenticate(
    'jwt',
    { session: false },
    (err, user, info) => {
      if (err) {
        return next();
      }
      if (!user) {
        return next();
      }
      // Látum notanda vera aðgengilegan í rest af middlewares
      req.user = user;
      return next();
    },
  )(req, res, next);
}

/**
 * @returns jwt token if successful else error message
 */
export async function login(req, res) {
  const { username, password = '' } = req.body;

  const user = await findByUsername(username);

  if (!user) {
    return res.status(401).json({ error: 'No such user' });
  }

  const passwordIsCorrect = await comparePasswords(password, user.password);

  if (passwordIsCorrect) {
    const payload = { id: user.id };
    const tokenOptions = { expiresIn: tokenLifetime };
    const token = jwt.sign(payload, jwtOptions.secretOrKey, tokenOptions);
    user.token = token
    return res.json(user);
  }

  return res.status(401).json({ error: 'Invalid password' });
}

export default passport;