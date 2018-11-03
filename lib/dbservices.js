// All Database services and functions go here
let mysql = require('mysql');
let config = require('./config');
let moment = require('moment');

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
        // Email Addr does not already exist (Should be made sure before so no problems happen here)

        // Hash password to store it    

        // Get the datetime in the mysql format
        let datetime = moment.utc().format('YYYY-MM-DD hh:mm:ss');
        // Convert true to 1, and false to 0, but it should never be zero as this is screened for before in the code so it should never be 0 here
        let tosAgreementSQLCompliant = (userObj.tosAgreement) ? 1 : false ;
        
        // Add new entry to mysql server
        let query_addNewUser = `INSERT INTO users (email_addr, first_name, last_name, hashed_pass, date_created, tos_agreement) VALUES ("${userObj.emailAddr}", "${userObj.fName}", "${userObj.lName}", "${userObj.pass}", "${datetime}", "${tosAgreementSQLCompliant}")`;
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

module.exports = db;