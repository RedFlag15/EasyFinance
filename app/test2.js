const mysql = require("mysql");
const dbconfig = require("../config/database");
const connection = mysql.createConnection(dbconfig.connection);
connection.query("USE " + dbconfig.database);

var async = require('async');

var bankname ="BBVA";
async.waterfall([
    async.apply(findBankID, bankname), 
    resetPassword,
], function (err, result) {
    console.log(result)
});

function findBankID(token, callback) {
    console.log('Step 1:::Find BANK');
    console.log(token); // Outputs: 1   
    TokenQuery ="SELECT id_bank FROM bank where name_bank=?;"
    connection.query(TokenQuery, [token], function(err, rows){
        if(err){
            console.log('There was a problem meanwhile doing the Query');
            callback(null, '');
        }
        if(rows!==null){
            console.log(rows);
            callback(null, rows[0].id_bank);
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
    
    callback(null, 'done');
    
}