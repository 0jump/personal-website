const gAccessToken = window.localStorage.getItem('access_token');
const gRootTaskId= helpers.getAllUrlParams().task_id;


let container = _("container");
let fid = -1;

class Task {
    constructor(pJsonTaskObj){
        
        this.id = pJsonTaskObj.id;

        // Relationships (Objects)
        this.parentTask = null;
        this.previousSibling = null;
        this.nextSibling = null;
        this.subtasks = {};
        
        // jsonTaskObject - Only used in constructor - DO NOT reference elsewhere
        this.jsonTaskObj = pJsonTaskObj;

        this.title = 'New Task';
    
        this.domTask;

        // 

        /* 
        For this comment "subtask<id>" refers to the subtask with this <id>
        Array that keeps track of the order of this task's subtasks

        so if its value is [subtask<33>, subtask<253>, subtask<12>, subtask<18>]
        we can say that the first subtask is subtask<33>, the second one is subtask<253> etc...
         */
        this.orderedSubtaskIdsList = [];
    }
    createDomTask(){
        this.domTask = CDE('div',[['class','task'],['id',this.id]]);
            this.domDetailsCtr = CDE('div',[['class','details-ctr']]);
                this.domTaskTitleCtr = CDE('div', [['class','task-title-ctr']]);
                    this.domTitleInput = CDE('input', [["class", 'task-title']]);
                        this.domTitleInput.value = this.title; 
                    this.domTaskTitleCtr.appendChild(this.domTitleInput);
                this.domDetailsCtr.appendChild(this.domTaskTitleCtr);

                this.domIdCtr = CDE("div", [['class', 'dom-id-ctr']]);
                    this.domIdText = CDE("span", [['class','dom-id-text']]);
                        this.domIdText.innerText = this.id;
                    this.domIdCtr.appendChild(this.domIdText);
                this.domDetailsCtr.appendChild(this.domIdCtr);
                this.domAddTaskBtnCtr = CDE('div', [['class','add-task-btn-ctr']]);
                    this.domAddTaskBtn = CDE('button', [['class','add-task-btn']]);
                        this.domAddTaskBtn.innerText = 'Add Task';
                        this.domAddTaskBtn.onclick = () => {
                            let subtasksKeysArray = Object.keys(this.subtasks);
                            let idOfLastSubtask=null;
                            if(subtasksKeysArray.length > 0){
                                idOfLastSubtask = this.getLastSubtask().id;
                            }
                            this.createSubtask("before", null);
                        }
                    this.domAddTaskBtnCtr.appendChild(this.domAddTaskBtn);
                this.domDetailsCtr.appendChild(this.domAddTaskBtnCtr);

                this.domDeleteTaskBtnCtr = CDE('div', [['class','delete-task-btn-ctr']]);
                    this.domDeleteTaskBtn = CDE('button', [['class','delete-task-btn']]);
                        this.domDeleteTaskBtn.innerText = 'Delete Task';
                        this.domDeleteTaskBtn.onclick = () => {
                            //console.log("Child: Asking parent", this.parentTask.id,"to delete me:", this.id);
                            this.parentTask.deleteSubtask(this);
                        }
                    this.domDeleteTaskBtnCtr.appendChild(this.domDeleteTaskBtn);
                this.domDetailsCtr.appendChild(this.domDeleteTaskBtnCtr);

                this.domShowSubtasksBtnCtr = CDE('div', [['class','show-subtasks-btn-ctr']]);
                    this.domShowSubtasksBtn = CDE('button', [['class','show-subtasks-btn']]);
                        this.domShowSubtasksBtn.innerText = 'Show Subtasks';
                        this.domShowSubtasksBtn.onclick = () => {
                            console.log("Subtasks of:", this.id, " are:", this.subtasks);
                        }
                    this.domShowSubtasksBtnCtr.appendChild(this.domShowSubtasksBtn);
                this.domDetailsCtr.appendChild(this.domShowSubtasksBtnCtr);
                
                this.domMoveUpBtnCtr = CDE('div', [['class','move-up-btn-ctr']]);
                    this.domMoveUpBtn = CDE('button', [['class','move-up-btn']]);
                        this.domMoveUpBtn.innerText = "UP";
                        this.domMoveUpBtn.onclick = () => {
                            this.moveMyselfUpWithinParentTask();
                        }
                    this.domMoveUpBtnCtr.appendChild(this.domMoveUpBtn);
                this.domDetailsCtr.appendChild(this.domMoveUpBtnCtr);

                this.domMoveDownBtnCtr = CDE('div', [['class','move-down-btn-ctr']]);
                    this.domMoveDownBtn = CDE('button', [['class','move-down-btn']]);
                        this.domMoveDownBtn.innerText = "Down";
                        this.domMoveDownBtn.onclick = () => {
                            this.moveMyselfDownWithinParentTask();
                        }
                    this.domMoveDownBtnCtr.appendChild(this.domMoveDownBtn);
                this.domDetailsCtr.appendChild(this.domMoveDownBtnCtr);

            this.domTask.appendChild(this.domDetailsCtr);

        let subtaskCount = Object.keys(this.subtasks).length;
        if(subtaskCount > 0){
            this.domSubtaskContainer = CDE('div',[['class','subtask-ctr']]);
            this.domTask.appendChild(this.domSubtaskContainer);

            this.initialSubtasksDomDisplay();
        }
    }
    findFirstSubtask(){
        // returns subtask with previous_subtask == null
        let subtasksKeys = Object.keys(this.subtasks)
        for (let i=0; i < subtasksKeys.length; i++){
            let subtask = this.subtasks[subtasksKeys[i]];
            if(subtask.previousSibling == null){
                return subtask;
            }
        }
    }
    initialSubtasksDomDisplay(){
        let subtask = this.findFirstSubtask();
        subtask.createDomTask();
        this.domSubtaskContainer.appendChild(subtask.domTask);
        while(subtask.nextSibling != null){
            subtask = subtask.nextSibling;
            subtask.createDomTask();
            this.domSubtaskContainer.appendChild(subtask.domTask);
        }
    }
    initialRelationshipsUpdate(pInitializedTasksObj){
        //console.log('pInitializedTasksObj: ', pInitializedTasksObj);
        // Use to ask parent to give next sibling and previous sibling Task Objects after initialization of all tasks
        if(this.jsonTaskObj.parent_id != null){
            this.parentTask = pInitializedTasksObj[this.jsonTaskObj.parent_id];
            this.parentTask.subtasks[this.id] = this;
            
        }else{
            this.parentTask = null;
        }
        if(this.jsonTaskObj.previous_sibling_id != null){
            this.previousSibling = pInitializedTasksObj[this.jsonTaskObj.previous_sibling_id];
        }else{
            this.previousSibling = null;
        }
        if(this.jsonTaskObj.next_sibling_id != null){
            this.nextSibling = pInitializedTasksObj[this.jsonTaskObj.next_sibling_id];
        }else{
            this.nextSibling = null;
        }
    }
    onTaskCreationRelationshipsUpdate(pParentTask){
        if(this.jsonTaskObj.parent_id != null){
            this.parentTask = pParentTask;
            this.parentTask.subtasks[this.id] = this;
        }else{
            this.parentTask = null;
        }
        if(this.jsonTaskObj.previous_sibling_id != null){
            this.previousSibling = pParentTask.subtasks[this.jsonTaskObj.previous_sibling_id];
        }else{
            this.previousSibling = null;
        }
        if(this.jsonTaskObj.next_sibling_id != null){
            this.nextSibling = pParentTask.subtasks[this.jsonTaskObj.next_sibling_id];
        }else{
            this.nextSibling = null;
        }
    }
    createSubtask(pBeforeOrAfter, pRefSiblingId){
        if(pBeforeOrAfter == "before"){
            ajax.me.createNewTaskForUser(gAccessToken, this.id, pRefSiblingId, "before", (xhr)=> {
                if(xhr.status == 200){
                    let newJsonTaskObjAndChangesToImplement = JSON.parse(xhr.response);
    
                    let newJsonTask = newJsonTaskObjAndChangesToImplement.new_task;
                    let changesToImplement = newJsonTaskObjAndChangesToImplement.changes_to_implement;
    
                    let newTaskObj = new Task(newJsonTask);
                    newTaskObj.onTaskCreationRelationshipsUpdate(this);
                    
                    newTaskObj.createDomTask();
                    
                    this.addSubtaskToCorrectPlaceInDom(newTaskObj); 

                    this.implementChanges(changesToImplement);
                } else{
                    console.log("status", xhr.status);
                }
            });
        }else if(pBeforeOrAfter == "after"){
            ajax.me.createNewTaskForUser(gAccessToken, this.id, pRefSiblingId, "after", (xhr)=> {
                
            });
        } else{
            alert("Unable to create subtask");
        }
    }
    implementChanges(pChangesToImplementObj){
        let changesToImplement = pChangesToImplementObj;
        let changesToImplementKeysArr = Object.keys(changesToImplement);
        for(let i =0; i< changesToImplementKeysArr.length; i++){
            let taskToBeChangedId = changesToImplementKeysArr[i];
            let taskToBeChanged = this.subtasks[taskToBeChangedId];

            let changePropertyObj = changesToImplement[taskToBeChangedId];

            let changePropertyObjKeysArray = Object.keys(changePropertyObj);
            let propertyNameKey = changePropertyObjKeysArray[0];
            let propertyNameValue = changePropertyObj[propertyNameKey];

            if(propertyNameKey == "next_sibling_id"){
                taskToBeChanged.nextSibling = this.subtasks[propertyNameValue];
            }
            if(propertyNameKey == "previous_sibling_id"){
                taskToBeChanged.previousSibling = this.subtasks[propertyNameValue];
            }
        }
    }
    /* createSubtask(pPreviousSiblingId, pNextSiblingId){
        console.log("I am", this.id, 'creating task between', pPreviousSiblingId, 'and', pNextSiblingId);
        ajax.me.createNewTaskForUser(gAccessToken, this.id, pPreviousSiblingId,pNextSiblingId, (xhr)=> {
            if(xhr.status == 200){
                let newJsonTaskObjAndChangesToImplement = JSON.parse(xhr.response);
                console.log('newJsonTaskObjAndChangesToImplement: ', newJsonTaskObjAndChangesToImplement);

                let newJsonTask = newJsonTaskObjAndChangesToImplement.new_task;
                let changesToImplement = newJsonTaskObjAndChangesToImplement.changes_to_implement;

                let newTaskObj = new Task(newJsonTask);
                newTaskObj.onTaskCreationRelationshipsUpdate(this);
                newTaskObj.createDomTask();

                this.addSubtaskToCorrectPlaceInDom(newTaskObj);
                let changesToImplementKeysArr = Object.keys(changesToImplement);
                for(let i =0; i< changesToImplementKeysArr.length; i++){
                    let taskToBeChangedId = changesToImplementKeysArr[i];
                    let taskToBeChanged = this.subtasks[taskToBeChangedId];

                    let changePropertyObj = changesToImplement[taskToBeChangedId];

                    let changePropertyObjKeysArray = Object.keys(changePropertyObj);
                    let propertyNameKey = changePropertyObjKeysArray[0];
                    let propertyNameValue = changePropertyObj[propertyNameKey];

                    if(propertyNameKey == "next_sibling_id"){
                        taskToBeChanged.nextSibling = this.subtasks[propertyNameValue];
                    }
                    if(propertyNameKey == "previous_sibling_id"){
                        taskToBeChanged.previousSibling = this.subtasks[propertyNameValue];
                    }
                }   
            } else{
                console.log("status", xhr.status);
            }
        });
    } */
    addSubtaskToCorrectPlaceInDom(pTaskToAdd){
        let subtasksKeysArray = Object.keys(this.subtasks);

        if (subtasksKeysArray.length == 0){
            this.domSubtaskContainer = CDE('div',[['class','subtask-ctr']]);
            this.domTask.appendChild(this.domSubtaskContainer);
        }else{
            if(this.domSubtaskContainer == undefined){
                
                console.log("added subtask ctr");
                this.domSubtaskContainer = CDE('div',[['class','subtask-ctr']]);
                this.domTask.appendChild(this.domSubtaskContainer);
            }
        }

        if(pTaskToAdd.previousSibling != null){
            pTaskToAdd.previousSibling.domTask.after(pTaskToAdd.domTask);
        }else{
            if(pTaskToAdd.nextSibling != null){
                pTaskToAdd.nextSibling.domTask.before(pTaskToAdd.domTask);
            }else{
                // If no next and no prev sibling
                this.domSubtaskContainer.appendChild(pTaskToAdd.domTask);
            }
        }
    }
/*     deleteSubtask(pSubtask){

        if (pSubtask.previousSibling != null){
            pSubtask.previousSibling.nextSibling = pSubtask.nextSibling;
        }
        if (pSubtask.nextSibling != null) {
            pSubtask.nextSibling.previousSibling = pSubtask.previousSibling;
        }

        this.domSubtaskContainer.removeChild(this.subtasks[pSubtask.id].domTask);
        delete this.subtasks[pSubtask.id];

        if (Object.keys(this.subtasks).length == 0){
            this.domTask.removeChild(this.domSubtaskContainer);
        }
    } */
    deleteSubtask(pSubtaskToDel){
        ajax.me.deleteTask(gAccessToken, pSubtaskToDel.id, (xhr)=> {
            if(xhr.status == 200){
                let jsonResponse = JSON.parse(xhr.response);

                let changesToImplementObj = jsonResponse.changes_to_implement;
                let taskToDeleteId = jsonResponse.delete_task;

                this.domSubtaskContainer.removeChild(this.subtasks[taskToDeleteId].domTask);
                delete this.subtasks[taskToDeleteId];

                // Check if there are no more subtasks to remove subtaskscontainer from dom
                let subtasksKeysArray = Object.keys(this.subtasks);
                this.implementChanges(changesToImplementObj);
                if (subtasksKeysArray.length == 0){
                    this.domSubtaskContainer.parentNode.removeChild(this.domSubtaskContainer);
                    delete this.domSubtaskContainer;
                }
                
            }else{
                console.log(xhr.status);
            }
        });
    }
    getLastSubtask(){

        return this.subtasks[this.domSubtaskContainer.lastChild.id];


        
    }
    changeOrderMoveUp(pSubtaskId){
        console.log("Parent: I am", this.id, "Trying to move up", pSubtaskId);
        // Check current position of the subtask that wants to change pos.
        let currentSubtaskPosition = this.orderedSubtaskIdsList.indexOf(pSubtaskId);
        console.log(pSubtaskId,"'s current position is", currentSubtaskPosition);
        // If position is the 1st (=currentSubtaskPosition == 0) 
        if(currentSubtaskPosition == 0){
            // Do nothing for now, it can't go further up
        }else if(currentSubtaskPosition > 0){
            let newPosition = currentSubtaskPosition - 1;
            // Check the id of the subtask that occupies this position
            let occupantId = this.orderedSubtaskIdsList[newPosition];
            console.log("Should be moved to position", newPosition, "in place of", occupantId);

            // Remove the subtask id from that position in the ordered subtasks list
            this.orderedSubtaskIdsList.splice(currentSubtaskPosition, 1);

            // Get the new index of the previous occupant
            let newOccupantPos = this.orderedSubtaskIdsList.indexOf(occupantId);

            // Insert the desired subtask id in place of the old occupant which will have +1 to his index
            this.orderedSubtaskIdsList.splice(newOccupantPos, 0, pSubtaskId);

            // Now to change the actual dom element position
            this.domSubtaskContainer.insertBefore(this.subtasks[pSubtaskId].domTask,this.subtasks[occupantId].domTask);

        }else{
            console.log("Error: Could not find the subtask with the id:", pSubtaskId, "in the ordered subtasks list.")
        }
    }
    moveMyselfUpWithinParentTask(){
        // Changes to previousSibling (if I have one)
        if (this.previousSibling != null){
            this.parentTask.domSubtaskContainer.insertBefore(this.domTask,this.previousSibling.domTask);
            if(this.previousSibling.previousSibling != null){
                this.previousSibling.previousSibling.nextSibling = this;
            }
            let myNewPreviousSibling = this.previousSibling.previousSibling;

            this.previousSibling.nextSibling = this.nextSibling
            this.previousSibling.previousSibling = this;
            if(this.nextSibling != null){
                this.nextSibling.previousSibling = this.previousSibling;
            }

            this.nextSibling = this.previousSibling;
            this.previousSibling = myNewPreviousSibling;
            
        }
    }
    moveMyselfDownWithinParentTask(){
        if (this.nextSibling != null){
            this.parentTask.domSubtaskContainer.insertBefore(this.domTask,this.nextSibling.domTask.nextSibling);
            if(this.nextSibling.nextSibling != null){
                this.nextSibling.nextSibling.previousSibling = this;
            }
            let myNewNextSibling = this.nextSibling.nextSibling;

            this.nextSibling.previousSibling = this.previousSibling;
            this.nextSibling.nextSibling = this;

            if(this.previousSibling != null){
                this.previousSibling.nextSibling = this.nextSibling;
            }

            this.previousSibling = this.nextSibling;
            this.nextSibling = myNewNextSibling;
        }
    }
    changeOrderMoveDown(pSubtaskId){
        //console.log("Parent: I am", this.id, "Trying to move down", pSubtaskId);
        // Check current position of the subtask that wants to change pos.
        let currentSubtaskPosition = this.orderedSubtaskIdsList.indexOf(pSubtaskId);
        //console.log(pSubtaskId,"'s current position is", currentSubtaskPosition);
        // If position is the Last in the list of ordered subtasks 
        if(currentSubtaskPosition == this.orderedSubtaskIdsList.length - 1){
            // Do nothing for now, it can't go further down
        }else if(currentSubtaskPosition < this.orderedSubtaskIdsList.length - 1){
            let newPosition = currentSubtaskPosition + 1;
            // Check the id of the subtask that occupies this position
            let occupantId = this.orderedSubtaskIdsList[newPosition];
            //console.log("Should be moved to position", newPosition, "in place of", occupantId);

            console.log('[Before]: ', this.orderedSubtaskIdsList);
            // Remove the subtask id from that position in the ordered subtasks list
            this.orderedSubtaskIdsList.splice(currentSubtaskPosition, 1);
            console.log(`[After Del ${pSubtaskId}]: `, this.orderedSubtaskIdsList);
            

            // Get the new index of the previous occupant
            let newOccupantPos = this.orderedSubtaskIdsList.indexOf(occupantId) + 1;

            // Insert the desired subtask id in place of the old occupant which will have +1 to his index
            this.orderedSubtaskIdsList.splice(newOccupantPos, 0, pSubtaskId);
            // Now to change the actual dom element position
            this.domSubtaskContainer.insertBefore(this.subtasks[pSubtaskId].domTask,this.subtasks[occupantId].domTask.nextSibling); 

        }else{
            console.log("Error: Could not find the subtask with the id:", pSubtaskId, "in the ordered subtasks list.")
        }
    }
    TakeSubTasks(pObjSubtasks){
        if(pObjSubtasks != undefined){
            let  lArrKeys = Object.keys(pObjSubtasks);
            for(let i = 0; i < lArrKeys.length; i++){
                let ljSubtask = pObjSubtasks[lArrKeys[i]];
                let lSubtask = new Task(ljSubtask.id, this, ljSubtask.previous_sibling_id, ljSubtask.next_sibling_id);
                lSubtask.prv=ljSubtask.subtasks;
                this.subtasks[lSubtask.id] = lSubtask;
            }
            lArrKeys = Object.keys(this.subtasks);
            for(let i = 0; i < lArrKeys.length; i++){
                let lSubtask = this.subtasks[lArrKeys[i]];
                lSubtask.previousSibling = this.subtasks[lSubtask.previousSibling];
                lSubtask.nextSibling = this.subtasks[lSubtask.nextSibling];
    
                lSubtask.TakeSubTasks(lSubtask.prv);
            }
        }
    }
}

