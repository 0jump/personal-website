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

db.userExists = (userEmail) => {
    let query_isExist = `SELECT email_addr FROM users WHERE email_addr = '${userEmail}'`;
    connection.query(query_isExist, (err, result, fields)=> {
        
        if (err){
            console.log('errorrrrrrr');
            console.log(err);
            return {'error':'db_error', 'error_desc': 'Error while cheking if new user\'s email already exists', 'result':''};
        } 
        if (result.length > 0){
            console.log('existssssss');
            // It already exists
            return {'error': '', 'error_desc':'', 'result': true};
        }
        else {
            console.log('doesnnt exisssst');
            // It does not exist
            return {'error':'', 'error_desc':'', 'result': false};
        }
    });
}

db.addNewUser = (userObj, callback) => {
    if (connection){
        // Check if user exists
        let userExists = db.userExists(userObj.emailAddr); 
        
        console.log(userExists,'\n\n\n\n\n-----------------\n');
        if (!userExists.error){
            console.log('Could not add new user: Email already exists');
            return userExists;
        } else if (userExists.result){
            // Email Addr already exists
            return {'error':'already_exists', 'error_desc':'Email used when trying to create the user is already in use', 'result': ''};
        } else if (!userExists.result){
            // Email Addr does not already exist

            // Hash password to store it    

            // Get the datetime in the mysql format
            let datetime = moment.utc().format('YYYY-MM-DD hh:mm:ss');
            // Convert true to 1, and false to 0, but it should never be zero as this is screened for before in the code so it should never be 0 here
            let tosAgreementSQLCompliant = (userObj.tosAgreement) ? 1 : false ;
            
            // Add new entry to mysql server
            let query_addNewUser = `INSERT INTO users (email_addr, first_name, last_name, hashed_pass, date_created, tos_agreement) VALUES ("${userObj.emailAddr}", "${userObj.fName}", "${userObj.lName}", "${userObj.pass}", "${datetime}", "${tosAgreementSQLCompliant}")`;
            connection.query(query_addNewUser, (err, result, fields) => {
                if (err){
                    console.log(err);
                    return {'error':'db_error', 'error_desc': 'Error while adding new user', 'result': ''};
                } else {
                    return {'error':'', 'error_desc':'', 'result': true};
                }
            });
        }
    }
    else {
        console.log('Connection with DB is not established, unable to make request');
    }
}

module.exports = db;