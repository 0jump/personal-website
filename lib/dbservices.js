// All Database services and functions go here
let mysql = require('mysql');
let config = require('./server-configurations');
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
                                bcrypt.compare(myPlaintextPassword, storedPass, (err, isMatch) => {
                                    if (!err){
                                        if(isMatch){
                                            callback('', '', parseRes.user_id);
                                        } else {
                                            callback('', '', false);
                                        }
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

db.updateTaskForUser = (pTaskObj, callback) => {
    if (connection){
        let query_updateTaskForUser = `UPDATE tasks SET title="${pTaskObj.title}", parent_id="${pTaskObj.parent_id}", previous_sibling_id="${pTaskObj.previous_sibling_id}", next_sibling_id="${pTaskObj.next_sibling_id}", is_deleted="${pTaskObj.is_deleted}" WHERE id=${pTaskObj.id} AND is_deleted=0;`;
        connection.query(query_updateTaskForUser, (err, result, fields) => {
            if (err){
                console.log(err);
                callback('db_error', 'Error while Updating TTS Task', '');
            } else {
                callback('','', pTaskObj);
            }
        });
    }else {
        callback('db_error', 'Connection not established with MySQL server', '');
        console.log('Connection with DB is not established, unable to make request');
    }
}

db.updateTaskPreviousSibling = (pTaskId, pNewPreviousSiblingId, callback) => {
    if (connection){
        let query_updateTaskPreviousSibling = `UPDATE tasks SET previous_sibling_id=${pNewPreviousSiblingId} WHERE id=${pTaskId} AND is_deleted=0;`;
        connection.query(query_updateTaskPreviousSibling, (err, result, fields) => {
            if (err){
                console.log(err);
                callback('db_error', "Error while Updating Task's Previous Sibling", '');
            } else {
                callback('','', true);
            }
        });
    }else {
        callback('db_error', 'Connection not established with MySQL server', '');
        console.log('Connection with DB is not established, unable to make request');
    }
}

db.updateTaskNextSibling = (pTaskId, pNewNextSiblingId, callback) => {
    if (connection){
        let query_updateTaskNextSibling = `UPDATE tasks SET next_sibling_id=${pNewNextSiblingId} WHERE id=${pTaskId} AND is_deleted=0;`;
        connection.query(query_updateTaskNextSibling, (err, result, fields) => {
            if (err){
                console.log(err);
                callback('db_error', "Error while Updating Task's Next Sibling", '');
            } else {
                callback('','', true);
            }
        });
    }else {
        callback('db_error', 'Connection not established with MySQL server', '');
        console.log('Connection with DB is not established, unable to make request');
    }
}

db.addNewTaskWithoutTouchingAnyOtherTasks = (pUserId, pTaskObj,callback) => {
    let query = `INSERT INTO tasks(title,parent_id,previous_sibling_id,next_sibling_id,creator_user_id,date_created,is_deleted) VALUES ("${pTaskObj.title}", `;
    if(pTaskObj.parent_id == null){
        query = query + `NULL, `;
    } else {
        query = query + `"${pTaskObj.parent_id}", `;
    }
    if(pTaskObj.previous_sibling_id == null){
        query = query + `NULL, `;
    } else {
        query = query + `"${pTaskObj.previous_sibling_id}", `;
    }
    if(pTaskObj.next_sibling_id == null){
        query = query + `NULL, `;
    } else {
        query = query + `"${pTaskObj.next_sibling_id}", `;
    }
    query_addNewTaskForUser = query + `"${pTaskObj.creator_user_id}","${pTaskObj.date_created}","${pTaskObj.is_deleted}")`;
/*     let query_addNewTaskForUser = `INSERT INTO tasks(title,parent_id,previous_sibling_id,next_sibling_id,creator_user_id,date_created,is_deleted) VALUES ("${taskObj.title}", "${taskObj.parent_id}","${taskObj.previous_sibling_id}", "${taskObj.next_sibling_id}", "${taskObj.creator_user_id}","${taskObj.date_created}","${taskObj.is_deleted})`; */

    connection.query(query_addNewTaskForUser, (err, result, fields) => {
        if (err){
            console.log(err);
            callback('db_error', '[MySQL] Error while adding new task for user (Search for "4684" in the code)', '');
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
}


db.getTaskWithChildrenDeepAsArray = (pUserId, pTaskId, callback) => {
    // Returns one array that has this task and all its children without any hierarchy
    let tasksArray = [];

    db.getTask(pUserId, pTaskId, (error_type,error_desc,taskObj)=> {
        if(taskObj){
            tasksArray.push(taskObj);
            db.getTaskChildrenDeepAsArray(taskObj.id, (error_type, error_desc, arrayOfChildrenDeep)=> {
                if(!error_type){
                    tasksArray = tasksArray.concat(arrayOfChildrenDeep);
                    callback('','', tasksArray);
                }else {
                    callback(error_type,error_desc,'');
                }
            });
        }else{
            // Did not find any Task with this id
            callback('','',tasksArray);
        }
    });
}

db.getTask = (pUserId ,pTaskId, callback) => {
    if (connection){
        let query_getTask = `SELECT id,title,parent_id,previous_sibling_id,next_sibling_id,creator_user_id,date_created,is_deleted FROM tasks WHERE id = '${pTaskId}' AND creator_user_id = '${pUserId}' AND is_deleted = 0`;

        connection.query(query_getTask, (err, result, fields) => {
            if (err){
                //console.log(err);
                callback('db_error', '[MySQL] Error while getting Task', '');
            } else {
                if (result.length > 0){
                    for(let i=0; i < result.length; i++){
                        let row = JSON.stringify(result[i]);
                        helpers.asyncParseJsonToObject(row, (parseErr, parseRes) => {
                            if (!parseErr){
                                let taskRecordObj = parseRes;
                                callback('','',taskRecordObj);
                            } else {
                                //console.log(parseErr);
                                callback('json_error', 'Error while parsing a json string', '');
                            }
                        });
                    }
                }else {
                    // Did not find any tasks with this id
                    callback('db_error', '[MySql]Could not find any task with requested id', false);
                }
            }
        });
    }else {
        callback('db_error', 'Connection not established with MySQL server', '');
        console.log('Connection with DB is not established, unable to make request');
    }
}

db.getTaskChildrenDeepAsArray = (pTaskId, callback) => {
    if (connection){
        let query_getTaskChildren = `
        with recursive cte (id, title, parent_id, previous_sibling_id, next_sibling_id, creator_user_id, date_created, is_deleted) as (
            select      id,
                        title,
                        parent_id,
                        previous_sibling_id,
                        next_sibling_id,
                        creator_user_id,
                        date_created,
                        is_deleted
            from       tasks
            where      (parent_id = ${pTaskId}  AND is_deleted=0)
            union all
            select      t.id,
                        t.title,
                        t.parent_id,
                        t.previous_sibling_id,
                        t.next_sibling_id,
                        t.creator_user_id,
                        t.date_created,
                        t.is_deleted
            from        tasks t
            inner join cte
                    on t.parent_id = cte.id 
            
        )
        select * from cte where is_deleted=0;
        `;

        connection.query(query_getTaskChildren, (err, result, fields) => {
            if (err){
                //console.log(err);
                callback('db_error', '[MySQL] Error while getting Task', '');
            } else {
                if (result.length > 0){
                    let stringifiedResults = JSON.stringify(result);
                    helpers.asyncParseJsonToObject(stringifiedResults, (parseErr, parseRes) => {
                        if (!parseErr) {
                            let taskRecordsArray = parseRes;
                            callback('','', taskRecordsArray);
                        } else {
                            callback('json_error', 'Error while parsing a json string', '');
                        }
                    });
                }else {
                    // Did not find any children for this task
                    callback('', '', []);
                }
            }
        });
    }else {
        callback('db_error', 'Connection not established with MySQL server', '');
        console.log('Connection with DB is not established, unable to make request');
    }
} 

db.getTaskChildrenOneLayerAsArray = (pUserId, pTaskId, callback) => {
    if (connection){    
        let query_getTaskChildrenOneLayerAsArray = `SELECT id,title,parent_id,previous_sibling_id,next_sibling_id,creator_user_id,date_created,is_deleted FROM tasks WHERE parent_id ${(pTaskId == null) ? "IS NULL" : pTaskId} AND creator_user_id = '${pUserId}' AND is_deleted=0;`;
        connection.query(query_getTaskChildrenOneLayerAsArray, (err, result, fields) => {
            if (!err){
                if (result.length > 0){
                    let stringifiedResults = JSON.stringify(result);
                    console.log('stringifiedResults: ', stringifiedResults);
                    helpers.asyncParseJsonToObject(stringifiedResults, (parseErr, parseRes) => {
                        if (!parseErr) {
                            let taskChildrenArray = parseRes;
                            callback('','', taskChildrenArray);
                        } else {
                            callback('json_error', 'Error while parsing a json string', '');
                        }
                    });
                }else {
                    // Did not find any children for this task
                    callback('', '', []);
                }
            } else {
                //console.log(err);
                callback('db_error', `[MySQL] Error while getting Task: \n${err}`, '');
            }
        });
    }else {
        callback('db_error', 'Connection not established with MySQL server', '');
        console.log('Connection with DB is not established, unable to make request');
    }
}

db.getLastTaskChildOneLayer = (pUserId, pTaskId, callback) => {
    if (connection){    
        let query_getLastTaskChildOneLayer = `SELECT id,title,parent_id,previous_sibling_id,next_sibling_id,creator_user_id,date_created,is_deleted FROM tasks WHERE parent_id = '${pTaskId}' AND creator_user_id = '${pUserId}' AND next_sibling_id IS NULL AND is_deleted=0;`;


        connection.query(query_getLastTaskChildOneLayer, (err, result, fields) => {
            if (!err){
                if (result.length > 0){
                    let stringifiedResults = JSON.stringify(result);
                    helpers.asyncParseJsonToObject(stringifiedResults, (parseErr, parseRes) => {
                        if (!parseErr) {
                            let taskLastChild = parseRes[0];
                            callback('','', taskLastChild);
                        } else {
                            callback('json_error', 'Error while parsing a json string', '');
                        }
                    });
                }else {
                    // Did not find any children for this task
                    callback('', '', null);
                }
            } else {
                //console.log(err);
                callback('db_error', `[MySQL] Error while getting last task child 1 layer: \n${err}`, '');
            }
        });
    }else {
        callback('db_error', 'Connection not established with MySQL server', '');
        console.log('Connection with DB is not established, unable to make request');
    }
}

db.addNewTaskAndChangeNextAndPreviousTasks = (pUserId, pTaskObj, callback) => {
    /* 
    pTaskObj contains "next_sibling_id" which can be either:
        1. an integer, which represents the id of the task I want to add the new task before
        2. null, which means new task should be at the end of the task sequence
    */
    if(pTaskObj.next_sibling_id != null){
        // Get next sibling task object to get necessary information
        db.getTask(pUserId, pTaskObj.next_sibling_id, (err_type, err_desc, nextSiblingTaskObj)=>{
            // next sibling does exist
            // add task record of pTaskObj to receive its id
            if(!err_type){
                if(pTaskObj.parent_id == nextSiblingTaskObj.parent_id){
                    pTaskObj.previous_sibling_id = nextSiblingTaskObj.previous_sibling_id;

                    db.addNewTaskWithoutTouchingAnyOtherTasks(pUserId,pTaskObj, (err_type, err_desc,newTaskObjId)=> {
                        if(!err_type){
                            // Complete the task object
                            pTaskObj.id = newTaskObjId;
                            db._manipulateNextAndPrev.checkIfTaskHasSiblingsAndUpdateSiblingRelations_add(pUserId, pTaskObj, db.updateTaskPreviousSibling, db.updateTaskNextSibling, (err_type, err_desc, changesToImplementObj)=>{
                                let toReturn = {
                                    "new_task": pTaskObj,
                                    "changes_to_implement": changesToImplementObj
                                }
    
                                callback(err_type, err_desc, toReturn);
                            });
                        }else{
                            callback(err_type, err_desc, newTaskObjId);
                        }
                    });
                }else{
                    callback('invalid_db_input', "new task's parent != new task's sibling's parent", {});
                }
            }else{
                callback(err_type, err_desc, nextSiblingTaskObj);
            }
            
        });
    }else{
        // Does not have next sibling check if it has any siblings at all
        db.getTask(pUserId, pTaskObj.parent_id, (err_type, err_desc, parentTaskObj)=>{
            // add task record of pTaskObj to receive its id
            if(!err_type){
                db.getLastTaskChildOneLayer(pUserId, pTaskObj.parent_id, (err_type, err_desc, lastChildTaskObj)=> {
                    if(!err_type){
                        if(lastChildTaskObj!= null){
                            pTaskObj.previous_sibling_id = lastChildTaskObj.id;
                        }else{
                            pTaskObj.previous_sibling_id = null;
                        }
                        db.addNewTaskWithoutTouchingAnyOtherTasks(pUserId, pTaskObj, (err_type, err_desc, newTaskId)=> {
                            if(!err_type){  
                                pTaskObj.id = newTaskId;
                                db._manipulateNextAndPrev.checkIfTaskHasSiblingsAndUpdateSiblingRelations_add(pUserId, pTaskObj, db.updateTaskPreviousSibling, db.updateTaskNextSibling, (err_type, err_desc, changesToImplementObj)=>{
                                    let toReturn = {
                                        "new_task": pTaskObj,
                                        "changes_to_implement": changesToImplementObj
                                    }
        
                                    callback(err_type, err_desc, toReturn);
                                });
                            }else{  
                                callback(err_type, err_desc, newTaskId);
                            }
                        })
                    }else{
                        callback(err_type, err_desc, lastChildTaskObj);
                    }
                });
            }else{
                callback(err_type, err_desc, parentTaskObj);
            }
            
        });
    }
    
}

db.deleteTaskAndChangeNextAndPreviousTasks = (pUserId, pTaskId, callback) => {
    // get task
    db.getTask(pUserId, pTaskId, (err_type, err_desc, taskObj)=> {
        if(!err_type){
            db._manipulateNextAndPrev.checkIfTaskHasSiblingsAndUpdateSiblingRelations_delete(pUserId, taskObj, db.updateTaskPreviousSibling, db.updateTaskNextSibling, (err_type, err_desc, changesToImplementObj)=>{
                if(!err_type){
                    
                    db.deleteTaskWithoutTouchingAnyOtherTasks(pUserId, pTaskId, (err_type, err_desc, isDone)=> {
                        let toReturn = {
                            "delete_task": pTaskId,
                            "changes_to_implement": changesToImplementObj
                        }
                        if(!err_type){
                            callback(err_type, err_desc, toReturn);
                        }else{
                            callback(err_type, err_desc, toReturn);
                        }
                    });
                }else{
                    callback(err_type, err_desc, changesToImplementObj);
                }
            });
        }else{
            callback(err_type, err_desc, taskObj);
        }
    })
    // get siblings (front and back)
    // update task to deleted = true
}

db.deleteTaskWithoutTouchingAnyOtherTasks = (pUserId, pTaskId, callback) => {
    if (connection){
        let query_deleteTaskWithoutTouchingAnyOtherTasks = `UPDATE tasks SET is_deleted="1" WHERE creator_user_id=${pUserId} AND id=${pTaskId};`
        connection.query(query_deleteTaskWithoutTouchingAnyOtherTasks, (err, result, fields) => {
            if (!err){
                callback('', '', true);
            } else {
                console.log(err);
                callback('db_error', 'Error while Deleting Task', '');
            }
        });
    }else {
        callback('db_error', 'Connection not established with MySQL server', '');
        console.log('Connection with DB is not established, unable to make request');
    }
}   

db.moveTaskBeforeAnotherWithoutTouchingAnyOtherTasks = (pUserId, pTaskToMoveId, pNewNextSiblingId, pNewParentId) => {
    // put taskToBeMoved in a position right before newNextSibling (pNewParentId is not necessary if nextSiblingId != null, i.e i don't want to put the taskToMove in the end of a task sequence)
    if(pNewNextSiblingId == null){
        if(pNewParentId != null){
            
        }
        // Put task to move as a root task
    }
}

db._manipulateNextAndPrev = {};

db._manipulateNextAndPrev.checkIfTaskHasSiblingsAndUpdateSiblingRelations_add = (pUserId, pTaskObj, pFnSetPreviousSibling, pFnSetNextSibling, callback) => {
    let changesToImplementObj = {
        "changes_to_implement":{}
    }
    
    // check if it has any null siblings
    if(pTaskObj.next_sibling_id != null){
        if(pTaskObj.previous_sibling_id != null){
            // Next Sibling : YES
            // Prev Sibling : YES
            // updateTaskPreviousSibling on next sibling
            pFnSetPreviousSibling(pTaskObj.next_sibling_id, pTaskObj.id, (err_type,err_desc, isDone)=>{
                if(!err_type){
                    pFnSetNextSibling(pTaskObj.previous_sibling_id, pTaskObj.id, (err_type, err_desc, isDone)=> {
                        if(!err_type){
                            changesToImplementObj[pTaskObj.previous_sibling_id] = {"next_sibling_id": pTaskObj.id};
                            changesToImplementObj[pTaskObj.next_sibling_id] = {"previous_sibling_id": pTaskObj.id};

                            callback(err_type, err_desc, changesToImplementObj);
                        }else{
                            callback(err_type, err_desc, changesToImplementObj);
                        }
                    });
                }else{
                    callback(err_type,err_desc, changesToImplementObj);
                }
                
            });
        }else{
            // Next Sibling : YES
            // Prev Sibling : NO
            pFnSetPreviousSibling(pTaskObj.next_sibling_id, pTaskObj.id, (err_type, err_desc, isDone)=> {
                if(!err_type){
                    changesToImplementObj[pTaskObj.next_sibling_id] = {"previous_sibling_id": pTaskObj.id};
                    callback(err_type, err_desc, changesToImplementObj);
                }else{
                    callback(err_type, err_desc, changesToImplementObj);
                }
            });
        }
    }else{
        if(pTaskObj.previous_sibling_id != null){
            // Next Sibling : NO
            // Prev Sibling : YES
            pFnSetNextSibling(pTaskObj.previous_sibling_id, pTaskObj.id, (err_type, err_desc, isDone)=> {
                if(!err_type){
                    changesToImplementObj[pTaskObj.previous_sibling_id] = {"next_sibling_id": pTaskObj.id};
                    callback(err_type, err_desc, changesToImplementObj);
                }else{
                    callback(err_type, err_desc, changesToImplementObj);
                }
            });
        }else{
            // Next Sibling : NO
            // Prev Sibling : NO
            callback('', '', changesToImplementObj);
        }
    }
}

db._manipulateNextAndPrev.checkIfTaskHasSiblingsAndUpdateSiblingRelations_delete = (pUserId, pTaskObj, pFnSetPreviousSibling, pFnSetNextSibling, callback) => {
    let changesToImplementObj = {
        "changes_to_implement":{}
    }
    
    // check if it has any null siblings
    if(pTaskObj.next_sibling_id != null){
        if(pTaskObj.previous_sibling_id != null){
            // Next Sibling : YES
            // Prev Sibling : YES
            // updateTaskPreviousSibling on next sibling
            pFnSetPreviousSibling(pTaskObj.next_sibling_id, pTaskObj.previous_sibling_id, (err_type,err_desc, isDone)=>{
                if(!err_type){
                    pFnSetNextSibling(pTaskObj.previous_sibling_id, pTaskObj.next_sibling_id, (err_type, err_desc, isDone)=> {
                        if(!err_type){
                            changesToImplementObj[pTaskObj.previous_sibling_id] = {"next_sibling_id": pTaskObj.next_sibling_id};
                            changesToImplementObj[pTaskObj.next_sibling_id] = {"previous_sibling_id": pTaskObj.previous_sibling_id};

                            callback(err_type, err_desc, changesToImplementObj);
                        }else{
                            callback(err_type, err_desc, changesToImplementObj);
                        }
                    });
                }else{
                    callback(err_type,err_desc, changesToImplementObj);
                }
                
            });
        }else{
            // Next Sibling : YES
            // Prev Sibling : NO
            console.log("next yes, prev no");
            pFnSetPreviousSibling(pTaskObj.next_sibling_id, pTaskObj.previous_sibling_id, (err_type, err_desc, isDone)=> {
                if(!err_type){
                    changesToImplementObj[pTaskObj.next_sibling_id] = {"previous_sibling_id": pTaskObj.previous_sibling_id};
                    callback(err_type, err_desc, changesToImplementObj);
                }else{
                    callback(err_type, err_desc, changesToImplementObj);
                }
            });
        }
    }else{
        if(pTaskObj.previous_sibling_id != null){
            // Next Sibling : NO
            // Prev Sibling : YES
            pFnSetNextSibling(pTaskObj.previous_sibling_id, pTaskObj.next_sibling_id, (err_type, err_desc, isDone)=> {
                if(!err_type){
                    changesToImplementObj[pTaskObj.previous_sibling_id] = {"next_sibling_id": pTaskObj.next_sibling_id};
                    callback(err_type, err_desc, changesToImplementObj);
                }else{
                    callback(err_type, err_desc, changesToImplementObj);
                }
            });
        }else{
            // Next Sibling : NO
            // Prev Sibling : NO
            callback('', '', changesToImplementObj);
        }
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

db.deleteTtsAndTtsTasks = (pTtsId, pUserId, callback) => {
    db.deleteAllTtsTasks(pTtsId, pUserId, (error_type_del_tasks, error_desc_del_tasks, result_del_tasks)=>{
        if(!error_type_del_tasks){
            db.deleteTtsDbEntryWithoutDeletingTasks(pTtsId, pUserId, (error_type, error_desc, result)=>{
                callback(error_type,error_desc,result);
            });
        } else {
            callback(error_type_del_tasks,error_desc_del_tasks,result_del_tasks);
        }
    });
}

db.deleteTtsDbEntryWithoutDeletingTasks = (pTtsId, pUserId, callback) => {
    /* This function Deletes only the TTS Entry from the table "tts" in the DB linked to the userId given 
        It DOES NOT Delete all subsequent Tasks that are linked to it!!!
    */
    if (connection){
        // Delete TTS
        let query_deleteTts = `DELETE FROM tts WHERE creator_user_id = '${pUserId}' AND id = '${pTtsId}'`;
        connection.query(query_deleteTts, (err, result, fields) => {
            if (err){
                console.log(err);
                callback('db_error', '[MySQL] Error While deleting a TTS', '');
            }else {
                callback('','',true);
            }
        });
    }else{
        callback('db_error', 'Connection not established with MySQL server', '');
        console.log('Connection with DB is not established, unable to make request');
    }
}

db.deleteAllTtsTasks = (pTtsId, pUserId, callback) => {
    /* This function Deletes all the TTS Task entries from the table "tts_tasks" in the DB linked to the given Tts Task Id
    */
    if (connection){
    let query_deleteAllTtsTasks = `DELETE FROM tts_tasks WHERE creator_user_id = '${pUserId}' AND tts_id = '${pTtsId}';`

        connection.query(query_deleteAllTtsTasks, (err, result, fields) => {
            if (err){
                //console.log(err);
                callback('db_error', 'Error while deleting All TTS Task', '');
            } else {
                callback('','',true);
            }
        });
    } else {
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

/* db.updateTts = (pNewTtsObj, callback) => {
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
} */

db.updateTtsTitle = (pTtsId, pNewTtsTitle, callback) => {
    if (connection){
        let query_updateTts = `UPDATE tts SET title="${pNewTtsTitle}" WHERE id=${pTtsId};`
        connection.query(query_updateTts, (err, result, fields) => {
            if (err){
                //console.log(err);
                callback('db_error', 'Error while Updating TTS Title', '');
            } else {
                callback('','',true);
            }
        });
    }else {
        callback('db_error', 'Connection not established with MySQL server', '');
        console.log('Connection with DB is not established, unable to make request');
    }
}

db.updateTtsDuration = (pTtsId, pNewTtsDuration, callback) => {
    if (connection){
        let query_updateTtsDuration = `UPDATE tts SET duration="${pNewTtsDuration}" WHERE id=${pTtsId};`
        connection.query(query_updateTtsDuration, (err, result, fields) => {
            if (err){
                //console.log(err);
                callback('db_error', 'Error while Updating TTS Duration', '');
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