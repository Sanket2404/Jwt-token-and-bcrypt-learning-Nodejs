const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const path = require('path');
const bcrypt = require('bcrypt');
const userModel = require('./models/user');

const jwt = require('jsonwebtoken');

app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());

app.get('/',(req,res)=>{
    res.render('index');
});

app.post('/create', (req,res)=>{
    let {username, email, password, age} = req.body; 
    
    //encrypt password
    let saltRounds = 10;
    bcrypt.genSalt(saltRounds, function(err, salt) {
        bcrypt.hash(password, salt, async function(err, hash) {
            let createdUser = await userModel.create({
                username,
                email, 
                password:hash, 
                age
            })

           let token = jwt.sign({email}, 'shhhhhhhhh');

           res.cookie("token", token);

            res.send(createdUser); 
        });
    });
});

app.get('/login',(req,res)=>{
    res.render('login');
});

app.post('/login',async (req,res)=>{
    let user = await userModel.findOne({email:req.body.email});
    if(!user) return res.send("something went wrong");

    bcrypt.compare(req.body.password, user.password, (err, result)=>{
        if(result)
        {
            let token = jwt.sign({email:user.email}, 'shhhhhhhhh');
            res.cookie("token", token);
            res.send('Yes U Can Login!!!');
        } 
        else res.send("no you cant login");
    })
});

app.get('/logout',(req,res)=>{
  res.cookie('token','');
  res.redirect('/');
});


app.listen(3000);