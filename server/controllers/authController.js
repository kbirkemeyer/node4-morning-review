const bcrypt = require('bcryptjs');

module.exports = {
    register: async (req, res) => {
        const db = req.app.get('db');
        const {email, password} = req.body;

        let user = await db.check_user(email);
        if(user[0]){
            return res.status(400).send("Email already registered") 
        }

        let salt = bcrypt.genSaltSync(10);
        let hash = bcrypt.hashSync(password, salt);
        let newUser = await db.register_user([email, hash]);

        req.session.user = {
            id: newUser[0],
            email: newUser[0].email
        }
        res.status(200).send(req.session.user)
    },
    login: async (req, res) => {
        const db = req.app.get('db');
        const {email, password} = req.body;

        let user = await db.check_user(email);
        if(!user[0]){
            return res.status(400).send("Incorrect login credentials.");
        }

        // user_password is used because that is the column name in the table
        let authenticated = bcrypt.compareSync(password, user[0].user_password);

        if(!authenticated){
            return res.status(400).send("Incorrect login credentials.")
        }

        delete user[0].user_password;
        req.session.user = user[0];
        res.status(200).send(req.session.user);

        // The above is the same thing as:
        // req.session.user = {
        //     id: newUser[0],
        //     email: newUser[0].email
        // }
        // res.status(200).send(req.session.user)
    },
    logout: (req, res) => {
        req.session.destroy();
        res.sendStatus(200);
    },
    // Even if you refresh, the user will remain logged in:
    getUser: (req, res) => {
        if(req.session.user){
            res.status(200).send(req.session.user);
        } else {
            res.status(204).send('Please log in');
        }
    }
}