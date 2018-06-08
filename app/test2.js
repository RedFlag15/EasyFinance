const mysql = require("mysql");
const dbconfig = require("../config/database");
const connection = mysql.createConnection(dbconfig.connection);
connection.query("USE " + dbconfig.database);

var async = require("async");

var userid = "20";
async.waterfall([async.apply(findAccounts, userid), sumBalance], function(
    err,
    result
) {
    console.log(result);
});

function findAccounts(userid, callback) {
    console.log("Step 1:::Find BANK");
    console.log(userid); // Outputs: 1
    TokenQuery = "SELECT number_acc FROM account where id=?;";
    connection.query(TokenQuery, [userid], function(err, rows) {
        if (err) {
            console.log("There was a problem meanwhile doing the Query");
            callback(null, "");
        }
        if (rows !== null) {
            console.log(rows);
            callback(null, rows);
        } else {
            console.log("No existe ese token");
            console.log(rows);
            callback(null, null);
        }
    });
}
function sumBalance(list, callback) {
    console.log(list);
    callback(null, "done");
}
