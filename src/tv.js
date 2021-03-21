import { uploadImage } from './image-data.js';
import {
  insert, select, update, remove,
} from './db.js';

export const get = {
  series: async (req, res) => {
    const { offset = 0, limit = 10 } = req.query;
    const series = await select.pageOfSeries(offset, limit);

    const data = await addOffsetLimit(req, series, limit, offset);

    res.json(data);
  },

  singleSerie: async (req, res) => {
    const { id } = req.params;
    const { user } = req;
    const serie = await getSerie(id);

    if (user) {
      const stateRate = await select.userSerieStateAndRating(id, req.user.id);
      const avgAndCount = await select.serieAverageRating(id);

      if (stateRate) {
        serie.state = stateRate.state;
        serie.rating = stateRate.rating;
      }

      serie.averageRating = avgAndCount.averagerating;
      serie.ratingcount = avgAndCount.ratingcount;
      return res.json(serie);
    }
    return res.json(serie);
  },

  seasons: async (req, res) => {
    const { id } = req.params;
    const { offset = 0, limit = 10 } = req.query;

    const seasons = await select.pageOfSeasons(id, offset, limit);
    const data = await addOffsetLimit(req, seasons, limit, offset);
    res.json(data);
  },

  singleSeason: async (req, res) => {
    const { id, seasonID } = req.params;
    const season = await getSeason(res, id, seasonID);
    res.json(season);
  },

  singleEpisode: async (req, res) => {
    const { id, seasonID, episodeID } = req.params;
    const season = await getSeason(res, id, seasonID);

    const { episodes } = season;
    for (const ep of episodes) {
      if (ep.number == episodeID) {
        res.json(ep);
      }
    }
    res.json({ error: 'could not find episode' });
  },
};

