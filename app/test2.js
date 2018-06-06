const mysql = require("mysql");
const dbconfig = require("../config/database");
const connection = mysql.createConnection(dbconfig.connection);
connection.query("USE " + dbconfig.database);

var async = require('async');
var token ="bd8ccff35b23c73a850e322b1e735751931528acx"
async.waterfall([
    async.apply(findToken, token), 
    resetPassword,
], function (err, result) {
    console.log(result)
});

function findToken(token, callback) {
    console.log('Step 1:::Find Token');
    console.log(token); // Outputs: 1   
    TokenQuery ="select * from user where Token=?;"
    connection.query(TokenQuery, [token], function(err, rows){
        if(err){
            console.log('There was a problem meanwhile doing the Query');
            callback(null, '');
        }
        if(rows!==null){
            console.log(rows);
            callback(null, rows);
        }
        else{
            console.log('No existe ese token');
            console.log(rows);
            callback(null, null);   
        }
    });
    
}

function resetPassword(user, callback) {
    console.log('Step 2 Reset Password');
    console.log(user)
    if(){
        //req.flash('error', 'Password reset token is invalid or has expired.');
        //return res.redirect('/forgot');
        console.log('No hay usuarios')
        callback(null, 'NOUSER');
    }
    else{
        callback(null, 'done');
    }
    
}