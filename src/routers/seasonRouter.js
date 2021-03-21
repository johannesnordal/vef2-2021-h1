import express from 'express';
import {
  get,
} from '../tv.js';
import { catchErrors } from '../utils.js';

export const router = express.Router();

router.get('/', catchErrors(get.seasons));
router.get('/:id', catchErrors(get.singleSeason));
