import { select } from './db.js'

export const get = {
    series: async (req, res) => { /**Breyta og hafa offset */
        const series = await select.everytingFrom("tvshows");
        res.json(series)
    },

    singleSerie: async (req, res) => {
        const { id } = req.params;
        const serie = await select.serie(id)
        res.json(serie)
    },

    seasons: async (req, res) => { /**Breyta og hafa offset */
        const { id } = req.params;
        console.log(id)
        const seasons = await select.serieSeasons(id);
        res.json(seasons);
    },

    singleSeason: async(req,res) => {
        const { id, seasonID } = req.params;
        const season = await select.serieSeason(id,seasonID)
        res.json(season)
    },
    singleEpisode: async(req,res) => {
        const { id, seasonID, episodeID} = req.params;

    },
}