export const post = {
  serie: async (req, res) => {
    const serie = req.body;
    // 'airdate' er á formi "2021-11-18" janúar=0
    const date = serie.airdate.split('-');

    const airdate = new Date(date[0], date[1], date[2]);

    const imageURL = await uploadImage(serie.image, false);

    const newSerie = {
      name: serie.name,
      airdate,
      inproduction: serie.in_production,
      image: imageURL,
      description: serie.description,
      language: serie.language,
      tagline: serie.tagline,
    };
    const newSerieID = await insert.serie(newSerie);
    const result = await select.serie(newSerieID);
    res.json(result);
  },

  season: async (req, res) => {
    const season = req.body;
    const { id } = req.params;

    // 'airdate' er á formi "2021-11-18" janúar=0
    let airdate = null;
    const dateFormat = /[0-9]{4}-[0-9]{1,2}-[0-9]{1,2}/;
    if (dateFormat.test(season.air_date) && season.air_date) {
      const date = season.air_date.split('-');
      airdate = new Date(date[0], date[1], date[2]);
    }

    const imageURL = await uploadImage(season.image, false);

    console.log(airdate);
    const newSeason = {
      name: season.name,
      number: season.number,
      airdate,
      overview: season.overview,
      image: imageURL,
      serieId: id,
    };

    const result = await insert.season(newSeason);

    res.json(result);
  },
  episode: async (req, res) => {
    const { id, seasonID } = req.params;
    const episode = req.body;
    let airdate = null;
    // 'airdate' er á formi "2021-11-18" janúar=0
    const dateFormat = /[0-9]{4}-[0-9]{1,2}-[0-9]{1,2}/;
    if (dateFormat.test(episode.air_date) && episode.air_date) {
      const date = episode.air_date.split('-');
      airdate = new Date(date[0], date[1], date[2]);
    }
    const season = await getSeason(res, id, seasonID);
    const newEp = {
      name: episode.name,
      number: episode.number,
      airdate,
      overview: episode.overview,
      season: season.number, // season number
      seasonid: season.id,

    };
    const result = insert.episode(newEp);
    res.json(result);
  },

  usersRate: async (req, res) => {
    const { id } = req.params;
    const { rating } = req.body;
    const { user } = req;
    const data = {
      tvshowId: id,
      userId: user.id,
      rating,
    };
    const result = await insert.userSerie(data).catch(() => {
      res.json({ error: 'Rating er nú þegar til' });
    });
    res.json(result);
  },
  userState: async (req, res) => {
    const { id } = req.params;
    const { state } = req.body;
    const { user } = req;
    const data = {
      tvshowId: id,
      userId: user.id,
      state,
    };
    const result = await insert.userSerie(data)
      .catch((err) => {
        console.error(err);
        res.json({ error: 'State er nú þegar til staðar' });
      });
    res.json(result);
  },

};
export const patch = {
  serie: async (req, res) => {
    const { id } = req.params;
    const serie = req.body;
    serie.id = id;
    const result = await update.serie(serie);
    res.json(result);
  },
  season: async (req, res) => {
    const { id, seasonID } = req.params;
  },

  usersRate: async (req, res) => {
    const { id } = req.params;
    const { rating, state } = req.body;
    const { user } = req;

    const data = {
      tvshowId: id,
      userId: user.id,
      rating,
      state,
    };

    let result = await update.userSerie(data);
    if (!result) {
      result = await insert.userSerie(data);
    }
    res.json(result);
  },

};
export const takeOut = {
  serie: async (req, res) => {
    const { id } = req.params;
    const result = await remove.serie(id);
    res.json(result);
  },

  season: async (req, res) => {
    const { id, seasonID } = req.params;
    const season = await getSeason(res, id, seasonID);
    const result = await remove.season(season.id);
    res.json(result);
  },

  episode: async (req, res) => {
    const { id, seasonID, episodeID } = req.params;
    const season = await getSeason(res, id, seasonID);
    const { episodes } = season;
    let epID = 0;
    for (const ep of episodes) {
      if (ep.number == episodeID) {
        epID = ep.id;
      }
    }
    console.log(epID);
    if (epID) {
      const results = await remove.episode(epID);
      res.json(results);
    }
    res.json({ Error: 'No such episode id' });
  },
  usersRate: async (req, res) => {
    const { id } = req.params;
    const { user } = req;
    const data = {
      tvshowId: id,
      userId: user.id,
      rating: null,
    };
    const result = await update.userSerie(data);
    if (!result) {
      res.json({ error: 'Rate er ekki til á þátt' });
    }
    res.json(result);
  },
  usersState: async (req, res) => {
    const { id } = req.params;
    const { user } = req;
    const data = {
      tvshowId: id,
      userId: user.id,
      state: null,
    };
    const result = await update.userSerie(data);
    if (!result) {
      res.json({ error: 'State er ekki til á þátt' });
    }
    res.json(result);
  },
};

export async function paramCheckTV(req, res, next) { /** ÓKlárað */
  const { id, seasonID, episodeID } = req.params;

  const serie = await select.serie(id);
  const season = await select.serieSeasons(id, seasonID);
  const episode = await select.episode();

  if (!id || !user) {
    return res.json({ error: 'No such id' });
  }
  next();
}
/**
 * Skilar serie hlut með season hlut og genres
 */
async function getSerie(serieID) {
  const serie = await select.serie(serieID);
  const serieGenres = await select.serieGenres(serieID);
  const serieSeasons = await select.serieSeasons(serieID);

  serie.genres = serieGenres;
  serie.seasons = serieSeasons;
  return serie;
}

/** Skilar season hlut með episode hlut */
async function getSeason(res, serieID, seasonNumber) {
  const season = await select.serieSeason(serieID, seasonNumber);
  if (!season) {
    res.json({ error: 'Season ekki til' });
  }
  const episodesInSeason = await select.pageOfSeasonEpisodes(season.id, 0, 1000);
  season.episodes = episodesInSeason;
  return season;
}

async function addOffsetLimit(req, items, limit, offset) {
  const url = `${req.protocol}://${req.headers.host}${req.baseUrl}`;
  offset = parseInt(offset);
  limit = parseInt(limit);
  const data = {
    limit,
    offset,
    items,
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

  if (items.length !== 0) {
    data._links.next = {
      href: `${url}?offset=${offset + limit}&limit=${limit}`,
    };
  }
  return data;
}
