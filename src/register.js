import { insert } from "./db.js";
import { findByEmail, findByUsername } from "./users.js";

export async function register(req,res) {
    const { username,email, password = '' } = req.body;
    const result = await findByUsername(username);
    const result2 = await findByEmail(email);
    if (result) {
        return res.status(401).json({ error: 'Username taken' });
    }
    if (result2) {
        return res.status(401).json({ error: 'Email taken'});
    }
    
    const user = await insert.user({
        "username": username,
        "email":email,
        "password": password
    });
    console.log(user) // Prentar null


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