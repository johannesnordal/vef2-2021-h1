import pg from 'pg';
import dotenv from 'dotenv';


 dotenv.config();
 
 const connectionString = process.env.DATABASE_URL;
 
 const pool = new pg.Pool({ connectionString });
 
 pool.on('error', (err) => {
   console.error('Unexpected error on idle client', err);
   process.exit(-1);
 });
 
 export async function query(q, values = []) {
   const client = await pool.connect();
 
   let result;
 
   try {
     result = await client.query(q, values);
   } catch (err) {
     console.error('Villa í query', err);
     throw err;
   } finally {
     client.release();
   }
 
   return result;
 }



