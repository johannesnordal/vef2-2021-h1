import { insert, select, update,remove } from './db.js'

export const get = {
    series: async (req, res) => { /**Breyta og hafa offset */
        let { offset = 0, limit = 10 } = req.query;
        const series = await select.pageOfSeries(offset, limit);

        res.json(series)
    },

    singleSerie: async (req, res) => {
        const { id } = req.params;
        var serie = await getSerie(id)
        res.json(serie)
    },

    seasons: async (req, res) => { /**Breyta og hafa offset */
        const { id } = req.params;

        const seasons = await select.serieSeasons(id);
        res.json(seasons);
    },

    singleSeason: async (req, res) => {
        const { id, seasonID } = req.params;
        const season = await getSeason(id,seasonID)
        res.json(season)
    },

    singleEpisode: async (req, res) => { 
        const { id, seasonID, episodeID } = req.params;
        const season = await getSeason(id, seasonID); 

        const episodes = season.episodes;
        for(let ep of episodes) {
            if(ep.number == episodeID) {
                res.json(ep)
            }
        }
        res.json({"error": "could not find episode"})
    },
}

export const post = {
    serie: async (req, res) => {
        const serie = req.body;
        // 'airdate' er á formi "2021-11-18" janúar=0
        let date = serie.air_date.split('-')

        const airdate = new Date(date[0], date[1], date[2]);

        const newSerie = {
            "name": serie.name,
            "airdate": airdate,
            "inproduction": serie.in_production,
            "image": serie.image,
            "description": serie.description,
            "language": serie.language,
            "tagline": serie.tagline
        }
        const newSerieID = await insert.serie(newSerie)
        const result = await select.serie(newSerieID);
        res.json(result)
    },

    season: async (req, res) => {
        const season = req.body;
        const { id } = req.params;


        // 'airdate' er á formi "2021-11-18" janúar=0
        let airdate = null;
        const dateFormat = /[0-9]{4}-[0-9]{1,2}-[0-9]{1,2}/;
        if (dateFormat.test(season.air_date) && season.air_date) {
            let date = season.air_date.split('-');
            airdate = new Date(date[0], date[1], date[2]); 
        }

        console.log(airdate)
        const newSeason = {
            "name": season.name,
            "number": season.number,
            "airdate": airdate,
            "overview": season.overview,
            "image": season.image,
            "serieId": id
        }

        const result = await insert.season(newSeason)
        
        res.json(result)
    },
    episode: async (req, res) => {
        const { id, seasonID } = req.params;
        const episode = req.body;
        let airdate = null;
        // 'airdate' er á formi "2021-11-18" janúar=0
        const dateFormat = /[0-9]{4}-[0-9]{1,2}-[0-9]{1,2}/;
        if (dateFormat.test(episode.air_date) && episode.air_date) {
            let date = episode.air_date.split('-');
            airdate = new Date(date[0], date[1], date[2]); 
        }
        let season = getSeason(id,seasonID);
        const newEp = {
            "name": episode.name,
            "number": episode.number,
            "airdate": airdate,
            "overview": episode.overview,
            "season": episode.seasonNumber,
            "season": seasonID, // Season Number
            "seasonId": season.id

        }
        const result = insert.episode(newEp);
        res.json(result)
    },

}
export const patch = {
    serie: async (req, res) => {
        const { id } = req.params;
        const serie = req.body;
        serie.id = id;
        const result = await update.serie(serie);
        res.json(result)
    }

}
export const takeOut = {
    serie: async (req,res) => {
        const {id} = req.params;
        const result = await remove.serie(id);
        console.log(result)
        res.json(result)
    }
}




export async function paramCheckTV(req, res, next) {/**ÓKlárað */
    const { id, seasonID, episodeID } = req.params;

    const serie = await select.serie(id);
    const season = await select.serieSeasons(id, seasonID);
    const episode = await select.episode()

    if (!id || !user) {
        return res.json({ "error": "No such id" })
    }
    next()

}
/**
 * Skilar serie hlut með season hlut og genres
 */
async function getSerie(serieID) {
    var serie = await select.serie(serieID)
    const serieGenres = await select.serieGenres(serieID)
    const serieSeasons = await select.serieSeasons(serieID);

    /**Setja hérna inn avg rating og ratingcount */

    serie.genres = serieGenres;
    serie.seasons = serieSeasons;
    return serie
}

/**Skilar season hlut með episode hlut */
async function getSeason(serieID, seasonNumber) {
    
    const season = await select.serieSeason(serieID, seasonNumber)
    const episodesInSeason = await select.seasonEpisodes(season.id)
    season.episodes = episodesInSeason
    return season;
}