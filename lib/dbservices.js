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
                console.log(err);
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



db.addHomePageVisit = (pArrayOfHomePageVisits, callback) => {
    if (connection) {
        if (pArrayOfHomePageVisits.length > 0 && typeof(pArrayOfHomePageVisits) == 'object'){
            let query_addHomePageVisit = `INSERT INTO home_page_visits(ip_address,country,city,visit_date) VALUES `;

            query_addHomePageVisit = query_addHomePageVisit + `("${pArrayOfHomePageVisits[0].ip_address}" , "${pArrayOfHomePageVisits[0].country}", "${pArrayOfHomePageVisits[0].city}", "${pArrayOfHomePageVisits[0].visit_date}")`;

            for (let i = 1; i < pArrayOfHomePageVisits.length; i++ ){
                let HPvisitsObj = pArrayOfHomePageVisits[i];
                let ip_address = HPvisitsObj.ip_address;
                let country = HPvisitsObj.country;
                let city = HPvisitsObj.city;
                let visit_date = HPvisitsObj.visit_date;

                query_addHomePageVisit = query_addHomePageVisit + `,("${ip_address}","${country}","${city}","${visit_date}")`;
            }

            query_addHomePageVisit = query_addHomePageVisit + ";";

            

            connection.query(query_addHomePageVisit, (err, result, fields) => {
                if (err){
                    console.log(err);
                    callback('db_error', '[MySQL] Error while adding home page visit to DB', '');
                } else {
                    callback('','', true);
                }
            });
        } else {
            callback('parameter_error', 'pArrayOfHomePageVisits is not of type "object" or it is empty', '');
        }
    } else {
        callback('db_error', 'Connection not established with MySQL server', '');
        console.log('Connection with DB is not established, unable to make request');
    }
}


db.addNewTts = (ttsObj, callback) => {
    //TODO: Decide if i put checking here or on server.js 
    let query_addNewTts = `INSERT INTO tts(title,description,duration,date_created,creator_user_id) VALUES ("${ttsObj.title}", "${ttsObj.description}","${ttsObj.duration}", "${ttsObj.date_created}", "${ttsObj.creator_user_id}")`;

    connection.query(query_addNewTts, (err, result, fields) => {
        if (err){
            console.log(err);
            callback('db_error', '[MySQL] Error while adding home page visit to DB', '');
        } else {
            callback('','', true);

        }
    });
};

db.getAllTts = (pUserId, callback) => {
    let query_getAllTts = `SELECT title,description,duration,date_created FROM tts WHERE creator_user_id = '${pUserId}'`;

    connection.query(query_getAllTts, (err, result, fields) => {
        if (err){
            //console.log(err);
            callback('db_error', '[MySQL] Error while getting all tts', '');
        } else {
            if (result.length > 0){
                let ttsArray = [];
                for(let i=0; i< result.length; i++){
                    let row = JSON.stringify(result[i]);
                    helpers.asyncParseJsonToObject(row, (parseErr, parseRes) => {
                        if (!parseErr){
                            ttsArray.push(parseRes);
                        } else {
                            //console.log(parseErr);
                            callback('json_error', 'Error while parsing a json string', '');
                        }
                    });
                }
                if (ttsArray.length > 0){
                    callback('','',ttsArray);
                }
            }
        }
    });
}


module.exports = db;