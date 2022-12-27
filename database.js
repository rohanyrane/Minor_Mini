var mysql = require("mysql");


var connection = mysql.createConnection({
    host:'localhost',
    database:'movie_booking',//your database name
    user:'root',//your user name
    password:'root'//your user password
});

module.exports = connection;




