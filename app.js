const express = require("express");
var app  = express();
var connection = require("./database")

const bodyParser = require("body-parser");
const methodOverride = require('method-override')
const ejs = require("ejs");
const ejsMate = require('ejs-mate')
const path = require("path");

//set views for ejs (app.set)
app.set('views', path.join(__dirname, 'views'));
app.engine('ejs',ejsMate)
app.set('view engine', 'ejs');

//use bodyParser and express (app.use)
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(methodOverride('_method'))

app.use(express.static("public"));//must be needed when creating a public folder for images and css
app.use(express.static(__dirname + '/views'));



var index = require('./routes/index');
app.use('/', index);

app.listen(3000,function(){
    console.log("App listening on port 3000");
    connection.connect(function(err){
        if(err){
            console.log(err);
        }else{
            console.log("Database connected");
        }
    })
})


