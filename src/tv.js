import {select} from './db.js'
export async function getSeries(req,res) {
    const bla = await select.allSeries();
    console.log(bla)
    res.json(bla)
}