let rootTask;

ajax.me.getTaskWithChildrenDeepAsArray(gAccessToken,gRootTaskId, (xhr)=> {
    if(xhr.status == 200){
        let jsonRes = JSON.parse(xhr.response);
        let taskAndChildrenArray = jsonRes.task_and_children_array;
        console.log('taskAndChildrenArray: ', taskAndChildrenArray);
        let receivedTasksObj = {}; // filled with Task -type objects
        
        //console.log('taskAndChildrenArray: ', taskAndChildrenArray);
        
        for(let ii = 0; ii < taskAndChildrenArray.length; ii++){
            let jsonTaskObj = taskAndChildrenArray[ii];
            
            // Convert To Class "Task"
            let newTaskObj = new Task(jsonTaskObj);
            receivedTasksObj[newTaskObj.id] = newTaskObj;
        }

        receivedTasksObjKeysArray = Object.keys(receivedTasksObj);
        //console.log('receivedTasksObj: ', receivedTasksObj);
        for(let ii = 0; ii < receivedTasksObjKeysArray.length; ii++){
            let taskObj = receivedTasksObj[receivedTasksObjKeysArray[ii]];

            taskObj.initialRelationshipsUpdate(receivedTasksObj);
        }

        //console.log('receivedTasksObj: ', receivedTasksObj);

        rootTask = receivedTasksObj[gRootTaskId];
        rootTask.createDomTask();
        container.appendChild(rootTask.domTask);
    } else {
        //console.log(xhr.status);
        window.location.assign("/");
    }
});