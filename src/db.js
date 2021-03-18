import pg from 'pg';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import { readFileAsync } from './utils.js';

dotenv.config();

const connectionString = process.env.DATABASE_URL;

const pool = new pg.Pool({ connectionString });

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

export const insert = {
  serie: async (serie) => {
    const keys = Object.keys(serie);
    const values = Object.values(serie);

    const paramString = toParamString(values.length);

    const q = `INSERT INTO tvshows (${keys}) VALUES (${paramString}) RETURNING *`;

    const { rows: [ res ] } = await query(q, values);

    return res.id;
  },

  genre: async (genre) => {
    const q = `INSERT INTO genres (name) VALUES ($1)`;

    await query(q, [genre]);
  },

  season: async (season) => {
    const keys = Object.keys(season);
    const values = Object.values(season);

    const paramString = toParamString(values.length);

    const q = `insert into seasons (${keys}) values (${paramString})`;

    await query(q, values);
  },

  episode: async (episode) => {
    const keys = Object.keys(episode);
    const values = Object.values(episode);

    const paramString = toParamString(values.length);

    const q = `insert into episodes (${keys}) values (${paramString})`;

    await query(q, values);
  },

  serieGenre: async (serieID, genre) => {
    const q = `insert into tvshows_genres (tvshow, genre) values($1, $2)`;

    await query(q, [serieID, genre]);
  },

  user: async (user) => {
    const { password, ...rest } = user;

    rest.password = await bcrypt.hash(password, 11);

    const keys = Object.keys(rest);
    const values = Object.values(rest);

    const paramString = toParamString(values.length);
    const q = `INSERT INTO users (${keys}) VALUES (${paramString}) RETURNING *`;
   
    try {
      const { rows: [ res ] } = await query(q, values);
      return res;
    } catch (e) {
      console.error(e);
    }

    return null;
  },

  userSerie: async (data) => {
    const { viewStatus, rating, ...rest } = data;

    if (!viewStatus && !rating) return;

    if (viewStatus) {
      rest.viewStatus = viewStatus;
    }

    if (rating) {
      rest.rating = rating;
    }

    const keys = Object.keys(rest);
    const values = Object.values(rest);

    const paramString = toParamString(values.length);
    const q = `INSERT INTO users_tvshows (${keys}) VALUES (${paramString})`;

    await query(q, values);
  }
}

export const update = {
  userToAdmin: async (id) => {
    const q = `UPDATE users SET admin = TRUE WHERE id = $1`;

    try {
      await query(q, [id]);
      return true;
    } catch (e) {
      console.error(`Gat ekki gert notanda ${id} að stjórnanda.`);
    }

    return false;
  }
}

export const select = {
  serie: async (serieID) => {
    const q = 'select * from tvshows where id = $1';

    const { rows: [ serie ]  } = await query(q, [serieID]);

    return serie;
  },

  serieGenres: async (serieID) => {
    const q = 'select genre from tvshows_genres where tvshow = $1';

    const { rows } = await query(q, [serieID]);

    return rows.map((row) => row.genre);
  },

  serieSeason: async (serieID, number) => {
    const q = 'select * from seasons where serieid = $1 and number = $2';

    const { rows: [ res ] } = await query(q, [serieID, number]);

    return res;
  },

  serieSeasons: async (serieID) => {
    const q = 'select * from seasons where serieid = $1';

    const { rows } = await query(q, [serieID]);

    return rows;
  },

  pageOfUsers: async (offset = 0, limit = 10) => {
    const values = [ offset, limit ];

    const q = 'select * from users order by id offset $1 limit $2';

    const { rows } = await query(q, values);

    return rows;
  },
}

// Notum remove því delete er frátekið í JavaScript
// og del er of nálægt því að vera deli.
export const remove = {
  serie: async (serieID) => {
    const q = 'delete from tvshows where id = $1 returning *';

    try {
      const { rows } = await query(q, [serieID]);
      return rows;
    } catch (e) {
      console.error(`Gat ekki eytt seríu ${serieID}.`);
    }

    return null;
  },

  season: async (seasonID) => {
  },

  episode: async (episdoeID) => {

  },
}

export async function clear() {
  const clear = await readFileAsync('./schema/clear.sql');
  await query(clear.toString('utf8'));
}

export async function load() {
  const schema = await readFileAsync('./schema/schema.sql');
  await query(schema.toString('utf8'));
}

export async function query(q, values = []) {
  const client = await pool.connect();

  let result;
  try {
    result = await client.query(q, values);
  } finally {
    client.release();
  }

  return result;
}

export function toParamString(n) {
  return [...Array(n).keys()].map((index) => `$${index + 1}`);
}


export default {
  load,
  clear,
  query,
  insert,
  select,
  update,
  remove,
  toParamString,
}
