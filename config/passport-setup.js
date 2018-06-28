const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth20')
const keys = require('./keys')
const mysql = require('mysql')

//connect to mysql
let mysqlConnection = mysql.createConnection({
    host: 'localhost',
    user: keys.mysql.user,
    password: keys.mysql.pwd,
    database: 'userDb',
    multipleStatements: true
});

mysqlConnection.connect((err)=>{
    err ? console.log(`Db connection failed! ${JSON.stringify(err, undefined, 2)}`) :
     console.log('DB connection succeded!')
})

passport.serializeUser((user, done)=>{
    done(null, user.id);
})

passport.deserializeUser((id, done)=>{
    //SELECT USER BY ID QUERY HERE
    done(null, user);
})

passport.use(
    new GoogleStrategy({
        //options for the strategy
        callbackURL:'/auth/google/redirect',
        clientID: keys.google.clientID,
        clientSecret: keys.google.clientSecret
    }, (accessToken, refreshToken, profile, done)=>{
        //check if user already exsts in db
        mysqlConnection.query(`SELECT * FROM authUsers WHERE id = ${profile.id}`, (err, rows, fields)=>{
            if(err) {
                console.log(err);
            } else {
                console.log(rows);
                if(rows.length > 0) {
                 //already have this user
                 console.log('user is:', rows); 
                 done(null, rows)
                } else {
                    //creating new user
                    let user = {
                        id: profile.id,
                        username: profile.displayName,
                        gender: profile.gender
                    }
                    mysqlConnection.query(`INSERT INTO authUsers (name, id, gender) VALUES ('${profile.displayName}', '${profile.id}', '${profile.gender}')`, (err, rows, fields)=>{
                        err ? console.log(err) : console.log('KUSOCHEK HUINI INSERTED')
                    })
                    done(null, data)
                }
            }
        })    
    })
)

