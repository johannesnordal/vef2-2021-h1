import fs from 'fs';
import path from 'path';
import neatCSV from 'neat-csv';

const dir = 'data/';

fs.readdir(dir, (err, files) => {

  if (err) {
    throw err;
  }

  files.forEach(file => {
    console.log(file);
  });
});

fs.readFile('data/seasons.csv', async (err, raw) => {

  if (err) {
    console.error(err);
    return;
  }

  const data = await neatCSV(raw);

  data.forEach(season => {
    console.log(`${season.serie} : ${season.name} : ${season.airDate}`);
  });
});
