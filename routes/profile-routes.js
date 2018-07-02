const router = require('express').Router();

const authCheck = (req,res,next)=>{
    !req.user ? res.redirect('/auth/login') : next()
}

router.get('/', authCheck, (req,res)=>{
    res.render('profile', {user: req.user[0]})
})

module.exports = router