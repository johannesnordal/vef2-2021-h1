import bcrypt from 'bcrypt';
import { query } from './db.js'


export async function comparePasswords(password, hash) {
    const result = await bcrypt.compare(password, hash);

    return result;
}


export async function findByUsername(username) {
    const q = 'SELECT * FROM users WHERE username = $1';

    try {
        const result = await query(q, [username]);

        if (result.rowCount === 1) {
            return result.rows[0];
        }
    } catch (e) {
        console.error('Gat ekki fundið notanda eftir notendnafni');
        return null;
    }

    return false;
}

export async function findByEmail(email) {
    const q = 'SELECT * FROM users WHERE email = $1';

    try {
        const result = await query(q, [email]);

        if (result.rowCount === 1) {
            return result.rows[0];
        }
    } catch (e) {
        console.error("Gat ekki fundið notanda eftir email'i");
        return null;
    }

    return false;
}

export async function findById(id) {
    const q = 'SELECT * FROM users WHERE id = $1';

    try {
        const result = await query(q, [id]);

        if (result.rowCount === 1) {
            return result.rows[0];
        }
    } catch (e) {
        console.error('Gat ekki fundið notanda eftir id');
    }

    return null;
}

async function countUsers() {
    const q = 'SELECT COUNT(*) FROM users';

    try {
        const result = await query(q);

        if (result.rowCount === 1) {
            return parseInt(result.rows[0].count);
        }
    } catch (e) {
        console.error('Gat ekki fundið lengd');
    }

    return null;
} 

export async function getUsers(req, res) {
    let { offset = 0, limit = 10 } = req.query;
    const q = 'SELECT * FROM users';
    let users;
    const usersLength = await countUsers();
    if (typeof offset !== 'undefined' && typeof limit !== 'undefined') {
        users = await listOfUsers(parseInt(offset), parseInt(limit));
    } else {
        users = await listOfUsers(parseInt(0), parseInt(10));
    }
    offset = parseInt(offset);
    limit = parseInt(limit)

    let next = {};
    let prev = {};
    const self = { "href": `localhost:3000/users?offset=${offset}&limit=${limit}` }
    if (usersLength > offset + limit) {
        next = { "href": `localhost:3000/users?offset=${offset + limit}&limit=${limit}` }
    }
    if (offset > 0 && offset < limit) {
        prev = { "href": `localhost:3000/users?offset=${0}&limit=${limit}` }
    } else if(offset > 0){
        prev = { "href": `localhost:3000/users?offset=${offset - limit}&limit=${limit}` }
    }
    let obj = {
        "limit": limit,
        "offset": offset,
        "items": users,
        "_links": {
            "self": self,
            "prev": prev,
            "next": next
        }

    }
    return res.json(obj);
}

/**
 * Listi af x mörgum users úr users töflunni
 */
export async function listOfUsers(offset = 0, limit = 10) {
    const values = [offset, limit];

    let result = [];

    try {
        const q = `SELECT * FROM users ORDER BY id OFFSET $1 LIMIT $2`;

        const queryResult = await query(q, values);

        if (queryResult && queryResult.rows) {
            result = queryResult.rows;
        }
    } catch (e) {
        console.error('Error finding users', e);
    }

    return result;
}
