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
    mysqlConnection.query(`SELECT * FROM authUsers WHERE id = ${id}`, (err, rows, fields)=>{
        if(err) {
            console.log(err);
        } else {
            console.log(rows, 'user found by id');
            done(null, rows);
        }
        
    })  
})

passport.use(
    new GoogleStrategy({
        //options for the strategy
        callbackURL:'/auth/google/redirect',
        clientID: keys.google.clientID,
        clientSecret: keys.google.clientSecret
    }, (accessToken, refreshToken, profile, done)=>{
        

        //check if user already exists in db
        mysqlConnection.query(`SELECT * FROM authUsers WHERE id = ${profile.id}`, (err, rows, fields)=>{
            if(err) {
                console.log(err);
            } else {
                console.log(rows);
                if(rows.length > 0) {
                 //already have this user
                 console.log('user is:', rows); 
                 done(null, rows[0])
                } else {
                    //creating new user                    
                    let user = {
                        id: profile.id,
                        username: profile.displayName,
                        gender: profile.gender,
                        thumbnail: profile._json.image.url
                    }
                    mysqlConnection.query(`INSERT INTO authUsers (name, id, gender, thumbnail) VALUES ('${user.username}', '${user.id}', '${user.gender}', '${user.thumbnail}')`, (err, rows, fields)=>{
                        err ? console.log(err) : console.log(`new user created ${user}`)
                    })
                    done(null, user)
                }
            }
        })    
    })
)

