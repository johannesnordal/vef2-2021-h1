import neatCsv from 'neat-csv';
import { readFileAsync } from './utils.js';

export async function parseSeries() {
  const raw = await readFileAsync('data/series.csv');

  const series = await neatCsv(raw, {
    mapValues: ({ header, index, value }) => {
      if (header === 'id') {
        return Number(value);
      }
      return value;
    },
  });

  return series;
}

export async function parseSeasons() {
  const raw = await readFileAsync('data/seasons.csv');

  const seasons = await neatCsv(raw, {
    mapValues: ({ header, index, value }) => {
      if (header === 'number' || header === 'serieId') {
        return Number(value);
      }
      return value;
    },
  });

  return seasons;
}

export async function parseEpisodes() {
  const raw = await readFileAsync('data/episodes.csv');

  const episodes = await neatCsv(raw, {
    mapValues: ({ header, index, value }) => {
      if (header === 'number' || header === 'season' || header === 'serieId') {
        return Number(value);
      }
      return value;
    },
  });

  return episodes;
}

export function toBool(value) {
  if (value === 'true') {
    return true;
  }
  return false;
}

export async function parseUsers() {
  const raw = await readFileAsync('data/users.csv');

  const users = await neatCsv(raw, {
    mapValues: ({ header, index, value }) => {
      if (header === 'admin') {
        return toBool(value);
      }
      return value;
    },
  });

  return users;
}

export async function parseUsersSeries() {
  const raw = await readFileAsync('data/usersSeries.csv');

  const usersSeries = await neatCsv(raw, {
    mapValues: ({ header, index, value }) => {
      if (header !== 'state') {
        return Number(value);
      }
      return value;
    },
  });

  return usersSeries;
}

export default {
  parseSeries,
  parseSeasons,
  parseEpisodes,
  parseUsers,
  parseUsersSeries,
  toBool,
};
