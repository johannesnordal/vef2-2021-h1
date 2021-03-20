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

function toParamString(n) {
  return [...Array(n).keys()].map((index) => `$${index + 1}`);
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

  season: async (seasonData) => {
    const keys = Object.keys(seasonData);
    const values = Object.values(seasonData);

    const paramString = toParamString(values.length);

    const q = `insert into seasons (${keys}) values (${paramString}) returning *`;

    try {
      const { rows } = await query(q, values);
      return rows;
    } catch (e) {
      return {
        error: `Season með number ${seasonData.number} hefur nú þegar verið skráð fyrir þessa seríu`,
      };
    }
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
    const { password, admin, ...rest } = user;

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
    const { state, rating, ...rest } = data;

    if (!state && !rating) return;

    if (state) {
      rest.state = state;
    }

    if (rating) {
      rest.rating = rating;
    }

    const keys = Object.keys(rest);
    const values = Object.values(rest);

    const paramString = toParamString(values.length);
    const q = `INSERT INTO users_tvshows (${keys}) VALUES (${paramString}) RETURNING *`;

    const { rows } = await query(q, values);

    return rows[0];
  }
}

export const update = {
  toParamString: (params) => {
    const { set, where } = params;

    const setKeys = Object.keys(set);
    const setValues = Object.values(set);

    const whereKeys = Object.keys(where);
    const whereValues = Object.values(where);

    const offset = whereKeys.length + 1;
    const setParams = setKeys.map((value, index) => `${value} = $${index + offset}`);

    const whereParams = whereKeys.map((value, index) => {
      return `${value} = $${index + 1}`
    }).toString().replace(',', ' and ');

    const values = whereValues.concat(setValues);

    const paramString = `set ${setParams} where ${whereParams}`;

    return {
      paramString,
      values,
    };
  },

  serie: async (data) => {
    const { id, ...rest } = data;

    if (!id) {
      return;
    }

    const { paramString, values } = update.toParamString({
      set: rest,
      where: { id },
    });

    const q = `update tvshows ${paramString} returning *`;

    const { rows } = await query(q, values);

    return rows;
  },

  user: async (userData) => {
    const { id, ...rest } = userData;

    if (!id) {
      return;
    }

    const { paramString, values } = update.toParamString({
      set: rest,
      where: { id },
    });

    const q = `update users ${paramString} returning *`;

    const { rows } = await query(q, values);

    return rows[0];
  },

  userSerie: async (userSerieData) => {
    const { tvshowId, userId, ...rest } = userSerieData;

    if (!tvshowId || !userId || !rest) {
      return null;
    }

    const { paramString, values } = update.toParamString({
      set: rest,
      where: { userId, tvshowId },
    });

    const q = `update users_tvshows ${paramString} returning *`;

    const { rows } = await query(q, values);

    return rows[0];
  },
}

export const select = {
  serie: async (serieID) => {
    const q = 'select * from tvshows where id = $1';

    const { rows: [ serie ]  } = await query(q, [serieID]);

    return serie;
  },

  serieGenres: async (serieID) => {
    const q = 'select genre as name from tvshows_genres where tvshow = $1';

    const { rows: genres } = await query(q, [serieID]);

    return genres
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

  episode: async (episodeID) => {
    const q = 'select * from episodes where id = $1';

    const { rows } = await query(q, [episodeID]);

    return rows[0];
  },

  user: async (userID) => {
    const q = 'select * from users where id = $1';

    const { rows } = await query(q, [userID]);

    return rows[0];
  },

  userSerieStateAndRating: async (serieID, userID) => {
    const q = `
      select state, rating
      from users_tvshows
      where tvshowId = $1 and userId = $2`;

    const { rows } = await query(q, [serieID, userID]);

    return rows[0];
  },

  serieAverageRating: async (serieID) => {
    const q = 'select avg(rating), count(rating) from users_tvshows where tvshowid = $1';

    const { rows } = await query(q, [serieID]);

    return {
      averagerating: rows[0].avg,
      ratingcount: rows[0].count,
    };
  },

  pageOfSeries: async (offset = 0, limit = 10) => {
    const values = [ offset, limit ];

    const q = 'select * from tvshows order by id offset $1 limit $2';

    const { rows } = await query(q, values);

    return rows;
  },

  pageOfSeasonEpisodes: async (seasonID, offset = 0, limit = 10) => {
    const q = 'select * from episodes where seasonId = $1 order by id offset $2 limit $3';

    const { rows } = await query(q, [seasonID, offset, limit]);

    return rows;
  },

  pageOfGenres: async(offset = 0, limit = 10) => {
    const values = [ offset, limit ];

    const q = 'select * from genres order by name offset $1 limit $2';

    const { rows } = await query(q, values);

    const genres = rows.map((genre) => genre.name);

    return genres;
  },

  pageOfUsers: async (offset = 0, limit = 10) => {
    const values = [ offset, limit ];

    const q = 'select * from users order by id offset $1 limit $2';

    const { rows } = await query(q, values);

    return rows;
  },
}

export const remove = {
  serie: async (serieID) => {
    const q = 'delete from tvshows where id = $1 returning *';

    const { rows } = await query(q, [serieID]);

    return rows[0];
  },

  season: async (seasonID) => {
    const q = 'delete from seasons where id = $1 returning *';

    const { rows } = await query(q, [seasonID]);

    return rows[0];
  },

  episode: async (episodeID) => {
    const q = 'delete from seasons where id = $1 returning *';

    const { rows } = await query(q, [episodeID]);

    return rows[0];
  },
}

export default {
  load,
  clear,
  query,
  insert,
  select,
  update,
  remove,
}
