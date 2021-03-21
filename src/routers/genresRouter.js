import express from 'express';

import { requireAuthentication } from '../login.js';
import { catchErrors } from '../utils.js';
import { select, insert } from '../db.js';

export const router = express.Router();

async function getGenres(req, res) {
  const { offset = 0, limit = 10 } = req.query;

  const genres = await select.pageOfGenres(offset, limit);

  const url = `${req.protocol}://${req.headers.host}${req.baseUrl}`;

  const data = {
    limit,
    offset,
    items: genres,
    _links: {
      self: {
        href: `${url}?offset=${offset}&limit=${limit}`,
      },
    },
  };

  if (offset > 0) {
    data._links.prev = {
      href: `${url}?offset=${offset - limit}&limit=${limit}`,
    };
  }

  if (genres.length !== 0) {
    data._links.next = {
      href: `${url}?offset=${offset + limit}&limit=${limit}`,
    };
  }

  res.json(data);
}

async function postGenres(req, res) {
  const { name } = req.body;

  const genre = await insert.genre(name);

  res.json(genre);
}

router.get('/', catchErrors(getGenres));

router.post('/',
  requireAuthentication,
  catchErrors(postGenres));
