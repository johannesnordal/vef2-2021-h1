import { insertUser } from "./db.js";
import { findByEmail, findByUsername } from "./users.js";

export async function register(req,res) {
    const { username,email, password = '' } = req.body;
    const result = await findByUsername(username);
    const result2 = await findByEmail(email);
    if (!username || !email || !password) {
        return res.status(401).json({ error: 'Must have username, email and password' });
    }
    if (result) {
        return res.status(401).json({ error: 'Username taken' });
    }
    if (result2) {
        return res.status(401).json({ error: 'Email taken'});
    }
    const user = await insertUser(username,email,password);
    var dt = new Date();
    const obj = {
        "id": user.id,
        "username": user.username,
        "email" : user.email,
        "admin" : user.admin,
        "created" : dt,
        "updated": dt
    }
    return res.json(obj);
}