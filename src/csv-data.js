import neatCsv from 'neat-csv';
import { readFileAsync } from './utils.js';

async function parseSeries() {
  const raw = await readFileAsync('data/series.csv');

  const series = await neatCsv(raw, {
    mapValues: ({ header, index, value }) => {
      if (header === 'id') {
        return Number(value);
      } else {
        return value;
      }
    }
  });

  return series;
}

async function parseSeasons() {
  const raw = await readFileAsync('data/seasons.csv');

  const seasons = await neatCsv(raw, {
    mapValues: ({ header, index, value }) => {
      if (header === 'number' || header === 'serieId') {
        return Number(value);
      }
      return value;
    }
  });

  return seasons;
}

async function parseEpisodes() {
  const raw = await readFileAsync('data/episodes.csv');

  const episodes = await neatCsv(raw, {
    mapValues: ({ header, index, value }) => {
      if (header === 'number' || header === 'season' || header === 'serieId') {
        return Number(value);
      }
      return value;
    }
  });

  return episodes;
}

export default {
  parseSeries,
  parseSeasons,
  parseEpisodes,
}
