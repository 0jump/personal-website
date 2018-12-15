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

db.checkPassAndReturnUserInfo = (userEmail, myPlaintextPassword, callback) => {
    if (connection){
        let query_getHashedPassAndUserId = `SELECT user_id,hashed_pass FROM users WHERE email_addr = '${userEmail}'`;

        connection.query(query_getHashedPassAndUserId, (err, result, fields) => {
            if (err){
                //console.log(err);
                callback('db_error', '[MySQL] Error while matching hashed password to email address', '');
            } else {
                if (result.length == 1){
                    let resultAsStr = JSON.stringify(result[0]);
                    if(resultAsStr){
                        helpers.asyncParseJsonToObject(resultAsStr, (parseErr, parseRes) => {
                            if (!parseErr){
                                let storedPass = parseRes.hashed_pass;
                                bcrypt.compare(myPlaintextPassword, storedPass, (err, res) => {
                                    if (!err){
                                        callback('', '', parseRes.user_id);
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
                        callback('db_error','Unable to read user id', '');
                    }

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

/*TODO: Finish This
db.getUserInfoFromUserId = (userId, callback) => {
    if (connection){
        let query_getUserInfoFromUserId = `SELECT email_addr,first_name,last_name,date_created FROM users WHERE email_addr = '${userEmail}'`;

        connection.query(query_getUserInfoFromUserId, (err, result, fields) => {
            if (err){
                //console.log(err);
                callback('db_error', '[MySQL] Error while getting user info using user_id', '');
            } else {
                if (result.length == 1){
                    let resultAsStr = JSON.stringify(result[0]);
                    if(resultAsStr){
                        helpers.asyncParseJsonToObject(resultAsStr, (parseErr, parseRes) => {
                            if (!parseErr){
                                callback('','', parseRes);
                            } else {
                                //console.log(parseErr);
                                callback('json_error', 'Error while parsing a json string', '');
                            }
    
                        })
                    } else {
                        callback('db_error','Unable to read user id', '');
                    }

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
} */

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
    /* 
    Add new empty entry to tts table and return the TTS id
    */
    //TODO: Decide if i put checking here or on server.js 
    let query_addNewTts = `INSERT INTO tts(title,description,duration,date_created,creator_user_id) VALUES ("${ttsObj.title}", "${ttsObj.description}","${ttsObj.duration}", "${ttsObj.date_created}", "${ttsObj.creator_user_id}")`;

    connection.query(query_addNewTts, (err, result, fields) => {
        if (err){
            console.log(err);
            callback('db_error', '[MySQL] Error while adding home page visit to DB', '');
        } else {
            let query_getLastInsertId = `SELECT LAST_INSERT_ID()`;
            connection.query(query_getLastInsertId, (err, result, fields) => {
                if (err){
                    console.log(err);
                    callback('db_error', '[MySQL] Error while getting last insert id', '');
                } else {
                    if (result.length == 1){
                        let resultAsStr = JSON.stringify(result[0]);
                        if(resultAsStr){
                            helpers.asyncParseJsonToObject(resultAsStr, (parseErr, parseRes) => {
                                if (!parseErr){
                                    callback('','', parseRes['LAST_INSERT_ID()']);
                                } else {
                                    //console.log(parseErr);
                                    callback('json_error', 'Error while parsing a json string', '');
                                }
                            });
                        } else {
                            callback('db_error','Unable to read user id', '');
                        }
                    } else {
                        console.log('[MySQL] Could not get user_id because got more or no results from asking db for last id from TTS table');
                        callback('','',false);
                    }
                }
            });
        }
    });
};

db.getAllTts = (pUserId, callback) => {
    // Returns array of TTS Objects
    let query_getAllTts = `SELECT id,title,description,duration,date_created FROM tts WHERE creator_user_id = '${pUserId}'`;

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

db.getTts = (pTtsId,pUserId,callback) => {
    if (connection){
        let query_getTts = `SELECT id,title,description,duration,date_created FROM tts WHERE creator_user_id = '${pUserId}' AND id = '${pTtsId}'`;
        connection.query(query_getTts, (err, result, fields) => {
            if (err){
                //console.log(err);
                callback('db_error', '[MySQL] Error While getting a TTS', '');
            } else {
                if(result.length > 0){
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
                    callback('','',ttsArray[0]);
                } else {
                    callback('','', false);
                }
            }
        });
    }else{
        callback('db_error', 'Connection not established with MySQL server', '');
        console.log('Connection with DB is not established, unable to make request');
    }
}



db.addNewTtsTask = (pTtsTaskObj, pUserId,callback) => {
    if (connection){
        // Get the datetime in the mysql format
        let datetime = moment.utc().format('YYYY-MM-DD HH:mm:ss');

        // Check where the Task is in TTS (index in tts)
        db.getAllTasksForTtsInOrder(pTtsTaskObj.tts_id, (error_type, error_desc, tasksArray) => {
            if (!error_type){
                let newTaskIndex = 0;
                if(tasksArray.length > 0){
                    console.log(tasksArray);
                    newTaskIndex = tasksArray[tasksArray.length-1].index_in_tts + 1;
                }
                pTtsTaskObj.index_in_tts = newTaskIndex.toString();

                // Add new entry to mysql server
                let query_addNewTtsTask = `INSERT INTO tts_tasks (title, description, duration, date_created, index_in_tts, tts_id, creator_user_id) VALUES ("${pTtsTaskObj.title}", "${pTtsTaskObj.description}", "${pTtsTaskObj.duration}","${datetime}", "${pTtsTaskObj.index_in_tts}", "${pTtsTaskObj.tts_id}", "${pUserId}")`;
                connection.query(query_addNewTtsTask, (err, result, fields) => {
                    if (err){
                        //console.log(err);
                        callback('db_error', 'Error while adding new TTS Task', '');
                    } else {
                        db.getLastInsertId((error_type, error_desc, lastInsertedId)=> {
                            if (!error_type){
                                pTtsTaskObj.tts_task_id = lastInsertedId;
                                callback('', '', pTtsTaskObj);
                            }else{
                                console.log(error_desc);
                                callback('db_error','Error while chacking last inserted id while adding new tts task', '')
                            }
                        })
                        
                    }
                });
                
            } else {
                callback(error_type, error_desc, '');
                console.log(error_desc);
            }
        })
    } else {
        callback('db_error', 'Connection not established with MySQL server', '');
        console.log('Connection with DB is not established, unable to make request');
    }
}




db.deleteTtsTask = (pTtsTaskId, callback) => {
    if (connection){
        let query_deleteTtsTask = `DELETE FROM tts_tasks WHERE tts_task_id = '${pTtsTaskId}';`

        connection.query(query_deleteTtsTask, (err, result, fields) => {
            if (err){
                //console.log(err);
                callback('db_error', 'Error while deleting TTS Task', '');
            } else {
                callback('','',true);
            }
        });
    } else {
        callback('db_error', 'Connection not established with MySQL server', '');
        console.log('Connection with DB is not established, unable to make request');
    }
}

db.updateTtsTask = (pNewTtsTaskObj, callback) => {
    if (connection){
        let task = pNewTtsTaskObj;
        let query_updateTtsTask = `UPDATE tts_tasks SET title="${task.title}", description="${task.description}", duration="${task.duration}" WHERE tts_task_id=${task.tts_task_id};`
        connection.query(query_updateTtsTask, (err, result, fields) => {
            if (err){
                console.log(err);
                callback('db_error', 'Error while Updating TTS Task', '');
            } else {
                callback('','',true);
            }
        });
    }else {
        callback('db_error', 'Connection not established with MySQL server', '');
        console.log('Connection with DB is not established, unable to make request');
    }
}

db.updateTts = (pNewTtsObj) => {
    if (connection){
        let tts = pNewTtsObj;
        let query_updateTts = `UPDATE tts SET title="${tts.title}", description="${tts.description}", duration="${tts.duration}" WHERE id=${tts.id};`
        connection.query(query_updateTts, (err, result, fields) => {
            if (err){
                //console.log(err);
                callback('db_error', 'Error while Updating TTS', '');
            } else {
                callback('','',true);
            }
        });
    }else {
        callback('db_error', 'Connection not established with MySQL server', '');
        console.log('Connection with DB is not established, unable to make request');
    }
}

db.getAllTasksForTtsInOrder = (ttsId, callback) => {
    if (connection){
        let query_getAllTasksForTtsInOrder = `SELECT tts_task_id,title,description,duration,date_created,index_in_tts,tts_id,index_in_tts,creator_user_id FROM tts_tasks WHERE tts_id = '${ttsId}' ORDER BY index_in_tts`;

        connection.query(query_getAllTasksForTtsInOrder, (err, result, fields) => {
            if (err){
                //console.log(err);
                callback('db_error', '[MySQL] Error while getting all tts tasks in order', '');
            } else {
                if (result.length > 0){
                    let ttsTasksArray = [];
                    for(let i=0; i < result.length; i++){
                        let row = JSON.stringify(result[i]);
                        helpers.asyncParseJsonToObject(row, (parseErr, parseRes) => {
                            if (!parseErr){
                                ttsTasksArray.push(parseRes);
                            } else {
                                //console.log(parseErr);
                                callback('json_error', 'Error while parsing a json string', '');
                            }
                        });
                    }
                    if (ttsTasksArray.length > 0){
                        callback('','',ttsTasksArray);
                    }
                }else {
                    // There were no tasks to get for this TTS id
                    callback('', '', false);
                }
            }
        });
    }else {
        callback('db_error', 'Connection not established with MySQL server', '');
        console.log('Connection with DB is not established, unable to make request');
    }
}

db.getLastInsertId = (callback) => {
    query_getLastInsertId = `SELECT LAST_INSERT_ID()`;
    connection.query(query_getLastInsertId, (err, result, fields) => {
        if (err){
            console.log(err);
            callback('db_error', '[MySQL] Error while getting last insert id', '');
        } else {
            if (result.length == 1){
                let resultAsStr = JSON.stringify(result[0]);
                if(resultAsStr){
                    helpers.asyncParseJsonToObject(resultAsStr, (parseErr, parseRes) => {
                        if (!parseErr){
                            callback('','', parseRes['LAST_INSERT_ID()']);
                        } else {
                            //console.log(parseErr);
                            callback('json_error', 'Error while parsing a json string', '');
                        }
                    });
                } else {
                    callback('db_error','Unable to read user id', '');
                }
            } else {
                console.log('[MySQL] Could not get user_id because got more or no results from asking db for last id from TTS table');
                callback('','',false);
            }
        }
    });
}




/* let allTasks = db.getAllTasksForTtsInOrder( '3',(error_type, error_desc, tasksArray)=> {
    if (!error_type){
        console.log('allTasks: \n---------\n', tasksArray);
        db.getLastInsertId((err_typ,err_desc,LIID)=>{
            if(err_typ){
                console.log(err_desc)
            }else{
                console.log('\nLIID: \n-------\n', LIID);
            }
        });s
    }   else {
        console.log(error_desc);
    }
});
 */


module.exports = db;