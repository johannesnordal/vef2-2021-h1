/* eslint-disable radix */

import bcrypt from 'bcrypt';
import { query, select, update } from './db.js';

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

export async function isAdmin(req, res, next) {
  const { admin } = req.user;

  if (admin) {
    return next();
  }

  return res.json({ error: 'insufficient authorization' });
}

export async function getUsers(req, res) {
  const { offset = 0, limit = 10 } = req.query;

  const users = await select.pageOfUsers(parseInt(offset), parseInt(limit));
  const newUsers = takeOutPassword(users);

  const result = await addOffsetLimit(req, newUsers, limit, offset);

  return res.json(result);
}

/**
 * Tekur innfylki af users objects
 * Skila fylki af user objects mínus password
 */
 function takeOutPassword(users) {
  const newUsers = [];
  
  for (const user of users) {
    const obj = {
      id: user.id,
      username: user.username,
      email: user.email,
      admin: user.admin,
    };
    newUsers.push(obj);
  }
  return newUsers;
}


export async function getSingleUser(req, res) {
  const { id } = req.params;
  const user = await select.user(id);
  const result = takeOutPassword([user]);

  return res.json(result[0]);
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

  const user = await update.user({
    id: userID,
    admin,
  }).catch((err) => {
    return res.json({
      error: 'Needs to be a boolean value',
    })
  });

  return res.json(takeOutPassword(user));
}

export async function paramCheckUser(req, res, next) {
  const { id } = req.params;

  const user = await select.user(id);

  if (!id || !user) {
    return res.json({ error: 'No such id' });
  }

  return next();
}

export async function getMe(req, res) {
  const { user } = req;
  const ret = takeOutPassword([user]);
  res.json(ret);
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
