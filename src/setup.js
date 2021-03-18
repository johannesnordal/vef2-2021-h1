import path from 'path';
import csvData from './csv-data.js';
import { uploadImage } from './image-data.js';
import db from './db.js';

async function setImageURL(serie, image) {
  const imagePath = getImagePath(image);

  const imageURL = await uploadImage(imagePath);

  serie.image = imageURL;

  return serie;
}

function getImagePath(imageName) {
  return path.join('./data/img/', imageName);
}

function getGenres(series) {
  const genres = new Set();
  
  series.forEach((serie) => {
    const serieGenres = serie.genres.split(',');
    serieGenres.forEach((genre) => genres.add(genre));
  });

  return genres;
}

async function insertSeries(series) {
  const seriesIDs = new Map();

  for (const serie of series) {
    const { id: csvID, genres, image, ...rest } = serie;

    await setImageURL(rest, image);

    const id = await db.insertSerie(rest);

    seriesIDs.set(csvID, id);
  }

  return seriesIDs;
}

async function insertGenres(genres) {
  for (const genre of genres) {
    await db.insertGenre(genre);
  }
}

async function insertSeasons(seasons, seriesIDs) {
  for (const season of seasons) {
    const serieID = seriesIDs.get(season.serieId);

    const { serie, airDate, poster, ...rest } = season;

    await setImageURL(rest, poster);

    if (airDate) {
      rest.airDate = airDate;
    }

    rest.serieId = serieID;

    await db.insertSeason(rest);
  }
}

async function insertEpisodes(episodes, seriesIDs) {
  for (const episode of episodes) {
    const q = `SELECT id FROM seasons WHERE serieId = $1 AND number = $2`;

    const serieID = seriesIDs.get(episode.serieId);
    const { rows: [ res ] } = await db.query(q, [serieID, episode.season]);

    const seasonId = res.id;

    const { serie, serieId, airDate, ...rest } = episode;

    if (airDate) {
      rest.airDate = airDate;
    }

    rest.seasonId = seasonId;

    await db.insertEpisode(rest);
  }
}

async function insertSeriesGenres(series, seriesIDs) {
  for (const serie of series) {
    const serieID = seriesIDs.get(serie.id);
    const genres = serie.genres.split(',');

    for (const genre of genres) {
      await db.insertSerieGenre(serieID, genre);
    }
  }
}

async function insertUsers(users) {
  for (const user of users) {
    try {
      await db.insertUser(user);
    } catch (error) {
      const { code } = error;
      if (code == 23505) {
        console.error(`Username '${user.username}' already exists. Skipping...`);
        continue;
      }
    }
  }
}

async function setup() {
  await db.clear();
  await db.load();

  const users = await csvData.parseUsers();
  await insertUsers(users);

  const series = await csvData.parseSeries();
  const seriesIDs = await insertSeries(series);

  const genres = await getGenres(series);
  await insertGenres(genres);

  const seasons = await csvData.parseSeasons();
  await insertSeasons(seasons, seriesIDs);

  const episodes = await csvData.parseEpisodes();
  await insertEpisodes(episodes, seriesIDs);

  await insertSeriesGenres(series, seriesIDs);
}

await setup();
