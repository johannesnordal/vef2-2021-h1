import {select} from './db.js'
export async function series(req,res) {
    const bla = await select.allSeries();
    res.json(bla)
}
export async function singleSerie(req,res) {
    const {id} = req.params;
    const serie = await select.serie(id)
    res.json(serie)
}
export async function seriesSeason(req,res) {
    
}