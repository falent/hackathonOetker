
var mysql      = require('mysql');
var connection = mysql.createConnection({
    host     : 'sql2.freemysqlhosting.net',
    user     : 'sql2264064',
    password : 'wI4%lS9%',
    port : '3306',
    database : 'sql2264064'

});



// make this available to our users in our Node applications
module.exports = connection;