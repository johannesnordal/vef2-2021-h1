import pg from 'pg';
import dotenv from 'dotenv';
import { readFileAsync } from './utils.js';

dotenv.config();

const connectionString = process.env.DATABASE_URL;

const pool = new pg.Pool({ connectionString });

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

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

function toParamString(n) {
  return [...Array(n).keys()].map((index) => `$${index + 1}`);
}

export async function insertSerie(serie) {
  const keys = Object.keys(serie);
  const values = Object.values(serie);

  const paramString = toParamString(values.length);

  const q = `INSERT INTO tvshows (${keys}) VALUES (${paramString}) RETURNING *`;

  const { rows: [ res ] } = await query(q, values);

  return res.id;
}

export async function insertGenre(genre) {
  const q = `INSERT INTO genres (name) VALUES ($1)`;

  await query(q, [genre]);
}

export async function insertSeason(season) {
  const keys = Object.keys(season);
  const values = Object.values(season);

  const paramString = toParamString(values.length);

  const q = `insert into seasons (${keys}) values (${paramString})`;

  await query(q, values);
}

export async function insertEpisode(episode, seasonID) {
  const keys = Object.keys(episode);
  const values = Object.values(episode);

  const paramString = toParamString(values.length);

  const q = `insert into episodes (${keys}) values (${paramString})`;

  await query(q, values);
}

export async function insertSerieGenre(serieID, genre) {
  const q = `insert into tvshows_genres (tvshow, genre) values($1, $2)`;

  await query(q, [serieID, genre]);
}

export default {
  query,
  insertSerie,
  insertSeason,
  insertEpisode,
  insertGenre,
  insertSerieGenre,
  load,
  clear,
}
