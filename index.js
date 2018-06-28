const mysql = require('mysql')
const express = require('express')
const bodyParser = require('body-parser')
const keys = require('./config/keys') 

let app = express()

app.use(bodyParser.json())

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

app.listen(3000,()=>console.log('Express Server is running at 3000!'))

//GET all users
app.get('/users',(req,res)=>{
    mysqlConnection.query('SELECT * FROM user', (err, rows, fields)=>{
        err ? console.log(err) : res.send(rows) 
    })
})

//GET user by ID
app.get('/users/:id',(req,res)=>{
    mysqlConnection.query('SELECT * FROM user WHERE UserID = ?',[req.params.id], (err, rows, fields)=>{
        err ? console.log(err) : res.send(rows) 
    })
})

//DELETE user by ID
app.delete('/users/:id',(req,res)=>{
    mysqlConnection.query('DELETE FROM user WHERE UserID = ?',[req.params.id], (err, rows, fields)=>{
        err ? console.log(err) : res.send('User deleted succesfully.')
    })
})

//INSERT user
app.post('/users',(req,res)=>{
    let user = req.body;
    let sql = `SET @UserID = ?; SET @Name = ?; SET @Company = ?;SET @Salary = ?;
    CALL UserAddOrEdit(@UserID,@Name,@Company,@Salary);`
               
    mysqlConnection.query(sql,[user.Name, user.Company, user.Salary], (err, rows, fields)=>{
        err ? console.log(err) : rows.forEach(element => {
            if(element.constructor==Array)
                res.send(`Inserted user id: ${element[0].UserID}`)
        });
    })
})

//UPDATE user
app.put('/users',(req,res)=>{
    let user = req.body;
    let sql = `SET @UserID = ?; SET @Name = ?; SET @Company = ?;SET @Salary = ?;
    CALL UserAddOrEdit(@UserID,@Name,@Company,@Salary);`
    mysqlConnection.query(sql,[user.UserID, user.Name, user.Company, user.Salary], (err, rows, fields)=>{
        err ? console.log(err) : rows.forEach(element => {
            if(element.constructor==Array)
                res.send(`User ${element[0].UserID} updated sucessfully!`)
        });
    })
})
