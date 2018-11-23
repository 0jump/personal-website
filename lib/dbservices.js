// All Database services and functions go here
let mysql = require('mysql');
let config = require('./config');
let moment = require('moment');
const bcrypt = require('bcrypt-nodejs');
const helpers = require('./helpers');

let connection = mysql.createConnection({
    host: config.mysql.host,
    user: config.mysql.user,
    password: config.mysql.password,
    database: config.mysql.database
});

let db = {};

connection.connect((err) => {
    if (err) {
        return console.error('error: ' + err.message);
    }
    console.log('Connected to the MySQL server.');
});

db.userExists = (userEmail, callback) => {
    // Callback anatomy: callback(error, error_description, returned)
    let query_isExist = `SELECT email_addr FROM users WHERE email_addr = '${userEmail}'`;
    connection.query(query_isExist, (err, result, fields)=> {
        if (err){
            callback('db_error', 'Error while cheking if new user\'s email already exists', '');
        } 
        if (result.length > 0){
            // It already exists
            callback('', '', true);

        }
        else {
            // It does not exist
            callback('', '', false);
        }
    });
}

db.addNewUser = (userObj, callback) => {
    if (connection){
        // Get the datetime in the mysql format
        let datetime = moment.utc().format('YYYY-MM-DD HH:mm:ss');
        // Convert true to 1, and false to 0, but it should never be zero as this is screened for before in the code so it should never be 0 here
        let tosAgreementSQLCompliant = (userObj.tosAgreement) ? 1 : false ;
        
        // Add new entry to mysql server
        let query_addNewUser = `INSERT INTO users (email_addr, first_name, last_name, salt, hashed_pass, date_created, tos_agreement) VALUES ("${userObj.emailAddr}", "${userObj.fName}", "${userObj.lName}", "${userObj.salt}","${userObj.hashedPass}", "${datetime}", "${tosAgreementSQLCompliant}")`;
        connection.query(query_addNewUser, (err, result, fields) => {
            if (err){
                //console.log(err);
                callback('db_error', 'Error while adding new user', '');
            } else {
                callback('', '', true);
            }
        });
    }
    else {
        callback('db_error', 'Connection not established with MySQL server', '');
        console.log('Connection with DB is not established, unable to make request');
    }
}

db.isPasswordMatchesEmailAddr = (userEmail, myPlaintextPassword, callback) => {
    if (connection){
        let query_getHashedPass = `SELECT hashed_pass FROM users WHERE email_addr = '${userEmail}'`;

        connection.query(query_getHashedPass, (err, result, fields) => {
            if (err){
                //console.log(err);
                callback('db_error', '[MySQL] Error while matching hashed password to email address', '');
            } else {
                if (result.length == 1){
                    let storedPassAsStr = JSON.stringify(result[0]);
                    helpers.asyncParseJsonToObject(storedPassAsStr, (parseErr, parseRes) => {
                        if (!parseErr){
                            let storedPass = parseRes.hashed_pass;
                            bcrypt.compare(myPlaintextPassword, storedPass, (err, res) => {
                                if (!err){
                                    callback('', '', res);
                                } else {
                                    //console.log(err);
                                    callback('bcypt_error', '[bcrypt] Error comparing user-entered password to stored password');
                                }
                            });
                        } else {
                            //console.log(parseErr);
                            callback('json_error', 'Error while parsing a json string', '');
                        }

                    })
                } else {
                    callback('','',false);
                }
            }
        });
    }
    else {
        callback('db_error', 'Connection not established with MySQL server', '');
        console.log('Connection with DB is not established, unable to make request');
    }
}

module.exports = db;