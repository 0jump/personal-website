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
    database: config.mysql.database,
    multipleStatements: true
});

let db = {};

connection.connect((err) => {
    if (err) {
        console.log('err connecting: ', err);
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

db.userExistsById = (pUserId, callback) => {
    // Callback anatomy: callback(error, error_description, returned)
    let query_isExistById = `SELECT user_id FROM users WHERE user_id = '${pUserId}'`;
    connection.query(query_isExistById, (err, result, fields)=> {
        if (err){
            callback('db_error', 'Error while cheking if new user\'s id already exists', '');
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

db.getRootTask = (pUserId, callback) => {
    // Get root task for user, if not found return false
    if (connection){
        let query_getRootTask = `SELECT id,title,parent_id,previous_sibling_id,next_sibling_id,creator_user_id,date_created,is_deleted FROM tasks WHERE parent_id IS NULL AND creator_user_id = '${pUserId}' AND is_deleted = 0`;

        connection.query(query_getRootTask, (err, result, fields) => {
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
                    callback('', '', false);
                }
            }
        });
    }else {
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

db.updateTaskNextPreviousParentRelationships = (pTaskId, pNewParentId, pNewPreviousSiblingId, pNewNextSiblingId, callback) => {
    
    if (connection){
        let query_updateTaskNextPreviousParentRelationships = `UPDATE tasks SET parent_id=${pNewParentId}, previous_sibling_id ${(pNewPreviousSiblingId == null) ? "= NULL" : "= " + pNewPreviousSiblingId}, next_sibling_id ${(pNewNextSiblingId == null) ? "= NULL" : "= " + pNewNextSiblingId} WHERE id=${pTaskId} AND is_deleted=0;`;
            
        connection.query(query_updateTaskNextPreviousParentRelationships, (err, result, fields) => {
            if (err){
                console.log(err);
                callback('db_error', "Error while Updating Task's parent, Next and previous Sibling", '');
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

db.getTaskWithChildrenDeepAndParentAsJsonObj = (pUserId, pTaskId, callback) => {
    db.getTask(pUserId, pTaskId, (error_type,error_desc,taskObj)=> {
        if(taskObj){
            let parentId = taskObj.parent_id;
            db.getTaskChildrenDeepAsArray(taskObj.id, (error_type, error_desc, arrayOfChildrenDeep)=> {
                if(!error_type){
                    db.getTask(pUserId, parentId, (error_type,error_desc,parentTaskObj)=>{
                        if(!error_type){
                            callback('','', {
                                "task": taskObj,
                                "children_array": arrayOfChildrenDeep,
                                "parent_task": parentTaskObj
                            });
                        }else{
                            callback(error_type, error_desc, tasksArray);
                        }
                    })
                }else {
                    callback(error_type,error_desc,'');
                }
            });
        }else{
            // Did not find any Task with this id
            callback('','',[]);
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
        let query_getTaskChildrenOneLayerAsArray = `SELECT id,title,parent_id,previous_sibling_id,next_sibling_id,creator_user_id,date_created,is_deleted FROM tasks WHERE parent_id ${(pTaskId == null) ? "IS NULL" : "= \'" + pTaskId + "\'"} AND creator_user_id = '${pUserId}' AND is_deleted=0;`;
        connection.query(query_getTaskChildrenOneLayerAsArray, (err, result, fields) => {
            if (!err){
                if (result.length > 0){
                    let stringifiedResults = JSON.stringify(result);
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

db.getLastTaskChildOneLayer = (pTaskId, callback) => {
    if (connection){    
        let query_getLastTaskChildOneLayer = `SELECT id,title,parent_id,previous_sibling_id,next_sibling_id,creator_user_id,date_created,is_deleted FROM tasks WHERE parent_id = '${pTaskId}' AND next_sibling_id IS NULL AND is_deleted=0;`;


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
    db.getClosestAncestorExplicitPermission(pUserId, pTaskObj.parent_id, (err_type, err_desc, parentPermType) => {
        if (!err_type) {
            if (parentPermType == "owner" || parentPermType == "can_give_permissions" || parentPermType == "can_edit") {
                if (pTaskObj.next_sibling_id != null) {
                    // Get next sibling task object to get necessary information
                    db.getTaskWithPermissions(pUserId, pTaskObj.next_sibling_id, (err_type, err_desc, nextSiblingTaskObj) => {
                        // next sibling does exist
                        // add task record of pTaskObj to receive its id
                        if (!err_type) {
                            if (pTaskObj.parent_id == nextSiblingTaskObj.parent_id) {
                                pTaskObj.previous_sibling_id = nextSiblingTaskObj.previous_sibling_id;

                                db.addNewTaskWithoutTouchingAnyOtherTasks(pUserId, pTaskObj, (err_type, err_desc, newTaskObjId) => {
                                    if (!err_type) {
                                        // Complete the task object
                                        pTaskObj.id = newTaskObjId;

                                        db._manipulateNextAndPrev.checkIfTaskHasSiblingsAndUpdateSiblingRelations_add(pUserId, pTaskObj, db.updateTaskPreviousSibling, db.updateTaskNextSibling, (err_type, err_desc, changesToImplementObj) => {
                                            let toReturn = {
                                                "new_task": pTaskObj,
                                                "changes_to_implement": changesToImplementObj
                                            }
                                            callback(err_type, err_desc, toReturn);
                                        });
                                    } else {
                                        callback(err_type, err_desc, newTaskObjId);
                                    }
                                });
                            } else {
                                callback('invalid_db_input', "new task's parent != new task's sibling's parent", {});
                            }
                        } else {
                            callback(err_type, err_desc, nextSiblingTaskObj);
                        }

                    });
                } else {
                    // Does not have next sibling check if it has any siblings at all
                    db.getTaskWithPermissions(pUserId, pTaskObj.parent_id, (err_type, err_desc, parentTaskObj) => {

                        // add task record of pTaskObj to receive its id
                        if (!err_type) {
                            db.getLastTaskChildOneLayer(pTaskObj.parent_id, (err_type, err_desc, lastChildTaskObj) => {
                                if (!err_type) {
                                    if (lastChildTaskObj != null) {
                                        pTaskObj.previous_sibling_id = lastChildTaskObj.id;
                                    } else {
                                        pTaskObj.previous_sibling_id = null;
                                    }
                                    db.addNewTaskWithoutTouchingAnyOtherTasks(pUserId, pTaskObj, (err_type, err_desc, newTaskId) => {
                                        if (!err_type) {
                                            pTaskObj.id = newTaskId;

                                            db._manipulateNextAndPrev.checkIfTaskHasSiblingsAndUpdateSiblingRelations_add(pUserId, pTaskObj, db.updateTaskPreviousSibling, db.updateTaskNextSibling, (err_type, err_desc, changesToImplementObj) => {
                                                let toReturn = {
                                                    "new_task": pTaskObj,
                                                    "changes_to_implement": changesToImplementObj
                                                }
                                                callback(err_type, err_desc, toReturn);
                                            });
                                        } else {
                                            callback(err_type, err_desc, newTaskId);
                                        }
                                    })
                                } else {
                                    callback(err_type, err_desc, lastChildTaskObj);
                                }
                            });
                        } else {
                            callback(err_type, err_desc, parentTaskObj);
                        }
                    });
                }
            } else {
                callback("input_error", "user does not have sufficient permissions to add new task in parent task provided");
            }
        } else {
            callback(err_type, err_desc, {});
            
        }
    })
}

db.deleteTaskAndChangeNextAndPreviousTasks = (pUserId, pTaskId, callback) => {
    // get task
    db.getTaskWithPermissions(pUserId, pTaskId, (err_type, err_desc, taskObj)=> {
        if(!err_type){
            // Check parent closest explicit permission
            db.getClosestAncestorExplicitPermission(pUserId, taskObj.parent_id, (err_type, err_desc, parentPermType) => {
                if(!err_type){
                    db._manipulateNextAndPrev.checkIfTaskHasSiblingsAndUpdateSiblingRelations_delete(pUserId, taskObj, db.updateTaskPreviousSibling, db.updateTaskNextSibling, (err_type, err_desc, changesToImplementObj)=>{
                        if(!err_type){
                            db.deleteTaskWithoutTouchingAnyOtherTasks(pTaskId, (err_type, err_desc, isDone)=> {
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
                    callback(err_type, err_desc, parentPermType);
                }
            })
        }else{
            callback(err_type, err_desc, taskObj);
        }
    })
    // get siblings (front and back)
    // update task to deleted = true
}

db.deleteTaskWithoutTouchingAnyOtherTasks = (pTaskId, callback) => {
    if (connection){
        let query_deleteTaskWithoutTouchingAnyOtherTasks = `UPDATE tasks SET is_deleted="1" where id=${pTaskId};`
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

db.checkIfTaskIsDescendant = (pTaskDescendentCandidateId, pTaskParent, callback) => {
    let isDescendant = false;
    db.getTaskChildrenDeepAsArray(pTaskParent, (err_type, err_desc, allDescendants)=>{
        if(!err_type){
            for(let i = 0; i < allDescendants.length; i ++){
                if(allDescendants[i].id == pTaskDescendentCandidateId){
                    isDescendant = true;
                    break;
                }
            }
            callback('', '', isDescendant);
        } else {
            callback(err_type, err_desc, false);
        }
    });
}

db.moveTaskBeforeAnotherWithoutAnyPermissionChecks = (pUserId, pTaskObj, pOldParentId, pNewNextSiblingId,pNewParentId, callback) =>{
    let taskObj = pTaskObj;
    let oldParentId = pOldParentId;

    db._manipulateNextAndPrev.checkIfTaskHasSiblingsAndUpdateSiblingRelations_delete(pUserId, taskObj, db.updateTaskPreviousSibling, db.updateTaskNextSibling, (err_type, err_desc, changesToImplementAfterRemovingTaskFromOldPos) => {
        if (!err_type) {
            taskObj.next_sibling_id = pNewNextSiblingId;
            taskObj.parent_id = pNewParentId;

            if (taskObj.next_sibling_id != null) {
                // Get next sibling task object to get necessary information
                db.getTaskWithPermissions(pUserId, taskObj.next_sibling_id, (err_type, err_desc, nextSiblingTaskObj) => {
                    // next sibling does exist
                    // add task record of pTaskObj to receive its id
                    if (!err_type) {

                        if (taskObj.parent_id == nextSiblingTaskObj.parent_id) {
                            taskObj.previous_sibling_id = nextSiblingTaskObj.previous_sibling_id;
                            
                            // UPDATE TASK RELATIONS IN DB
                            db.updateTaskNextPreviousParentRelationships(taskObj.id, taskObj.parent_id, taskObj.previous_sibling_id, taskObj.next_sibling_id, (err_type, err_desc, isUpdated) => {
                                if (!err_type) {
                                    db._manipulateNextAndPrev.checkIfTaskHasSiblingsAndUpdateSiblingRelations_add(pUserId, taskObj, db.updateTaskPreviousSibling, db.updateTaskNextSibling, (err_type, err_desc, changesToImplementAfterPuttingTaskInNewPos) => {
                                        let changesToImplementObj = { ...changesToImplementAfterRemovingTaskFromOldPos, ...changesToImplementAfterPuttingTaskInNewPos };
                                        changesToImplementObj[taskObj.id] = {
                                            "next_sibling_id": taskObj.next_sibling_id,
                                            "previous_sibling_id": taskObj.previous_sibling_id
                                        };
                                        let toReturn = {
                                            "old_parent_id": oldParentId,
                                            "new_parent_id": taskObj.parent_id,
                                            "changes_to_implement": changesToImplementObj
                                        }
                                        callback(err_type, err_desc, toReturn);
                                    });
                                } else {
                                    callback(err_type, err_desc, nextSiblingTaskObj);
                                }
                            })
                        } else {
                            callback('invalid_db_input', "new task's parent != new task's sibling's parent", {});
                        }
                    } else {
                        callback(err_type, err_desc, nextSiblingTaskObj);
                    }

                });
            } else {
                // Does not have next sibling check if it has any siblings at all
                db.getTaskWithPermissions(pUserId, taskObj.parent_id, (err_type, err_desc, parentTaskObj) => {
                    // add task record of pTaskObj to receive its id
                    if (!err_type) {
                        db.getLastTaskChildOneLayer(taskObj.parent_id, (err_type, err_desc, lastChildTaskObj) => {
                            if (!err_type) {
                                if (lastChildTaskObj != null) {
                                    taskObj.previous_sibling_id = lastChildTaskObj.id;
                                } else {
                                    taskObj.previous_sibling_id = null;
                                }
                                db.updateTaskNextPreviousParentRelationships(taskObj.id, taskObj.parent_id, taskObj.previous_sibling_id, taskObj.next_sibling_id, (err_type, err_desc, changesToImplementObj) => {
                                    
                                    if (!err_type) {
                                        db._manipulateNextAndPrev.checkIfTaskHasSiblingsAndUpdateSiblingRelations_add(pUserId, taskObj, db.updateTaskPreviousSibling, db.updateTaskNextSibling, (err_type, err_desc, changesToImplementAfterPuttingTaskInNewPos) => {
                                            let changesToImplementObj = { ...changesToImplementAfterRemovingTaskFromOldPos, ...changesToImplementAfterPuttingTaskInNewPos };
                                            changesToImplementObj[taskObj.id] = {
                                                "next_sibling_id": taskObj.next_sibling_id,
                                                "previous_sibling_id": taskObj.previous_sibling_id
                                            };
                                            let toReturn = {
                                                "old_parent_id": oldParentId,
                                                "new_parent_id": taskObj.parent_id,
                                                "changes_to_implement": changesToImplementObj
                                            }
                                            callback(err_type, err_desc, toReturn);
                                        });
                                    } else {
                                        callback(err_type, err_desc, {});
                                    }
                                })
                            } else {
                                callback(err_type, err_desc, lastChildTaskObj);
                            }
                        });
                    } else {
                        callback(err_type, err_desc, parentTaskObj);
                    }
                });
            }
        } else {
            callback(err_type, err_desc, changesToImplementObj);
        }
    });
    
}

db.moveTaskBeforeAnother = (pUserId, pTaskToMoveId, pNewNextSiblingId, pNewParentId, callback) => {
    db.getClosestAncestorExplicitPermission(pUserId, pTaskToMoveId, (err_type, err_desc, taskToMovePermission) => {
        if (!err_type) {
            if (taskToMovePermission == "can_edit" || taskToMovePermission == "can_give_permissions" || taskToMovePermission == "owner") {
                db.getClosestAncestorExplicitPermission(pUserId, pNewParentId, (err_type, err_desc, newParentTaskPermission)=> {

                    if(!err_type){
                        if(newParentTaskPermission == "can_edit" || newParentTaskPermission == "can_give_permissions" || newParentTaskPermission == "owner"){
                            // put taskToBeMoved in a position right before newNextSibling (pNewParentId is not necessary if nextSiblingId != null, i.e i don't want to put the taskToMove in the end of a task sequence)
                            if (pTaskToMoveId != pNewParentId && pTaskToMoveId != pNewNextSiblingId) {
                                db.checkIfTaskIsDescendant(pNewParentId, pTaskToMoveId, (err_type, err_desc, isDescendant) => {
                                    if (!err_type) {
                                        if (isDescendant) {
                                            callback("input_error", "cannot move task into one of its descendants", {})
                                        } else {
                                            if (pNewParentId != null) {
                                                db.getTaskWithPermissions(pUserId, pTaskToMoveId, (err_type, err_desc, taskObj) => {
                                                    let oldParentId = taskObj.parent_id;
                                                    if (!err_type) {
                                                        if(taskObj.permission_type != null){
                                                            db.moveTaskBeforeAnotherWithoutAnyPermissionChecks(pUserId, taskObj, oldParentId, pNewNextSiblingId, pNewParentId, (err_type,err_desc, toReturn) => {
                                                                callback(err_type,err_desc, toReturn);
                                                            })
                                                            /* db.isBetterPermission(taskObj.permission_type, newParentTaskPermission, (err_type,err_desc,isBetter) => {
                                                                if(!isBetter){
                                                                    // do not allow move without removing my permission
                                                                    db.removePermissionRecord(pUserId, pTaskToMoveId, (err_type,err_desc, isDone) =>{
                                                                        if(!err_type){
                                                                            db.moveTaskBeforeAnotherWithoutAnyPermissionChecks(pUserId, taskObj, oldParentId, pNewNextSiblingId, pNewParentId, (err_type,err_desc, toReturn) => {
                                                                                callback(err_type,err_desc, toReturn);
                                                                            })
                                                                        }else{
                                                                            callback(err_type,err_desc, isDone)
                                                                        }
                                                                    })
                                                                }else{
                                                                    db.moveTaskBeforeAnotherWithoutAnyPermissionChecks(pUserId, taskObj, oldParentId, pNewNextSiblingId, pNewParentId, (err_type,err_desc, toReturn) => {
                                                                        callback(err_type,err_desc, toReturn);
                                                                    })
                                                                }
                                                            })  */
                                                        }else{
                                                            db.moveTaskBeforeAnotherWithoutAnyPermissionChecks(pUserId, taskObj, oldParentId, pNewNextSiblingId, pNewParentId, (err_type,err_desc, toReturn) => {
                                                                callback(err_type,err_desc, toReturn);
                                                            })
                                                        }
                                                        
                                                    } else {
                                                        callback(err_type, err_desc, taskObj);
                                                    }
                                                })
                                            } else {
                                                callback('db_error', 'Provided new parent id is null', '');
                                            }
                                        }
                                    } else {
                                        callback(err_type, err_desc, isDescendant);
                                    }
                                })
                            } else {
                                callback("input_error", "cannot move task into or before itself", {});
                            }
                        } else {
                            callback('input_error', 'cannot move task into new parent because user does not have the required permissions of the new parent')
                        }
                    } else {
                        callback(err_type, err_desc, newParentTaskPermission);
                    }
                });
            } else {
                callback('input_error', 'cannot move task because user does not have permission to do so', false);
            }
        } else {
            callback(err_type, err_desc, resJsonObj);
        }
    })


}

db._manipulateNextAndPrev = {};

db._manipulateNextAndPrev.checkIfTaskHasSiblingsAndUpdateSiblingRelations_add = (pUserId, pTaskObj, pFnSetPreviousSibling, pFnSetNextSibling, callback) => {
    let changesToImplementObj = {}

    // check if it has any null siblings
    if (pTaskObj.next_sibling_id != null) {
        if (pTaskObj.previous_sibling_id != null) {
            // Next Sibling : YES
            // Prev Sibling : YES
            // updateTaskPreviousSibling on next sibling
            pFnSetPreviousSibling(pTaskObj.next_sibling_id, pTaskObj.id, (err_type, err_desc, isDone) => {
                if (!err_type) {
                    pFnSetNextSibling(pTaskObj.previous_sibling_id, pTaskObj.id, (err_type, err_desc, isDone) => {
                        if (!err_type) {
                            changesToImplementObj[pTaskObj.previous_sibling_id] = { "next_sibling_id": pTaskObj.id };
                            changesToImplementObj[pTaskObj.next_sibling_id] = { "previous_sibling_id": pTaskObj.id };

                            callback(err_type, err_desc, changesToImplementObj);
                        } else {
                            callback(err_type, err_desc, changesToImplementObj);
                        }
                    });
                } else {
                    callback(err_type, err_desc, changesToImplementObj);
                }

            });
        } else {
            // Next Sibling : YES
            // Prev Sibling : NO
            pFnSetPreviousSibling(pTaskObj.next_sibling_id, pTaskObj.id, (err_type, err_desc, isDone) => {
                if (!err_type) {
                    changesToImplementObj[pTaskObj.next_sibling_id] = { "previous_sibling_id": pTaskObj.id };
                    callback(err_type, err_desc, changesToImplementObj);
                } else {
                    callback(err_type, err_desc, changesToImplementObj);
                }
            });
        }
    } else {
        if (pTaskObj.previous_sibling_id != null) {
            // Next Sibling : NO
            // Prev Sibling : YES
            pFnSetNextSibling(pTaskObj.previous_sibling_id, pTaskObj.id, (err_type, err_desc, isDone) => {
                if (!err_type) {
                    changesToImplementObj[pTaskObj.previous_sibling_id] = { "next_sibling_id": pTaskObj.id };
                    callback(err_type, err_desc, changesToImplementObj);
                } else {
                    callback(err_type, err_desc, changesToImplementObj);
                }
            });
        } else {
            // Next Sibling : NO
            // Prev Sibling : NO
            callback('', '', changesToImplementObj);
        }
    }
}

db._manipulateNextAndPrev.checkIfTaskHasSiblingsAndUpdateSiblingRelations_delete = (pUserId, pTaskObj, pFnSetPreviousSibling, pFnSetNextSibling, callback) => {
    console.log("------------------------\n       IN check_delete       \n------------------------");
    console.log('Initially: ', pTaskObj);
    let changesToImplementObj = {   }
    
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
            pFnSetPreviousSibling(pTaskObj.next_sibling_id, pTaskObj.previous_sibling_id, (err_type, err_desc, isDone)=> {
                if(!err_type){
                    console.log("Setting", pTaskObj.next_sibling_id,"'s previous sibling to", pTaskObj.previous_sibling_id);
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

/* db._manipulateNextAndPrev.checkIfElementHasSiblingsAndUpdateSiblingRelations_add = (pUserId, pElemObj, pFnSetPreviousSibling, pFnSetNextSibling, callback) => {
    let changesToImplementObj = {}

    // check if it has any null siblings
    if (pElemObj.next_sibling_id != null) {
        if (pElemObj.previous_sibling_id != null) {
            // Next Sibling : YES
            // Prev Sibling : YES
            // updateTaskPreviousSibling on next sibling
            pFnSetPreviousSibling(pElemObj.next_sibling_id, pElemObj.id, (err_type, err_desc, isDone) => {
                if (!err_type) {
                    pFnSetNextSibling(pElemObj.previous_sibling_id, pElemObj.id, (err_type, err_desc, isDone) => {
                        if (!err_type) {
                            changesToImplementObj[pElemObj.previous_sibling_id] = { "next_sibling_id": pElemObj.id };
                            changesToImplementObj[pElemObj.next_sibling_id] = { "previous_sibling_id": pElemObj.id };

                            callback(err_type, err_desc, changesToImplementObj);
                        } else {
                            callback(err_type, err_desc, changesToImplementObj);
                        }
                    });
                } else {
                    callback(err_type, err_desc, changesToImplementObj);
                }

            });
        } else {
            // Next Sibling : YES
            // Prev Sibling : NO
            pFnSetPreviousSibling(pElemObj.next_sibling_id, pElemObj.id, (err_type, err_desc, isDone) => {
                if (!err_type) {
                    changesToImplementObj[pElemObj.next_sibling_id] = { "previous_sibling_id": pElemObj.id };
                    callback(err_type, err_desc, changesToImplementObj);
                } else {
                    callback(err_type, err_desc, changesToImplementObj);
                }
            });
        }
    } else {
        if (pElemObj.previous_sibling_id != null) {
            // Next Sibling : NO
            // Prev Sibling : YES
            pFnSetNextSibling(pElemObj.previous_sibling_id, pElemObj.id, (err_type, err_desc, isDone) => {
                if (!err_type) {
                    changesToImplementObj[pElemObj.previous_sibling_id] = { "next_sibling_id": pElemObjs.id };
                    callback(err_type, err_desc, changesToImplementObj);
                } else {
                    callback(err_type, err_desc, changesToImplementObj);
                }
            });
        } else {
            // Next Sibling : NO
            // Prev Sibling : NO
            callback('', '', changesToImplementObj);
        }
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




/* 
===========================================================================================================


|||||\   ||||||||   |||||\    |||\\   //|||   |||   /|||||||    /|||||||   |||   /||||||||\   |||\    |||
|||  ||  |||        |||  ||   ||| \\ // |||   |||  |||         |||         |||   |||    |||   |||\\   |||
|||||/   ||||||     |||||/    |||  |||  |||   |||   \||||||\    \||||||\   |||   |||    |||   ||| \\  |||
|||      |||        |||  ||   |||       |||   |||         |||         |||  |||   |||    |||   |||  \\ |||
|||      ||||||||   |||  ||   |||       |||   |||   |||||||/    |||||||/   |||   \||||||||/   |||   \\|||


============================================================================================================
} */

db.removePermissionRecord = (pPermissionReceiverId, pTaskId, callback) => {
    if (connection) {
        let query_removePermissionRecord = `
        delete from task_permissions where task_id=${pTaskId} and user_id=${pPermissionReceiverId};`
        connection.query(query_removePermissionRecord, (err, result, fields) => {
            if (err) {
                console.log(err);
                callback('db_error', err, '');
            } else {
                if (result.affectedRows == 1) {
                    callback('', '', true);
                } else {
                    callback('', '', false);
                }
            }
        });
    } else {
        callback('db_error', 'Connection not established with MySQL server', '');
        console.log('Connection with DB is not established, unable to make request');
    }
}

db.getExplicitTaskPermissionForTaskAndUser = (pTaskId, pUserId, callback) => {
    let query_getExplicitTaskPermissionForTaskUser = `SELECT * FROM task_permissions WHERE task_id = '${pTaskId}' AND user_id = '${pUserId}';`;

    connection.query(query_getExplicitTaskPermissionForTaskUser, (err, result, fields) => {
        if (err){
            console.log(err);
            callback('db_error', err, '');
        } else {
            if (result.length == 1){
                
                let resultAsStr = JSON.stringify(result[0]);
                if(resultAsStr){
                    helpers.asyncParseJsonToObject(resultAsStr, (parseErr, parseRes) => {
                        if (!parseErr){
                            callback('', '', parseRes.permission_type);
                        } else {
                            callback('json_error', 'Error while parsing a json string', '');
                        }
                    });
                } else {
                    callback('db_error','Unable to read user id', '');
                }
            } else {
                callback('', '', "not_found");
            }
        }
    });
}

db.getClosestAncestorWithExplicitPermissionTaskObj = (pUserId, pTaskId, callback) => {
    let query_getClosestAncestorExplicitPermission = `
    CREATE VIEW \`tasksWithParentsWithPermissionsTempView\` AS SELECT  tasks.id, 
    tasks.parent_id,
    task_permissions.user_id,
    task_permissions.permission_type
    FROM tasks 
    left JOIN task_permissions ON task_permissions.task_id = tasks.id and task_permissions.user_id = '${pUserId}';


    with recursive tasksParentsDeep (id, parent_id, user_id, permission_type) as (
    select      id,
                parent_id,
                user_id,
                permission_type
    from       tasksWithParentsWithPermissionsTempView
    where      (id = '${pTaskId}')
    union all
    select      t.id,
                t.parent_id,
                t.user_id,
                t.permission_type
    from        tasksWithParentsWithPermissionsTempView t
    inner join tasksParentsDeep
            on t.id = tasksParentsDeep.parent_id 


    )select * from tasksParentsDeep where(permission_type is not null) limit 1;

    drop view \`tasksWithParentsWithPermissionsTempView\`;`
    connection.query(query_getClosestAncestorExplicitPermission, (err, result, fields) => {
        if(!err){
            if (result.length > 0){
                let resultAsStr = JSON.stringify(result[1]);
                if(resultAsStr){
                    helpers.asyncParseJsonToObject(resultAsStr, (parseErr, parseRes) => {
                        if (!parseErr){
                            if(parseRes.length > 0){
                                callback('', '', parseRes[0]);
                            }else{
                                callback('','', null);
                            }
                            
                        } else {
                            callback('json_error', 'Error while parsing a json string', '');
                        }
                    });
                } else {
                    callback('db_error','Unable to read result as string', '');
                }
            } else {
                callback('', '', null);
            }
        }else{
            console.log(err);
            callback('db_error', err, '');
        }
    })
}

db.getClosestAncestorExplicitPermission = (pUserId, pTaskId, callback) => {
    let query_getClosestAncestorExplicitPermission = `
    CREATE VIEW \`tasksWithParentsWithPermissionsTempView\` AS SELECT  tasks.id, 
    tasks.parent_id,
    task_permissions.user_id,
    task_permissions.permission_type
    FROM tasks 
    left JOIN task_permissions ON task_permissions.task_id = tasks.id and task_permissions.user_id = '${pUserId}';


    with recursive tasksParentsDeep (id, parent_id, user_id, permission_type) as (
    select      id,
                parent_id,
                user_id,
                permission_type
    from       tasksWithParentsWithPermissionsTempView
    where      (id = '${pTaskId}')
    union all
    select      t.id,
                t.parent_id,
                t.user_id,
                t.permission_type
    from        tasksWithParentsWithPermissionsTempView t
    inner join tasksParentsDeep
            on t.id = tasksParentsDeep.parent_id 


    )select * from tasksParentsDeep where(permission_type is not null) limit 1;

    drop view \`tasksWithParentsWithPermissionsTempView\`;`
    connection.query(query_getClosestAncestorExplicitPermission, (err, result, fields) => {
        if(!err){
            if (result.length > 0){
                let resultAsStr = JSON.stringify(result[1]);
                if(resultAsStr){
                    helpers.asyncParseJsonToObject(resultAsStr, (parseErr, parseRes) => {
                        if (!parseErr){
                            if(parseRes.length > 0){
                                callback('', '', parseRes[0].permission_type);
                            }else{
                                callback('','', "not_found");
                            }
                            
                        } else {
                            callback('json_error', 'Error while parsing a json string', '');
                        }
                    });
                } else {
                    callback('db_error','Unable to read result as string', '');
                }
            } else {
                callback('', '', "not_found");
            }
        }else{
            console.log(err);
            callback('db_error', err, '');
        }
    })
}

db.checkIfUserCanGivePermission = (pUserId, pTaskId, callback) => {
    db.getExplicitTaskPermissionForTaskAndUser(pTaskId, pUserId, (err_type, err_desc, permissionType) => {
        if(!err_type){
            if(permissionType == "can_give_permissions" || permissionType == "owner"){
                callback('', '', true);
            }else{
                callback('', '', false);
            }
        }else{
            callback(err_type, err_desc, permissionType)
        }
    })
}
db.getTasksSharedWithUser = (pUserId, callback) => {
    let query_getTasksSharedWithUser = `
        select  t.id,
                t.title,
                t.parent_id,
                t.previous_sibling_id,
                t.next_sibling_id,
                t.creator_user_id,
                t.date_created,
                t.is_deleted
        FROM tasks t
        left JOIN task_permissions ON task_permissions.task_id = t.id and task_permissions.user_id = ${pUserId}
        where (task_permissions.permission_type != "owner" and task_permissions.permission_type != "no_permission" and t.is_deleted = 0);`

        connection.query(query_getTasksSharedWithUser, (err, result, fields) => {
            if (!err){
                if (result.length > 0){
                    let stringifiedResults = JSON.stringify(result);
                    helpers.asyncParseJsonToObject(stringifiedResults, (parseErr, parseRes) => {
                        if (!parseErr) {
                            let taskSharedWithUserArray = parseRes;
                            callback('','', taskSharedWithUserArray);
                        } else {
                            callback('json_error', 'Error while parsing a json string', '');
                        }
                    });
                }else {
                    // Did not find any tasks shared with pUserId
                    callback('', '', []);
                }
            } else {
                //console.log(err);
                callback('db_error', `[MySQL] Error while getting Task: \n${err}`, '');
            }
        });
}

db.getAllUsersThatHaveExplicitPermissionsOnTask = (pLoggedInUser, pTaskId, callback) => {
    // check if user has the right to ask about this task (= do they have the "read_only" permission or above on this task)
    db.getClosestAncestorExplicitPermission(pLoggedInUser,pTaskId,  (err_type, err_desc, permissionType) => {
        if(!err_type){
            if(permissionType == "no_permission" || permissionType == "read_only" || permissionType == "can_edit" || permissionType == "can_give_permissions" || permissionType == "owner"){
                let query_etAllUsersThatHaveExplicitPermissionsOnTask = `SELECT * FROM task_permissions WHERE task_id = '${pTaskId}'`;

                connection.query(query_etAllUsersThatHaveExplicitPermissionsOnTask, (err, result, fields) => {
                    if (!err){
                        if (result.length > 0){
                            let resultAsStr = JSON.stringify(result/* [0] */);
                            if(resultAsStr){
                                helpers.asyncParseJsonToObject(resultAsStr, (parseErr, parseRes) => {
                                    if (!parseErr){
                                        let toReturn = {
                                            "task_id": pTaskId,
                                            "users_and_permissions":{}
                                        };
                                        for(let i = 0; i < result.length; i ++){
                                            let permissionJsonObj = result[i];
                                            let user_id = permissionJsonObj.user_id;
                                            let permissionType = permissionJsonObj.permission_type;

                                            toReturn.users_and_permissions[user_id] = permissionType;
                                        }

                                        callback('', '', toReturn);
                                    } else {
                                        callback('json_error', 'Error while parsing a json string', '');
                                    }
                                });
                            } else {
                                callback('db_error','Unable to read result as string', '');
                            }
                        } else {
                            callback('', '', {
                                "task_id": pTaskId,
                                            "users_and_permissions":{}
                            });
                        }
                    } else {
                        console.log(err);
                        callback('db_error', err, '');
                    }
                });
            }else{
                callback("input_error", "user does not have the permission to check the permissions of this task", "");
            }
        }else{
            callback(err_type, err_desc, permissionType)
        }
    })
}

db.getTaskWithPermissions = (pPermissionReceiverId, pTaskId, callback) => {
    let query_getTaskWithPermissions = `
    with \`tasksJoinTaskPermissions\` as (
        SELECT  
                       tasks.id,
                       tasks.title,
                       tasks.parent_id,
                       tasks.previous_sibling_id,
                       tasks.next_sibling_id,
                       tasks.creator_user_id,
                       tasks.date_created,
                       tasks.is_deleted,
                       task_permissions.user_id,
                       task_permissions.permission_type
       FROM tasks 
       left JOIN task_permissions ON task_permissions.task_id = tasks.id and user_id = '${pPermissionReceiverId}' where tasks.id='${pTaskId}'
       )
       select * from tasksJointaskPermissions where permission_type is null or permission_type != "no_permission" and is_deleted=0;
    `;
    connection.query(query_getTaskWithPermissions, (err, result, fields) => {
        if (err){
            console.log(err);
            callback('db_error', err, '');
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
                callback('input_error', 'Could not find any task with requested id', false);
            }
        }
    });
}

db.getChildrenDeepWithPermissionsSharedWithUser = (pPermissionReceiverId, pTaskId, callback) => {
    // Gets pTaskId and all its children excluding tasks that have permission_type = "no_permission" and their descendants
    let query_getTaskWithChildrenDeepWithPermissions = `
    create view \`tasksJoinTaskPermissionsWithoutNoPermission\` as
    with \`tasksJoinTaskPermissions\` as (
    SELECT  
                    tasks.id,
                    tasks.title,
                    tasks.parent_id,
                    tasks.previous_sibling_id,
                    tasks.next_sibling_id,
                    tasks.creator_user_id,
                    tasks.date_created,
                    tasks.is_deleted,
                    task_permissions.user_id,
                    task_permissions.permission_type
    FROM tasks 
    left JOIN task_permissions ON task_permissions.task_id = tasks.id and user_id = '${pPermissionReceiverId}'
    )
    select * from tasksJointaskPermissions where permission_type is null or permission_type != "no_permission";
    
    
    with recursive tasksChildrenDeepWithPermissions (				
                    id,
                    title,
                    parent_id,
                    previous_sibling_id,
                    next_sibling_id,
                    creator_user_id,
                    date_created,
                    is_deleted,
                    permission_receiver_id,
                    permission_type) as (
    select      	id,
                    title,
                    parent_id,
                    previous_sibling_id,
                    next_sibling_id,
                    creator_user_id,
                    date_created,
                    is_deleted,
                    user_id,
                    permission_type
    from       tasksJoinTaskPermissionsWithoutNoPermission
    where      (parent_id = '${pTaskId}')
    union all
    select     
                    t.id,
                    t.title,
                    t.parent_id,
                    t.previous_sibling_id,
                    t.next_sibling_id,
                    t.creator_user_id,
                    t.date_created,
                    t.is_deleted,
                    t.user_id,
                    t.permission_type
    from        tasksJoinTaskPermissionsWithoutNoPermission t
    inner join tasksChildrenDeepWithPermissions
            on t.parent_id = tasksChildrenDeepWithPermissions.id 
    )select * from tasksChildrenDeepWithPermissions where is_deleted=0;
    
    
    drop view \`tasksJoinTaskPermissionsWithoutNoPermission\`;`

    connection.query(query_getTaskWithChildrenDeepWithPermissions, (err, result, fields) => {
        if(!err){
            if (result.length > 0){
                let resultAsStr = JSON.stringify(result[1]);
                if(resultAsStr){
                    helpers.asyncParseJsonToObject(resultAsStr, (parseErr, parseRes) => {
                        if (!parseErr){
                            let tasksWithPermissionsRecordsArray = parseRes;
                            callback('', '', tasksWithPermissionsRecordsArray);
                        } else {
                            callback('json_error', 'Error while parsing a json string', '');
                        }
                    });
                } else {
                    callback('db_error','Unable to read result as string', '');
                }
            } else {
                callback('', '', "not_found");
            }
        }else{
            console.log(err);
            callback('db_error', err, '');
        }
    })
}


db.getTaskWithChildrenDeepWithPermissionsSharedWithUser = (pPermissionReceiverId, pTaskId, callback) => {
    db.getClosestAncestorExplicitPermission(pPermissionReceiverId, pTaskId, (err_type, err_desc, closestAncestorPerm) => {
        if(!err_type){
            if(closestAncestorPerm == "read_only" || closestAncestorPerm == "can_edit" || closestAncestorPerm == "can_give_permissions" || closestAncestorPerm == "owner"){
                db.getTaskWithPermissions(pPermissionReceiverId, pTaskId, (err_type, err_desc, jsonTaskObj) => {
                    if(!err_type){
                        db.getChildrenDeepWithPermissionsSharedWithUser(pPermissionReceiverId, pTaskId, (err_type, err_desc, descendantsWithPermissionsArray) => {
                            callback(err_type, err_desc, {
                                "task": jsonTaskObj,
                                "children_array": descendantsWithPermissionsArray
                            });
                        })
                    }else{
                        callback(err_type,err_desc, {});
                    }
                })
                
            }else{
                callback("input_error", "user does not have enough permission to view requested task", {});
            }
            
        }else{
            callback(err_type, err_desc, [])
        }
    } )

}

db.getTaskWithChildrenDeepWithPermissionsSharedWithUserAndElements = (pPermissionReceiverId, pTaskId, callback) => {
    db.getClosestAncestorExplicitPermission(pPermissionReceiverId, pTaskId, (err_type, err_desc, closestAncestorPerm) => {
        if(!err_type){
            if(closestAncestorPerm == "read_only" || closestAncestorPerm == "can_edit" || closestAncestorPerm == "can_give_permissions" || closestAncestorPerm == "owner"){
                db.getTaskWithPermissions(pPermissionReceiverId, pTaskId, (err_type, err_desc, jsonTaskObj) => {
                    if(!err_type){
                        db.getChildrenDeepWithPermissionsSharedWithUserAndElementsWithoutCheckingForPermissions(pPermissionReceiverId, pTaskId, (err_type, err_desc, descendantsWithPermissionsArrayAndElementsArray) => {
                            callback(err_type, err_desc, {
                                "task": jsonTaskObj,
                                "children_array": descendantsWithPermissionsArrayAndElementsArray.children_array,
                                "elements_array": descendantsWithPermissionsArrayAndElementsArray.elements_array
                            });
                        })
                    }else{
                        callback(err_type,err_desc, {});
                    }
                })
                
            }else{
                callback("input_error", "user does not have enough permission to view requested task", {});
            }
            
        }else{
            callback(err_type, err_desc, [])
        }
    } )
}

db.getChildrenDeepWithPermissionsSharedWithUserAndElementsWithoutCheckingForPermissions = (pPermissionReceiverId, pTaskId, callback) => {
    let query_getChildrenDeepWithPermissionsSharedWithUserAndElements =`
    create view \`tasksJoinTaskPermissionsWithoutNoPermission\` as
    with \`tasksJoinTaskPermissions\` as (
    SELECT  
                    tasks.id,
                    tasks.title,
                    tasks.parent_id,
                    tasks.previous_sibling_id,
                    tasks.next_sibling_id,
                    tasks.creator_user_id,
                    tasks.date_created,
                    tasks.is_deleted,
                    task_permissions.user_id,
                    task_permissions.permission_type
    FROM tasks 
    left JOIN task_permissions ON task_permissions.task_id = tasks.id and user_id = '${pPermissionReceiverId}'
    )
    select * from tasksJointaskPermissions where permission_type is null or permission_type != "no_permission";
    
    create view \`tasksChildrenDeepWithPermission\` as
    with recursive tasksChildrenDeepWithPermissionsRec (				
                    id,
                    title,
                    parent_id,
                    previous_sibling_id,
                    next_sibling_id,
                    creator_user_id,
                    date_created,
                    is_deleted,
                    permission_receiver_id,
                    permission_type) as (
    select      	id,
                    title,
                    parent_id,
                    previous_sibling_id,
                    next_sibling_id,
                    creator_user_id,
                    date_created,
                    is_deleted,
                    user_id,
                    permission_type
    from       tasksJoinTaskPermissionsWithoutNoPermission
    where      (id = '${pTaskId}')
    union all
    select     
                    t.id,
                    t.title,
                    t.parent_id,
                    t.previous_sibling_id,
                    t.next_sibling_id,
                    t.creator_user_id,
                    t.date_created,
                    t.is_deleted,
                    t.user_id,
                    t.permission_type
    from        tasksJoinTaskPermissionsWithoutNoPermission t
    inner join tasksChildrenDeepWithPermissionsRec
            on t.parent_id = tasksChildrenDeepWithPermissionsRec.id 
    )select * from tasksChildrenDeepWithPermissionsRec where is_deleted=0;
    
    select * from tasksChildrenDeepWithPermission where id != '${pTaskId}';

    select 
		task_elements.id,
        task_elements.task_id,
        task_elements.previous_sibling_id,
        task_elements.next_sibling_id,
        task_elements.date_created,
        task_elements.creator_user_id,
        task_elements.is_deleted
    
    from task_elements 
    left JOIN tasksChildrenDeepWithPermission on task_elements.task_id=tasksChildrenDeepWithPermission.id 
    where task_elements.is_deleted=0 and tasksChildrenDeepWithPermission.is_deleted=0;
    
    
    drop view \`tasksChildrenDeepWithPermission\`;
    
    drop view \`tasksJoinTaskPermissionsWithoutNoPermission\`;`

    if(connection){
        connection.query(query_getChildrenDeepWithPermissionsSharedWithUserAndElements, (err, result, fields) => {
            if(!err){
                if (result.length > 0){
                    let resultAsStr = JSON.stringify(result);
                    if(resultAsStr){
                        helpers.asyncParseJsonToObject(resultAsStr, (parseErr, parseRes) => {
                            if (!parseErr){
                                let tasksWithPermissionsRecordsArray = parseRes[2]
                                let elementsArray = parseRes[3];
                                let toReturn = {
                                    'children_array': tasksWithPermissionsRecordsArray,
                                    'elements_array': elementsArray
                                }
                                callback('', '', toReturn);
                            } else {
                                callback('json_error', 'Error while parsing a json string', '');
                            }
                        });
                    } else {
                        callback('db_error','Unable to read result as string', '');
                    }
                } else {
                    callback('', '', "not_found");
                }
            }else{
                console.log(err);
                callback('db_error', err, '');
            }
        })
    }else {
        callback('db_error', 'Connection not established with MySQL server', '');
        console.log('Connection with DB is not established, unable to make request');
    }
}
    



db.updateOrAddIfNotExistsTaskPermissionForUserWithoutTouchingAnything = (pTaskId, pPermissionGiverReceiverId, pNewTypeOfPermission, callback) => {
    // Use with Caution. This function does not check anything before changing or adding permission type.
    // Note: there is no permission giver (permission giver is also permission receiver). Try not to use this
    if (db._permissionsList.includes(pNewTypeOfPermission)) {
        db.getExplicitTaskPermissionForTaskAndUser(pTaskId, pPermissionGiverReceiverId, (err_type, err_desc, existingPermissionType)=> {
            let datetime = moment.utc().format('YYYY-MM-DD HH:mm:ss');
            if (existingPermissionType && existingPermissionType != "not_found") {
                let query_updatePermission = `UPDATE task_permissions SET permission_type="${pNewTypeOfPermission}", creator_user_id="${pPermissionGiverReceiverId}", date_created="${datetime}" WHERE user_id="${pPermissionGiverReceiverId}" AND task_id="${pTaskId}";`

                connection.query(query_updatePermission, (err, result, fields) => {
                    if (!err) {
                        callback('', '', true);
                    } else {
                        console.log(err);
                        callback('db_error', err, '');
                    }
                });
    
    
            } else {
                console.log("There is no permission type, adding one");
                let query_addNewPermission = `INSERT INTO task_permissions (user_id,task_id,permission_type,creator_user_id,date_created) VALUES ("${pPermissionGiverReceiverId}", "${pTaskId}","${pNewTypeOfPermission}", "${pPermissionGiverReceiverId}", "${datetime}")`;
    
                db.userExistsById(pPermissionGiverReceiverId, (err_type, err_desc, doesExist) => {
                    if (doesExist) {
                        connection.query(query_addNewPermission, (err, result, fields) => {
                            if (!err) {
                                callback('', '', true);
                            } else {
                                console.log(err);
                                callback('db_error', err, '');
                            }
                        });
                    } else {
                        callback('', '', false);
                    }
                });
            }
        })      
    }
}

db.isBetterPermission = (pNewPermission, pOldPermission, callback) => {
    // If at the same level returns false
    if(db._permissionsList.includes(pNewPermission)){
        if(pOldPermission == "no_permission"){
            switch(pNewPermission){
                // Anything is better than no permission except itself
                case "no_permission":
                    callback('','',false);
                    break;
                default:
                    callback('','',true);
            }
        }else if (pOldPermission == "read_only"){
            switch(pNewPermission){
                case "no_permission":
                    callback('','',false);
                    break;
                case "read_only":
                    callback('','',false);
                    break;
                default:
                    callback('','',true);
            }
        }else if (pOldPermission == "can_edit"){
            switch(pNewPermission){
            
                case "no_permission":
                    callback('','',false);
                    break;
                case "read_only":
                    callback('','',false);
                    break;
                case "can_edit":
                    callback('', '', false);
                    break;
                default:
                    callback('','',true);
            }
        }else if (pOldPermission == "can_give_permissions"){
            switch(pNewPermission){
                
                case "no_permission":
                    callback('','',false);
                    break;
                case "read_only":
                    callback('','',false);
                    break;
                case "can_edit":
                    callback('', '', false);
                    break;
                case "can_give_permissions":
                    callback('', '', false);
                    break;
                default:
                    callback('','',true);
            }
        }else if (pOldPermission == "owner"){
            callback('', '', false);
        }
    }else{
        callback("input_error", "new permission is not a valid type of permission", false)
    }
}

db.updateOrAddIfNotExistsTaskPermissionWithoutCheckingIfPermGiverCanGivePerm = (pTaskId, pPermissionGiverId, pPermissionReceiverId, pNewTypeOfPermission, callback) => {
    if (db._permissionsList.includes(pNewTypeOfPermission)) {
        // Check if user already has a permission for the task in question
        db.getClosestAncestorWithExplicitPermissionTaskObj(pPermissionReceiverId, pTaskId, (err_type, err_desc, closestAncestorObj) => {
            if (!err_type) {
                let datetime = moment.utc().format('YYYY-MM-DD HH:mm:ss');
                if(closestAncestorObj != null){
                    db.isBetterPermission(pNewTypeOfPermission, closestAncestorObj.permission_type, (err_type,err_desc, isBetter) => {
                        if (!err_type) {
                            if (isBetter || closestAncestorObj.id == pTaskId) {
                                // Permission Receiver should not be owner
                                if (closestAncestorObj.permission_type != "owner") {
                                    db.getExplicitTaskPermissionForTaskAndUser(pTaskId, pPermissionReceiverId, (err_type, err_desc, existingPermission) => {
                                        if (!err_type) {
    
                                            if (existingPermission && existingPermission != "not_found") {
                                                let query_updatePermission = `UPDATE task_permissions SET permission_type="${pNewTypeOfPermission}", creator_user_id="${pPermissionGiverId}", date_created="${datetime}" WHERE user_id="${pPermissionReceiverId}" AND task_id="${pTaskId}";`
                                                connection.query(query_updatePermission, (err, result, fields) => {
                                                    
                                                    if (!err) {
                                                        if (result.affectedRows == 1) {
                                                            callback('', '', true);
                                                        } else {
                                                            callback('', '', false);
                                                        }
                                                    } else {
                                                        console.log(err);
                                                        callback('db_error', err, '');
                                                    }
                                                });
    
                                            } else {
                                                console.log("There is no permission type, adding one");
                                                let query_addNewPermission = `INSERT INTO task_permissions (user_id,task_id,permission_type,creator_user_id,date_created) VALUES ("${pPermissionReceiverId}", "${pTaskId}","${pNewTypeOfPermission}", "${pPermissionGiverId}", "${datetime}")`;
    
                                                db.userExistsById(pPermissionReceiverId, (err_type, err_desc, doesExist) => {
                                                    if (doesExist) {
                                                        connection.query(query_addNewPermission, (err, result, fields) => {
                                                            if (!err) {
                                                                callback('', '', true);
                                                            } else {
                                                                console.log(err);
                                                                callback('db_error', err, '');
                                                            }
                                                        });
                                                    } else {
                                                        callback('', '', false);
                                                    }
                                                });
                                            }
                                        } else {
                                            callback(err_type, err_desc, '');
                                        }
                                    })
                                } else {
                                    callback('input_error', 'Permission type cannot be changed for the task owner', false);
                                }
    
                            } else {
                                callback("input_error", "cannot give a task more restrictions than it's closest explicit ancestor");
                            }
                        } else {
                            callback(err_type, err_desc, '');
                        }
                    })
                } else {
                    // Closest ancestor is null
                    let query_addNewPermission = `INSERT INTO task_permissions (user_id,task_id,permission_type,creator_user_id,date_created) VALUES ("${pPermissionReceiverId}", "${pTaskId}","${pNewTypeOfPermission}", "${pPermissionGiverId}", "${datetime}")`;

                    db.userExistsById(pPermissionReceiverId, (err_type, err_desc, doesExist) => {
                        if (doesExist) {
                            connection.query(query_addNewPermission, (err, result, fields) => {
                                if (!err) {
                                    callback('', '', true);
                                } else {
                                    console.log(err);
                                    callback('db_error', err, '');
                                }
                            });
                        } else {
                            callback('', '', false);
                        }
                    });
                }
                
            } else {
                callback(err_type, err_desc, '');
            }
        });
    } else {
        callback('', '', false);
    }
}

db.updateOrAddIfNotExistsTaskPermissionForUser = (pTaskId, pPermissionGiverId, pPermissionReceiverId, pNewTypeOfPermission, callback) => {
    db.getClosestAncestorExplicitPermission(pPermissionGiverId, pTaskId, (err_type, err_desc, giverPermissionType) => {
        if(!err_type){
            // Permission Giver should have: can_give_permissions or owner
            if(giverPermissionType == "owner" || giverPermissionType == "can_give_permissions"){
                db.updateOrAddIfNotExistsTaskPermissionWithoutCheckingIfPermGiverCanGivePerm(pTaskId, pPermissionGiverId, pPermissionReceiverId, pNewTypeOfPermission, (err_type, err_desc, isDone)=> {
                    callback(err_type,err_desc, isDone)
                    
                });
            }else{
                callback("input_error", "permission giver does not have the permission to change permissions", '');
            }
        }else{
            callback(err_type,err_desc,'');
        }
    });
}

db._permissionsList = ["no_permission", "read_only", "can_edit", "can_give_permissions", "owner"];

/* db.getLastPermissionForTaskAndUser = (pTaskId, pUserId, callback) => {
    query_getLastPermissionForTaskUser = `SELECT * FROM task_permissions WHERE task_id = '${pTaskId}' AND user_id = '${pUserId}' ORDER BY id DESC LIMIT 1 ;`;

    connection.query(query_getLastPermissionForTaskUser, (err, result, fields) => {
        if (err){
            console.log(err);
            callback('db_error', err, '');
        } else {
            if (result.length == 1){
                
                let resultAsStr = JSON.stringify(result[0]);
                if(resultAsStr){
                    helpers.asyncParseJsonToObject(resultAsStr, (parseErr, parseRes) => {
                        if (!parseErr){
                            callback('', '', parseRes.permission_type);
                        } else {
                            callback('json_error', 'Error while parsing a json string', '');
                        }
                    });
                } else {
                    callback('db_error','Unable to read user id', '');
                }
            } else {
                callback('', '', "not_found");
            }
        }
    });
} */



/* db.setTaskPermissionForUser = (pTaskId, pPermissionGiverId, pPermissionReceiverId, pTypeOfPermission, callback) => {
    if(db._permissionsList.includes(pTypeOfPermission)){
        let datetime = moment.utc().format('YYYY-MM-DD HH:mm:ss');
        let query_addNewPermission = `INSERT INTO task_permissions(user_id,task_id,permission_type,creator_user_id,date_created) VALUES ("${pPermissionReceiverId}", "${pTaskId}","${pTypeOfPermission}", "${pPermissionGiverId}", "${datetime}")`;
    
        db.getLastPermissionForTaskAndUser(pTaskId, pPermissionGiverId, (err_type, err_desc, permission)=> {
            if(permission == "can_give_permissions"){
                db.userExistsById(pPermissionReceiverId, (err_type, err_desc, doesExist) => {
                    if(doesExist){
                        connection.query(query_addNewPermission, (err, result, fields) => {
                            if (!err){
                                callback('','',true);
                            } else {
                                console.log(err);
                                callback('db_error', err, '');
                            }
                        });
                    }else{
                        callback('', '', false);
                    }
                });
            }else{
                callback('', '', false);
            }
        })
    }else{
        callback('', '', false);
    }
} */

db.updateTaskTitle = (pUserId, pTaskId, pNewTitle,callback) => {
    db.getClosestAncestorWithExplicitPermissionTaskObj(pUserId, pTaskId, (err_type, err_desc, closestExplTaskObj) => {
        if(!err_type){
            if(closestExplTaskObj.permission_type == "can_edit" || closestExplTaskObj.permission_type == "can_give_permissions" || closestExplTaskObj.permission_type == "owner"){
                let query_updateTaskTitle = `
                UPDATE tasks SET title="${pNewTitle}" WHERE id=${pTaskId};
                `
                connection.query(query_updateTaskTitle, (err, result, fields) => {
                    if (!err) {
                        if (result.affectedRows == 1) {
                            callback('', '', {
                                "is_updated": true,
                                "new_title": pNewTitle
                            });
                        } else {
                            callback('', '', {
                                "is_updated": false,
                                "new_title": ""
                            });
                        }
                    } else {
                        console.log(err);
                        callback('db_error', err, '');
                    }
                });
            }else{
                callback("input_error", "cannot update title because not enough permission", {})
            }
        }else{
            callback(err_type,err_desc, {});
        }
    })
}

db.addNewTaskElementWithoutTouchingOtherElements = (pElementObj, callback) => {

    let query = `INSERT INTO task_elements(task_id,previous_sibling_id,next_sibling_id,date_created,creator_user_id, is_deleted) VALUES ("${pElementObj.task_id}",`
    if (pElementObj.previous_sibling_id == null) {
        query = query + `NULL, `;
    } else {
        query = query + `"${pElementObj.previous_sibling_id}", `;
    }
    if (pElementObj.next_sibling_id == null) {
        query = query + `NULL, `;
    } else {
        query = query + `"${pElementObj.next_sibling_id}", `;
    }
    query_addNewTaskElement = query + `"${pElementObj.date_created}","${pElementObj.creator_user_id}","${pElementObj.is_deleted}")`;
    
    connection.query(query_addNewTaskElement, (err, result, fields) => {
        if (err){
            console.log(err);
            callback('db_error', err, '');
        } else {
            let query_getLastInsertId = `SELECT LAST_INSERT_ID()`;
            connection.query(query_getLastInsertId, (err, result, fields) => {
                if (err){
                    console.log(err);
                    callback('db_error', err, '');
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
                            callback('db_error','unable to stringify result', '');
                        }
                    } else {
                        callback('','',false);
                    }
                }
            });
        }
    });
}

db.addNewElementForTask = (pNewElementObj, callback) => {
    console.log('pNewElementObj: ', pNewElementObj);
    db.getClosestAncestorExplicitPermission(pNewElementObj.creator_user_id, pNewElementObj.task_id, (err_type,err_desc, closestAncPerm) => {
        if(!err_type){
            db.isBetterPermission(closestAncPerm, "read_only", (err_type,err_desc, (err_type, err_desc,isBetter)=>{
                if(isBetter){
                    if (pNewElementObj.next_sibling_id != null) {
                        // Get next sibling element object to get necessary information
                        db.getElement(pNewElementObj.next_sibling_id, (err_type, err_desc, nextSiblingElemObj) => {
                            // next sibling does exist
                            if (!err_type) {
                                if (pNewElementObj.task_id == nextSiblingElemObj.task_id) {
                                    pNewElementObj.previous_sibling_id = nextSiblingElemObj.previous_sibling_id;
    
                                    db.addNewTaskElementWithoutTouchingOtherElements(pNewElementObj, (err_type, err_desc, idOfNewElement) =>{
                                        if(!err_type){
                                            if(idOfNewElement){
                                                // Complete the element object
                                                pNewElementObj.id = idOfNewElement;
                
                                                db._manipulateNextAndPrev.checkIfTaskHasSiblingsAndUpdateSiblingRelations_add(pNewElementObj.creator_user_id, pNewElementObj, db.updateElementPreviousSibling, db.updateElementNextSibling, (err_type, err_desc, changesToImplementObj) => {
                                                    let toReturn = {
                                                        "new_element": pNewElementObj,
                                                        "changes_to_implement": changesToImplementObj
                                                    }
                                                    callback(err_type, err_desc, toReturn);
                                                });
                                            }else{
                                                console.log("Something is seriously wrong 1928412");
                                                callback('','', false);
                                            }
                                        }else{
                                            callback(err_type,err_desc, false);
                                        }
                                    })
                                } else {
                                    callback('invalid_db_input', "new element's task != new elements's sibling's task", {});
                                }
                            } else {
                                callback(err_type, err_desc, nextSiblingTaskObj);
                            }
    
                        });
                    } else {
                        // Does not have next sibling check if it has any siblings at all
                        db.getTaskWithPermissions(pNewElementObj.creator_user_id, pNewElementObj.task_id, (err_type, err_desc, parentTaskObj) => {
    
                            // add task record of pTaskObj to receive its id
                            if (!err_type) {
                                db.getLastElementInTask(pNewElementObj.task_id, (err_type, err_desc, lastElemObj) => {
                                    if (!err_type) {
                                        if (lastElemObj != null) {
                                            pNewElementObj.previous_sibling_id = lastElemObj.id;
                                        } else {
                                            pNewElementObj.previous_sibling_id = null;
                                        }
                                        db.addNewTaskElementWithoutTouchingOtherElements(pNewElementObj, (err_type, err_desc, idOfNewElement) =>{
                                            if(!err_type){
                                                if(idOfNewElement){
                                                    // Complete the task object
                                                    pNewElementObj.id = idOfNewElement;
                    
                                                    db._manipulateNextAndPrev.checkIfTaskHasSiblingsAndUpdateSiblingRelations_add(pNewElementObj.creator_user_id, pNewElementObj, db.updateElementPreviousSibling, db.updateElementNextSibling, (err_type, err_desc, changesToImplementObj) => {
                                                        let toReturn = {
                                                            "new_element": pNewElementObj,
                                                            "changes_to_implement": changesToImplementObj
                                                        }
                                                        callback(err_type, err_desc, toReturn);
                                                    });
                                                }else{
                                                    console.log("Something is seriously wrong 1928412");
                                                    callback('','', false);
                                                }
                                            }else{
                                                callback(err_type,err_desc, false);
                                            }
                                        })
                                    } else {
                                        callback(err_type, err_desc, lastChildTaskObj);
                                    }
                                });
                            } else {
                                callback(err_type, err_desc, parentTaskObj);
                            }
                        });
                    }                    
                }else{
                    callback("input_error", "cannot add new element because not enough permission", false);
                }
            })) 
        }else{
            callback(err_type,err_desc, false);
        }
    });
}

db.deleteElementWithoutTouchingAnyOtherElements = (pElementId, callback) => {
    let query_deleteElementWithoutTouchingAnyOtherElements = `
    UPDATE task_elements SET is_deleted=1 WHERE id=${pElementId};
    ` 
    if(connection) {
        connection.query(query_deleteElementWithoutTouchingAnyOtherElements, (err, result, fields) => {
            if (!err){
                callback('','', true);
            } else {
                callback('db_error', err, false);
            }
        });
    }else {
        callback('db_error', 'Connection not established with MySQL server', '');
        console.log('Connection with DB is not established, unable to make request');
    }
}

db.deleteElementAndChangeNextAndPreviousTasks = (pUserId, pElementId, callback) => {
    db.getElement(pElementId, (err_type ,err_desc, elementObj)=> {
        if(!err_type){
            // Check if user has permission on element
            db.getClosestAncestorWithExplicitPermissionTaskObj(pUserId, elementObj.task_id, (err_type, err_desc, closestAncTaskObj) => {
                if (!err_type) {
                    let closestAncPerm = closestAncTaskObj.permission_type;
                    if (closestAncPerm == "can_edit" || closestAncPerm == "can_give_permissions" || closestAncPerm == "owner") {

                        db._manipulateNextAndPrev.checkIfTaskHasSiblingsAndUpdateSiblingRelations_delete(pUserId, elementObj, db.updateElementPreviousSibling, db.updateElementNextSibling, (err_type, err_desc, changesToImplementObj) => {
                            if (!err_type) {
                                db.deleteElementWithoutTouchingAnyOtherElements(pElementId, (err_type, err_desc, isDeleted) => {
                                    if (!err_type) {
                                        let toReturn = {
                                            "delete_element": elementObj.id,
                                            "changes_to_implement": changesToImplementObj
                                        }
                                        console.log('toReturn: ', toReturn);
                                        callback('', '', toReturn)
                                    } else {
                                        callback(err_type, err_desc, {});
                                    }
                                })

                            } else {
                                callback(err_type, err_desc, {})
                            }

                        })

                    } else {
                        callback("input_error", "cannot delete element because user does not have enough permission on task", false)
                    }
                } else {
                    callback(err_type,err_desc, false);
                }
            })
        }else{
            
        }
    })
}

db.getElement = (pElementId, callback) => {
    let query_getElement = `select * from task_elements where id=${pElementId} and is_deleted=0;`
    connection.query(query_getElement, (err, result, fields) => {
        if (err){
            //console.log(err);
            callback('db_error', err, '');
        } else {
            if (result.length > 0){
                let row = JSON.stringify(result[0]);
                helpers.asyncParseJsonToObject(row, (parseErr, parseRes) => {
                    if (!parseErr){
                        let elemRecordObj = parseRes;
                        callback('','',elemRecordObj);
                    } else {
                        //console.log(parseErr);
                        callback('json_error', 'Error while parsing a json string', '');
                    }
                });
            }else {
                // Did not find any tasks with this id
                callback('db_error', '[MySql]Could not find any element with requested id', false);
            }
        }
    });
}


db.getLastElementInTask = (pTaskId, callback) => {
    if (connection){    
        let query_getLastElementInTask = `SELECT * FROM task_elements WHERE task_id='${pTaskId}' AND next_sibling_id IS NULL AND is_deleted=0;`

        connection.query(query_getLastElementInTask, (err, result, fields) => {
            if (!err){
                if (result.length > 0){
                    let stringifiedResults = JSON.stringify(result);
                    helpers.asyncParseJsonToObject(stringifiedResults, (parseErr, parseRes) => {
                        if (!parseErr) {
                            let lastElemInTask = parseRes[0];
                            callback('','', lastElemInTask);
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
                callback('db_error', `[MySQL] Error while getting last element in task: \n${err}`, '');
            }
        });
    }else {
        callback('db_error', 'Connection not established with MySQL server', '');
        console.log('Connection with DB is not established, unable to make request');
    }
}

db.updateElementPreviousSibling = (pElemId, pNewPreviousSiblingId, callback) => {
    if (connection){
        let query_updateTaskPreviousSibling = `UPDATE task_elements SET previous_sibling_id=${pNewPreviousSiblingId} WHERE id=${pElemId} AND is_deleted=0;`;
        connection.query(query_updateTaskPreviousSibling, (err, result, fields) => {
            if (err){
                console.log(err);
                callback('db_error', "Error while Updating Element's Previous Sibling", '');
            } else {
                callback('','', true);
            }
        });
    }else {
        callback('db_error', 'Connection not established with MySQL server', '');
        console.log('Connection with DB is not established, unable to make request');
    }
}

db.updateElementNextSibling = (pElemId, pNewNextSiblingId, callback) => {
    if (connection){
        let query_updateElemNextSibling = `UPDATE task_elements SET next_sibling_id=${pNewNextSiblingId} WHERE id=${pElemId} AND is_deleted=0;`;
        connection.query(query_updateElemNextSibling, (err, result, fields) => {
            if (err){
                console.log(err);
                callback('db_error', "Error while Updating Element's Next Sibling", '');
            } else {
                callback('','', true);
            }
        });
    }else {
        callback('db_error', 'Connection not established with MySQL server', '');
        console.log('Connection with DB is not established, unable to make request');
    }
}

db.updateElementNextPreviousTaskRelationships = (pElementId, pNewTaskId, pNewPreviousSiblingId, pNewNextSiblingId, callback) => {
    if (connection){
        let query_updateElementNextPreviousTaskRelationships = `UPDATE task_elements SET task_id=${pNewTaskId}, previous_sibling_id ${(pNewPreviousSiblingId == null) ? "= NULL" : "= " + pNewPreviousSiblingId}, next_sibling_id ${(pNewNextSiblingId == null) ? "= NULL" : "= " + pNewNextSiblingId} WHERE id=${pElementId} AND is_deleted=0;`;
            
        connection.query(query_updateElementNextPreviousTaskRelationships, (err, result, fields) => {
            if (err){
                console.log(err);
                callback('db_error', err, '');
            } else {
                callback('','', true);
            }
        });
    }else {
        callback('db_error', 'Connection not established with MySQL server', '');
        console.log('Connection with DB is not established, unable to make request');
    }
}





db.moveElementBeforeAnotherWithoutAnyPermissionChecks = (pUserId, pElemObj, pOldTaskId, pNewNextSiblingId,pNewTaskId, callback) => {
    
    let elementToMoveObj = pElemObj;
    let oldTaskId = pOldTaskId;

    
    console.log('Element to be changed: ', elementToMoveObj.id);
    console.log('New Next Sibling: ', pNewNextSiblingId);
    console.log('New Task Id: ', pNewTaskId);
    console.log('pElemObj: ', pElemObj);

    db._manipulateNextAndPrev.checkIfTaskHasSiblingsAndUpdateSiblingRelations_delete(pUserId, elementToMoveObj, db.updateElementPreviousSibling, db.updateElementNextSibling, (err_type, err_desc, changesToImplementAfterRemovingElementFromOldPos) => {
        if (!err_type) {
            elementToMoveObj.next_sibling_id = pNewNextSiblingId;
            elementToMoveObj.task_id = pNewTaskId;
            console.log('elementToMoveObj: ', elementToMoveObj);

            if (pNewNextSiblingId != null) {
                // Get next sibling task object to get necessary information
                db.getElement(elementToMoveObj.next_sibling_id, (err_type, err_desc, nextSiblingElementObj) => {
                    // next sibling does exist
                    // add task record of pTaskObj to receive its id
                    if (!err_type) {

                        elementToMoveObj.previous_sibling_id = nextSiblingElementObj.previous_sibling_id;
                        // UPDATE TASK RELATIONS IN DB
                        db.updateElementNextPreviousTaskRelationships(elementToMoveObj.id, elementToMoveObj.task_id, elementToMoveObj.previous_sibling_id, elementToMoveObj.next_sibling_id, (err_type, err_desc, isUpdated) => {
                            if (!err_type) {
                                db._manipulateNextAndPrev.checkIfTaskHasSiblingsAndUpdateSiblingRelations_add(pUserId, elementToMoveObj, db.updateElementPreviousSibling, db.updateElementNextSibling, (err_type, err_desc, changesToImplementAfterPuttingElementInNewPos) => {
                                    let changesToImplementObj = helpers.mergeChangesToImplementObjects(changesToImplementAfterPuttingElementInNewPos, changesToImplementAfterRemovingElementFromOldPos)
                                    changesToImplementObj[elementToMoveObj.id] = {
                                        "next_sibling_id": elementToMoveObj.next_sibling_id,
                                        "previous_sibling_id": elementToMoveObj.previous_sibling_id
                                    };
                                    let toReturn = {
                                        "old_task_id": oldTaskId,
                                        "new_task_id": elementToMoveObj.task_id,
                                        "changes_to_implement": changesToImplementObj
                                    }
                                    callback(err_type, err_desc, toReturn);
                                });
                            } else {
                                callback(err_type, err_desc, nextSiblingElementObj);
                            }
                        })
                    } else {
                        callback(err_type, err_desc, nextSiblingElementObj);
                    }
                });
            } else {
                // Does not have next sibling check if it has any siblings at all
                db.getTaskWithPermissions(pUserId, elementToMoveObj.task_id, (err_type, err_desc, taskObj) => {
                    // add element record of pElemObj to receive its id
                    if (!err_type) {
                        db.getLastElementInTask(elementToMoveObj.task_id, (err_type, err_desc, lastChildElemObj) => {
                            if (!err_type) {
                                if (lastChildElemObj != null) {
                                    elementToMoveObj.previous_sibling_id = lastChildElemObj.id;
                                } else {
                                    elementToMoveObj.previous_sibling_id = null;
                                }
                                db.updateElementNextPreviousTaskRelationships(elementToMoveObj.id, pNewTaskId, elementToMoveObj.previous_sibling_id, elementToMoveObj.next_sibling_id, (err_type, err_desc, changesToImplementObj) => {
                                    
                                    if (!err_type) {
                                        db._manipulateNextAndPrev.checkIfTaskHasSiblingsAndUpdateSiblingRelations_add(pUserId, elementToMoveObj, db.updateElementPreviousSibling, db.updateElementNextSibling, (err_type, err_desc, changesToImplementAfterPuttingElementInNewPos) => {
                                            let changesToImplementObj = helpers.mergeChangesToImplementObjects(changesToImplementAfterPuttingElementInNewPos, changesToImplementAfterRemovingElementFromOldPos)
                                            changesToImplementObj[elementToMoveObj.id] = {
                                                "next_sibling_id": elementToMoveObj.next_sibling_id,
                                                "previous_sibling_id": elementToMoveObj.previous_sibling_id
                                            };
                                            let toReturn = {
                                                "old_task_id": oldTaskId,
                                                "new_task_id": elementToMoveObj.task_id,
                                                "changes_to_implement": changesToImplementObj
                                            }
                                            callback(err_type, err_desc, toReturn);
                                        });
                                    } else {
                                        callback(err_type, err_desc, {});
                                    }
                                })
                            } else {
                                callback(err_type, err_desc, {});
                            }
                        });
                    } else {
                        callback(err_type, err_desc, taskObj);
                    }
                });
            }
        } else {
            callback(err_type, err_desc, {});
        }
    });
}




db.moveElementBeforeAnother = (pUserId, pElementId, pNewNextSiblingId, pNewTaskId,callback) => {
    db.getElement(pElementId, (err_type,err_desc, elementToMoveObj) => {
        if(!err_type){
            db.getClosestAncestorExplicitPermission(pUserId, elementToMoveObj.task_id, (err_type, err_desc, taskToMovePermission) => {
                if (!err_type) {
                    if (taskToMovePermission == "can_edit" || taskToMovePermission == "can_give_permissions" || taskToMovePermission == "owner") {
                        // Check if next sibling is not null
                        if(pNewNextSiblingId != null){
                            if(pNewNextSiblingId != pElementId){
                                db.getElement(pNewNextSiblingId, (err_type,err_desc, newNextSiblingObj) => {
                                    if(!err_type){
                                        db.getClosestAncestorExplicitPermission(pUserId, newNextSiblingObj.task_id, (err_type, err_desc, newParentTaskPermission)=> {
                                            if(!err_type){
                                                if(newParentTaskPermission == "can_edit" || newParentTaskPermission == "can_give_permissions" || newParentTaskPermission == "owner"){
                                                    let oldTaskId = elementToMoveObj.task_id;
                                                    db.moveElementBeforeAnotherWithoutAnyPermissionChecks(pUserId, elementToMoveObj, oldTaskId, newNextSiblingObj.id, pNewTaskId, (err_type,err_desc, toReturn) => {
                                                        callback(err_type,err_desc, toReturn);
                                                    })
                                                } else {
                                                    callback('input_error', 'cannot move element into new task because user does not have the required permissions of the new task')
                                                }
                                            } else {
                                                callback(err_type, err_desc, newParentTaskPermission);
                                            }
                                        });
                                    }else{
                                        callback(err_type,err_desc, {})
                                    }
                                })
                            }else{
                                callback('input_error', 'cannot move element before itself', {})
                            }
                        }else{
                            
                            db.getClosestAncestorExplicitPermission(pUserId, pNewTaskId, (err_type, err_desc, newParentTaskPermission)=> {
                                if(!err_type){
                                    if(newParentTaskPermission == "can_edit" || newParentTaskPermission == "can_give_permissions" || newParentTaskPermission == "owner"){
                                        let oldTaskId = elementToMoveObj.task_id;
                                        db.moveElementBeforeAnotherWithoutAnyPermissionChecks(pUserId, elementToMoveObj, oldTaskId, pNewNextSiblingId, pNewTaskId, (err_type,err_desc, toReturn) => {
                                            callback(err_type,err_desc, toReturn);
                                        })
                                    } else {
                                        callback('input_error', 'cannot move element into new task because user does not have the required permissions of the new task')
                                    }
                                } else {
                                    callback(err_type, err_desc, {});
                                }
                            });
                            
                        }
                    } else {
                        callback('input_error', 'cannot move element because user does not have permission to do so', false);
                    }
                } else {
                    callback(err_type, err_desc, resJsonObj);
                }
            })
        }else{
            callback(err_type,err_desc, {})
        }
    })
}



db.addNewTts = (ttsObj, callback) => {
    /* 
    Add new empty entry to tts table and return the TTS id
    */
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
    let query_getAllTts = `SELECT id,title,description,duration,date_created FROM tts WHERE creator_user_id = '${pUserId}' `;

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






module.exports = db;