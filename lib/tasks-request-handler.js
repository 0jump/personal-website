/* 
All Requests to /tasks must pass through here
*/

const dbservices = require('./dbservices');
const moment = require('moment');

class TasksHandler {
    constructor(pReq, pRes, pAuthData) {
        // Request Object
        this.req = pReq;
        this.res = pRes;

        // Attributes of the request;
        this.func;
        this.authData = pAuthData;
    }
    handle() {
        // Actions that fill the attributes so they can be worked with, they may throw errors
        this._getFuncFromReq();

        // Execute function
        this._executeFunc();
    }
    _getFuncFromReq() {
        // Internal function that gets the function from the request
        this.func = typeof (this.req.query.func) == 'string' && this.req.query.func.trim().length > 0 ? this.req.query.func.trim() : false;

        if (!this.func) {
            this.res.status(400).json({"error": "function seems missing, not provided with the url"});
        }
    }
    _executeFunc() {
        switch (this.func) {
            case "setTaskPermissionForUser":
                this._setTaskPermissionForUser();
                break;
            case "getTaskWithChildrenDeepAsArray":
                this._getTaskWithChildrenDeepAsArray();
                break;
            case "getTaskWithChildrenDeepAndParentAsJsonObj":
                this._getTaskWithChildrenDeepAndParentAsJsonObj();
                break;
            case "createNewRootTaskForUser":
                this._createNewRootTaskForUser();
                break;
            case "createNewTaskForUser":
                this._createNewTaskForUser();
                break;
            case "deleteTaskForUser":
                this._deleteTaskForUser();
                break;
            case "getFirstGenerationSubtasks":
                this._getFirstGenerationSubtasks();
                break;
            case "getRootTaskForUserifNotFoundCreateIt":
                this._getRootTaskForUserifNotFoundCreateIt();
                break;
            case "moveTaskBefore":
                this._moveTaskBefore();
                break;
            default:
                this._unknownFunction();
        }
    }
    _setTaskPermissionForUser(){
        let taskId = this.req.body.task_id;
        let permGiverId = this.req.body.permission_giver_id;
        let permReceiverId = this.req.body.permission_receiver_id;
        let permissionType =this.req.body.permission_type;

        dbservices.setTaskPermissionForUser(taskId, permGiverId, permReceiverId, permissionType, (err_type, err_desc, isPermissionGiven)=>{
            if(!err_type){
                if(isPermissionGiven){
                    this.res.status(200).send();
                }else{
                    this.res.status(400).json({"Error": "Could not give permission"});
                }
            }else{
                this.res.status(500).send();
            }
        })
    }
    _getTaskWithChildrenDeepAsArray() {
        let taskToGetWithChildrenId = typeof (this.req.body.task_id) == 'string' ? this.req.body.task_id : false;
        // Get Task With Children (Deep) From Database as an array with no hierarchy
        dbservices.getTaskWithChildrenDeepAsArray(this.authData.user_id, taskToGetWithChildrenId, (error_type, error_desc, taskAndChildrenArray) => {
            if (!error_type) {
                this.res.status(200).json({"task_and_children_array": taskAndChildrenArray});
            } else {
                this.res.status(500).json({"error": error_type});
            }
        });
    }
    _getTaskWithChildrenDeepAndParentAsJsonObj() {
        let taskToGetWithChildrenAndParentId = typeof (this.req.body.task_id) == 'string' ? this.req.body.task_id : false;
        // Get Task With Children (Deep) From Database as an array with no hierarchy
        dbservices.getTaskWithChildrenDeepAndParentAsJsonObj(this.authData.user_id, taskToGetWithChildrenAndParentId, (error_type, error_desc, taskAndChildrenAndParentJsonObj) => {
            if (!error_type) {
                this.res.status(200).json(taskAndChildrenAndParentJsonObj);
            } else {
                this.res.status(500).json({"error": error_type});
            }
        });
    }
    _getRootTaskForUserifNotFoundCreateIt () {
        // Create Root Task
        dbservices.getRootTask(this.authData.user_id, (err_type, err_desc, rootTask) => {
            if(!err_type){
                if(rootTask == false){
                    let datetime = moment.utc().format('YYYY-MM-DD HH:mm:ss');

                    let emptyRootTaskObj = {
                        title: '',
                        parent_id: null,
                        previous_sibling_id: null,
                        next_sibling_id: null,
                        creator_user_id: this.authData.user_id,
                        date_created: datetime,
                        is_deleted: 0
                    }
            
                    dbservices.addNewTaskWithoutTouchingAnyOtherTasks(this.authData.user_id, emptyRootTaskObj, (err_type, err_desc, newRootTaskId) => {
                        if (!err_type) {
                            this.res.status(200).json({ "task_id": newRootTaskId });
                        } else {
                            this.res.status(500).json({ "error": err_type });
                        }
                    });
                } else {
                    this.res.status(200).json({"task_id": rootTask.id});
                }
            }else{
                console.log("Error", err_desc);
                this.res.status(500).json({ "error": err_type });
            }
        });
        
        
    }
    _createNewRootTaskForUser() {
        // Create Root Task And one Child Task (Both empty)
        let datetime = moment.utc().format('YYYY-MM-DD HH:mm:ss');

        let emptyRootTaskObj = {
            title: '',
            parent_id: null,
            previous_sibling_id: null,
            next_sibling_id: null,
            creator_user_id: this.authData.user_id,
            date_created: datetime,
            is_deleted: 0,
        }

        dbservices.addNewTaskWithoutTouchingAnyOtherTasks(this.authData.user_id, emptyRootTaskObj, (err_type, err_desc, newRootTaskId) => {
            if (!err_type) {
                let emptyRootChildTaskObj = {
                    title: '',
                    parent_id: newRootTaskId,
                    previous_sibling_id: null,
                    next_sibling_id: null,
                    creator_user_id: this.authData.user_id,
                    date_created: datetime,
                    is_deleted: 0,
                }
                dbservices.addNewTaskWithoutTouchingAnyOtherTasks(this.authData.user_id, emptyRootChildTaskObj, (err_type, err_desc, newRootChildTaskId) => {

                    if (!err_type) {
                        this.res.status(200).json({ "task_id": newRootTaskId});
                    } else{
                        this.res.status(500).json({"error": err_type});  
                    }
                })
            } else{
                this.res.status(500).json({"error": err_type});  
            }
        });
    }
    _createNewTaskForUser() {
        let neededItems = this.req.body;
        let neededItemsKeysArray = Object.keys(neededItems);
        
        let datetime = moment.utc().format('YYYY-MM-DD HH:mm:ss');
        
        let emptyTaskObj = {
            title: '',
            parent_id: this.req.body.parent_id,
            creator_user_id: this.authData.user_id,
            date_created: datetime,
            is_deleted: 0,
        }
        if(neededItemsKeysArray.includes("next_sibling_id")){
            // Incoming task should be before "next_sibling_id"
            emptyTaskObj.next_sibling_id = neededItems.next_sibling_id;
        }else if(neededItemsKeysArray.includes("previous_sibling_id")){
            // Incoming task should be after "previous_sibling_id"
            emptyTaskObj.previous_sibling_id = neededItems.previous_sibling_id;
        }
        //console.log('emptyTaskObj: ', emptyTaskObj);
        dbservices.addNewTaskAndChangeNextAndPreviousTasks(this.authData.user_id, emptyTaskObj, (err_type, err_desc, newTaskAndChangesToImplement)=> {
            if(!err_type){
                this.res.status(200).json(newTaskAndChangesToImplement);
            } else{
                this.res.status(500).json({"error": err_type});   
            }
        });
    }
    _deleteTaskForUser() {
        let taskToDelId = this.req.body.task_id;

        //console.log('emptyTaskObj: ', emptyTaskObj);
        dbservices.deleteTaskAndChangeNextAndPreviousTasks(this.authData.user_id, taskToDelId, (err_type, err_desc, deletedTaskIdAndChangesToImplement)=> {
            if(!err_type){
                this.res.status(200).json(deletedTaskIdAndChangesToImplement);
            }else{
                this.res.status(500).json({"error": err_type});
            }
        });
    }
    _getFirstGenerationSubtasks() {
        let taskId = this.req.body.task_id;

        dbservices.getTaskChildrenOneLayerAsArray(this.authData.user_id, taskId, (err_type, err_desc, tasksArray)=> {
            // console.log('taskId: ', taskId);
            if(!err_type){
                // console.log("user:", this.authData.user_id, ", task:", taskId);
                this.res.status(200).json(tasksArray);
            }else{
                this.res.status(500).json({"error": err_type});
            }
        });
    }
    _moveTaskBefore(){
        // moves task before new next sibling
        let taskToMoveId = this.req.body.task_id;
        let newNextSiblingId = this.req.body.new_next_sibling_id;
        let newParentId = this.req.body.new_parent_id;

        dbservices.moveTaskBeforeAnother(this.authData.user_id, taskToMoveId, newNextSiblingId, newParentId, (err_type, err_desc, changesToImplementAndOldAndNewParentId)=> {
            if(!err_type){
                this.res.status(200).json(changesToImplementAndOldAndNewParentId);
            }else if(err_type == 'input_error'){
                this.res.status(400).send();
            }
            else{
                this.res.status(500).json({"error": err_type});
            }
        });
    }
    _unknownFunction() {
        this.res.status(400).json({"error": "unknown function"});
    }
}

module.exports = TasksHandler;