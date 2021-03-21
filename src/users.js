import bcrypt from 'bcrypt';
import { query, update } from './db.js'


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

export async function isAdmin(req, res, next) {
  const { admin } = req.user;

  if (admin) {
    return next();
  }

  return res.json({"error": "insufficient authorization"})
}

export async function getUsers(req, res) {
  let { offset = 0, limit = 10 } = req.query;
  const q = 'SELECT * FROM users';
  const usersLength = await countUsers();

  let users = await listOfUsers(parseInt(offset), parseInt(limit));
  const newUsers = takeOutPassword(users);

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
  } else if (offset > 0) {
    prev = { "href": `localhost:3000/users?offset=${offset - limit}&limit=${limit}` }
  }

  let obj = {
    "limit": limit,
    "offset": offset,
    "items": newUsers,
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

/**
 * Tekur innfylki af users objects
 * Skila fylki af user objects mínus password
 */
function takeOutPassword(users) {
  let newUsers = [];

  for (let user of users) {

    let obj = {
      "id": user.id,
      "username": user.username,
      "email": user.email,
      "admin": user.admin,
      "created": user.created,
      "updated": user.updated
    }
    newUsers.push(obj);
  }
  return newUsers;
}


export async function getSingleUser(req, res) {
  const { id } = req.params;
  const user = await findById(id);
  const result = takeOutPassword([user])

  return res.json(result[0])
}

export async function patchUser(req, res) {
  const adminID = req.user.id;
  const userID = Number(req.params.id);
  
  if (adminID === userID) {
    return res.json({
      error: 'Can\'t change self from admin to user',
    });
  }

  const { admin } = req.body;

  if (!admin) {
    return res.json();
  }

  const user = await update.user({
    id: userID,
    admin,
  });

  return res.json(takeOutPassword(user));
}

export async function paramCheckUser(req, res, next) {
  const { id } = req.params;

  const user = await findById(id)

  if (!id || !user) {
    return res.json({ "error": "No such id" })
  }
  
  return next()
}

export async function getMe(req, res) {
  const { user } = req;
  let ret = takeOutPassword([user])
  res.json(ret)
}

export async function patchMeUp(req, res) {
  const { email, password } = req.body;

  const data = {
    id: req.user.id,
  };

  if (email) {
    data.email = email;
  }

  if (password) {
    data.password = password;
  }

  const userUpdate = await update.user(data);

  return res.json(userUpdate);
}
