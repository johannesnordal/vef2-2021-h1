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

    const id = await db.insert.serie(rest);

    seriesIDs.set(csvID, id);
  }

  return seriesIDs;
}

async function insertGenres(genres) {
  for (const genre of genres) {
    await db.insert.genre(genre);
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

    await db.insert.season(rest);
  }
}

async function insertEpisodes(episodes, seriesIDs) {
  for (const episode of episodes) {
    const serieID = seriesIDs.get(episode.serieId);

    const season = await db.select.serieSeason(serieID, episode.season);

    const { serie, serieId, airDate, ...rest } = episode;

    if (airDate) {
      rest.airDate = airDate;
    }

    rest.seasonId = season.id;

    await db.insert.episode(rest);
  }
}

async function insertSeriesGenres(series, seriesIDs) {
  for (const serie of series) {
    const serieID = seriesIDs.get(serie.id);
    const genres = serie.genres.split(',');

    for (const genre of genres) {
      await db.insert.serieGenre(serieID, genre);
    }
  }
}

async function insertUsers(users) {
  for (const user of users) {
    const res = await db.insert.user(user);
    console.log(res);
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
