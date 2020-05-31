const gAccessToken = window.localStorage.getItem('access_token');
const gRootTaskId= helpers.getAllUrlParams().task_id;
let gRootTask;
let gCutElementId;

let gCutTask = null; 

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
        this.elements = {};
        
        // jsonTaskObject - Only used in constructor - DO NOT reference elsewhere
        this.jsonTaskObj = pJsonTaskObj;


        this.title = pJsonTaskObj.title;
    
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
                        this.domTitleInput.onblur = () => {this.updateMyTitle()}
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
                
                this.domCutBtnCtr = CDE('div', [['class','cut-btn-ctr']]);
                    this.domCutBtn = CDE('button', [['class','cut-btn']]);
                        this.domCutBtn.innerText = "Cut";
                        this.domCutBtn.onclick = () => {
                            this.cutTask();
                        }
                    this.domCutBtnCtr.appendChild(this.domCutBtn);
                this.domDetailsCtr.appendChild(this.domCutBtnCtr);


                this.domPasteBeforeBtnCtr = CDE('div', [['class','paste-before-btn-ctr']]);
                    this.domPasteBeforeBtn = CDE('button', [['class','paste-before-btn']]);
                        this.domPasteBeforeBtn.innerText = "Paste Before Me";
                        this.domPasteBeforeBtn.onclick = () => {
                            this.pasteBeforeMe();
                        }
                    this.domPasteBeforeBtnCtr.appendChild(this.domPasteBeforeBtn);
                this.domDetailsCtr.appendChild(this.domPasteBeforeBtnCtr);

                this.domPasteInMeAtTheEndBtnCtr = CDE('div', [['class','paste-in-me-at-the-end-btn-ctr']]);
                    this.domPasteInMeAtTheEndBtn = CDE('button', [['class','paste-in-me-at-the-end-btn']]);
                        this.domPasteInMeAtTheEndBtn.innerText = "Paste In Me At The End";
                        this.domPasteInMeAtTheEndBtn.onclick = () => {
                            this.pasteInMeAtTheEnd()
                        }
                    this.domPasteInMeAtTheEndBtnCtr.appendChild(this.domPasteInMeAtTheEndBtn);
                this.domDetailsCtr.appendChild(this.domPasteInMeAtTheEndBtnCtr);
                

                this.domShowElementsBtnCtr = CDE('div', []);
                this.domShowElementsBtn = CDE('button', []);
                    this.domShowElementsBtn.innerText = "Show Elements";
                    this.domShowElementsBtn.onclick = () => {
                        console.log(this.elements);
                    }
                this.domShowElementsBtnCtr.appendChild(this.domShowElementsBtn);
            this.domDetailsCtr.appendChild(this.domShowElementsBtnCtr);

                this.domDetailsCtr.appendChild(CDE('hr', [['class','separator']]));


                this.domShareUserInputCtr = CDE('div', [['class', 'share-user-input-ctr']]);
                    this.domShareUserInput = CDE('input', [['class', 'share-user-input'],['placeholder','user id']]);
                    this.domShareUserInputCtr.appendChild(this.domShareUserInput );
                this.domDetailsCtr.appendChild(this.domShareUserInputCtr);

                this.domSharePermissionTypeInputCtr = CDE('div', [['class', 'share-permission-type-input-ctr']]);
                    this.domSharePermissionTypeInput = CDE('input', [['class', 'share-permission-type-input'], ['placeholder','permission type']]);
                        
                    this.domSharePermissionTypeInputCtr.appendChild(this.domSharePermissionTypeInput );
                this.domDetailsCtr.appendChild(this.domSharePermissionTypeInputCtr);

                this.domShareBtnCtr = CDE('div', [['class','share-btn-ctr']]);
                    this.domShareBtn = CDE('button', [['class','share-btn']]);
                        this.domShareBtn.innerText = "Share";
                        this.domShareBtn.onclick = () => {
                            console.log("domShareUserInput", this.domShareUserInput.value);
                            console.log('domSharePermissionTypeInput: ', this.domSharePermissionTypeInput.value);

                            this.grantUserPermissionOverMe(this.domShareUserInput.value, this.domSharePermissionTypeInput.value);
                        }
                    this.domShareBtnCtr.appendChild(this.domShareBtn);
                this.domDetailsCtr.appendChild(this.domShareBtnCtr);
                
                this.domSharedWithCtr = CDE('div', [['class', 'shared-with-ctr']]);
                    this.domSharedWithLabel = CDE('span', [['class', 'shared-with-lbl']]);
                        this.domSharedWithLabel.innerText = "Shared with:"
                    this.domSharedWithCtr.appendChild(this.domSharedWithLabel);
                    this.domListOfSharedUsers = CDE('ul', [['class','list-shared-users']]);
                        this.getMySharedUsersAndDisplayThem();
                    this.domSharedWithCtr.appendChild(this.domListOfSharedUsers);
                    
                this.domDetailsCtr.appendChild(this.domSharedWithCtr);

                this.domDetailsCtr.appendChild(CDE('hr', [['class','separator']]));

                // Here goes the domElementsCtr
                
                this.domAddElementBtnCtr = CDE('div', [['class', 'add-elem-btn-ctr']])
                    this.domAddElementBtn = CDE('button', [['class', 'add-elem-btn']])
                        this.domAddElementBtn.innerText = "Add Element"
                        this.domAddElementBtn.onclick = () => {this.createElement(null)};
                    this.domAddElementBtnCtr.appendChild(this.domAddElementBtn)
                this.domDetailsCtr.appendChild(this.domAddElementBtnCtr)

            this.domTask.appendChild(this.domDetailsCtr);
        
        let elementCount = Object.keys(this.elements).length;
        if(elementCount > 0){
            this.domElementsCtr = CDE('div', [['class', 'elements-ctr']])
            this.domDetailsCtr.insertBefore(this.domElementsCtr, this.domAddElementBtnCtr);
            
            this.initialElementsDomDisplay();
        }
        
        let subtaskCount = Object.keys(this.subtasks).length;
        if(subtaskCount > 0){
            this.domSubtaskContainer = CDE('div',[['class','subtask-ctr']]);
            this.domTask.appendChild(this.domSubtaskContainer);

            this.initialSubtasksDomDisplay();
        }
    }
    initialSubtasksDomDisplay(){
        let subtask = this.getFirstSubtask();
        subtask.createDomTask();
        this.domSubtaskContainer.appendChild(subtask.domTask);
        while(subtask.nextSibling != null){
            subtask = subtask.nextSibling;
            subtask.createDomTask();
            this.domSubtaskContainer.appendChild(subtask.domTask);
        }
    }
    initialElementsDomDisplay(){
        let element = this.getFirstElement();
        element.createDomElem();
        this.domElementsCtr.appendChild(element.domElem);
        while(element.nextSibling != null){
            element = element.nextSibling;
            element.createDomElem();
            this.domElementsCtr.appendChild(element.domElem);
        }
    }
    initialRelationshipsUpdate(pInitializedTasksObj){
        //console.log('pInitializedTasksObj: ', pInitializedTasksObj);
        // Use to ask parent to give next sibling and previous sibling Task Objects after initialization of all tasks
        if(this.jsonTaskObj.parent_id != null){
            this.parentTask = pInitializedTasksObj[this.jsonTaskObj.parent_id];
            if (typeof(this.parentTask) === 'undefined'){
                this.parentTask = null;
            }else{
                this.parentTask.subtasks[this.id] = this;
            }
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

                    this.implementChangesForSubtasks(changesToImplement);
                } else if(xhr.status == 403){
                    window.location.assign("/");
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
    createElement(pNewNextSiblingId){
        ajax.me.createNewElementForTask(gAccessToken, this.id, pNewNextSiblingId, (xhr)=> {
            if(xhr.status == 200){
                let newJsonElemObjAndChangesToImplement = JSON.parse(xhr.response);

                let newJsonElem = newJsonElemObjAndChangesToImplement.new_element;
                let changesToImplement = newJsonElemObjAndChangesToImplement.changes_to_implement;

                let newElemObj = new Element(newJsonElem);
                

                newElemObj.onElemCreationRelationshipsUpdate(this);
                
                newElemObj.createDomElem();

                this.addElementToCorrectPlaceInDom(newElemObj); 

                this.implementChangesForElements(changesToImplement);
            }else if(xhr.status == 403){
                window.location.assign("/");
            } else{
                console.log("status", xhr.status);
            }
        });
    }
    implementChangesForSubtasks(pChangesToImplementObj){
        // When message coming from server contains a "changes_to_implement" section
        let changesToImplement = pChangesToImplementObj;
        let changesToImplementKeysArr = Object.keys(changesToImplement);
        for(let i = 0; i< changesToImplementKeysArr.length; i++){
            let taskToBeChangedId = changesToImplementKeysArr[i];
            
            let taskToBeChanged = this.subtasks[taskToBeChangedId];
            if(typeof(taskToBeChanged) !== 'undefined'){
                //console.log("I am", this.id, "I found", taskToBeChanged.id,"in my subtasks");

                let changePropertyObj = changesToImplement[taskToBeChangedId];
                //console.log(`[${this.id}]`,'changePropertyObj: ', changePropertyObj);

                let changePropertyObjKeysArray = Object.keys(changePropertyObj);
                //console.log(`[${this.id}]`,'changePropertyObjKeysArray: ', changePropertyObjKeysArray);

                for(let ii = 0; ii < changePropertyObjKeysArray.length; ii++){
                    let propertyNameKey = changePropertyObjKeysArray[ii];
                    let propertyNameValue = changePropertyObj[propertyNameKey];
    
                    if(propertyNameKey == "next_sibling_id"){
                        if(typeof(this.subtasks[propertyNameValue]) == 'undefined'){
                            taskToBeChanged.nextSibling = null;
                        }else{
                            taskToBeChanged.nextSibling = this.subtasks[propertyNameValue];
                        }
                    }
                    if(propertyNameKey == "previous_sibling_id"){
                        if(typeof(this.subtasks[propertyNameValue]) == 'undefined'){
                            taskToBeChanged.previousSibling = null;
                        }else{
                            taskToBeChanged.previousSibling = this.subtasks[propertyNameValue];
                        }
                    }
                }

            }
        }
    }
    implementChangesForElements(pChangesToImplementObj){
        // When message coming from server contains a "changes_to_implement" section
        let changesToImplement = pChangesToImplementObj;
        let changesToImplementKeysArr = Object.keys(changesToImplement);
        for(let i = 0; i< changesToImplementKeysArr.length; i++){
            let elemToBeChangedId = changesToImplementKeysArr[i];
            
            let elemToBeChanged = this.elements[elemToBeChangedId];
            if(typeof(elemToBeChanged) !== 'undefined'){
                //console.log("I am", this.id, "I found", elemToBeChanged.id,"in my elements");

                let changePropertyObj = changesToImplement[elemToBeChangedId];
                //console.log(`[${this.id}]`,'changePropertyObj: ', changePropertyObj);

                let changePropertyObjKeysArray = Object.keys(changePropertyObj);
                //console.log(`[${this.id}]`,'changePropertyObjKeysArray: ', changePropertyObjKeysArray);

                for(let ii = 0; ii < changePropertyObjKeysArray.length; ii++){
                    let propertyNameKey = changePropertyObjKeysArray[ii];
                    let propertyNameValue = changePropertyObj[propertyNameKey];
    
                    if(propertyNameKey == "next_sibling_id"){
                        if(typeof(this.elements[propertyNameValue]) == 'undefined'){
                            elemToBeChanged.nextSibling = null;
                        }else{
                            elemToBeChanged.nextSibling = this.elements[propertyNameValue];
                        }
                    }
                    if(propertyNameKey == "previous_sibling_id"){
                        if(typeof(this.elements[propertyNameValue]) == 'undefined'){
                            elemToBeChanged.previousSibling = null;
                        }else{
                            elemToBeChanged.previousSibling = this.elements[propertyNameValue];
                        }
                    }
                }

            }
        }
    }
    getMySharedUsersAndDisplayThem(){
        ajax.me.getAllUsersThatHaveExplicitPermissionsOnTask(gAccessToken,this.id, (xhr)=>{
            if(xhr.status == 200){
                let returnedJsonObj = JSON.parse(xhr.response);
                let usersPermissionsObj = returnedJsonObj.users_and_permissions;
                let usersPermissionsKeys = Object.keys(usersPermissionsObj);
                for(let i = 0; i < usersPermissionsKeys.length; i++){
                    let userId = usersPermissionsKeys[i];
                    let permissionType = usersPermissionsObj[userId];

                    if(permissionType != 'no_permission'){
                        let newDomListItem = CDE('li', [['class', 'shared-user-li']])
                        newDomListItem.innerText = `#${userId}: ${permissionType}`;
                        this.domListOfSharedUsers.appendChild(newDomListItem);
                    }   
                }
            }else{

            }
        })
    }
    grantUserPermissionOverMe(pPermissionReceiverId, pTypeOfPermission){
        ajax.me.setTaskPermissionForUser(gAccessToken, this.id,pPermissionReceiverId , pTypeOfPermission, (xhr)=>{
            if(xhr.status == 200){
                alert("Permission Granted");
            }else{
                console.log(xhr.status);
            }
        }) 
    }
    updateMyTitle(){
        ajax.me.updateTaskTitle(gAccessToken, this.id, this.domTitleInput.value, (xhr)=>{
            if(xhr.status==200){
                
            }else if (xhr.status == 403){
                window.location.assign("/");
            }  else {
                alert('Could not update Task Title');
                console.log(xhr.status)
            }
        })
        
    }
    addSubtaskToCorrectPlaceInDom(pTaskToAdd){
        let subtasksKeysArray = Object.keys(this.subtasks);

        if (subtasksKeysArray.length == 0){
            this.domSubtaskContainer = CDE('div',[['class','subtask-ctr']]);
            this.domTask.appendChild(this.domSubtaskContainer);
        }else{
            if(this.domSubtaskContainer == undefined){
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
    addElementToCorrectPlaceInDom(pElemToAdd){
        let elemKeysArray = Object.keys(this.elements);

        if (elemKeysArray.length == 0){
            this.domElementsCtr = CDE('div',[['class','elements-ctr']]);
            this.domDetailsCtr.insertBefore(this.domElementsCtr, this.domAddElementBtnCtr);
        }else{
            if(this.domElementsCtr == undefined){
                this.domElementsCtr = CDE('div',[['class','elements-ctr']]);
                this.domDetailsCtr.insertBefore(this.domElementsCtr, this.domAddElementBtnCtr);
            }
        }
        if(pElemToAdd.previousSibling != null){
            pElemToAdd.previousSibling.domElem.after(pElemToAdd.domElem);
        }else{
            if(pElemToAdd.nextSibling != null){
                pElemToAdd.nextSibling.domElem.before(pElemToAdd.domElem);
            }else{
                // If no next and no prev sibling
                this.domElementsCtr.appendChild(pElemToAdd.domElem);
            }
        }
    }
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
                this.implementChangesForSubtasks(changesToImplementObj);
                if (subtasksKeysArray.length == 0){
                    this.domSubtaskContainer.parentNode.removeChild(this.domSubtaskContainer);
                    delete this.domSubtaskContainer;
                }
                
            }else{
                console.log(xhr.status);
            }
        });
    }
    deleteElement(pElemToDelete){
        ajax.me.deleteElement(gAccessToken, pElemToDelete.id, (xhr) => {
            if(xhr.status == 200 ){
                let jsonResponse = JSON.parse(xhr.response);
                console.log('jsonResponse: ', jsonResponse);

                let changesToImplementObj = jsonResponse.changes_to_implement;
                let elemToDeleteId = jsonResponse.delete_element;

                this.domElementsCtr.removeChild(this.elements[elemToDeleteId].domElem);
                delete this.elements[elemToDeleteId];

                // Check if there are no more subtasks to remove subtaskscontainer from dom
                let elementsKeysArray = Object.keys(this.elements);
                this.implementChangesForElements(changesToImplementObj);
                if (elementsKeysArray.length == 0){
                    this.domElementsCtr.parentNode.removeChild(this.domElementsCtr);
                    delete this.domElementsCtr;
                }
            }else if(xhr.status == 403){
                window.location.assign("/");
            }else{
                console.log(xhr.status);
            }
        });
    }
    cutTask() {
        this.domTask.classList.add("cut-task");
        gCutTask = this;
    }
    pasteBeforeMe(){
        let cutTaskId = gCutTask.id;
        ajax.me.moveTaskBefore(gAccessToken, cutTaskId, this.parentTask.id, this.id, (xhr)=>{
            if(xhr.status == 200){
                let changesToImplementAndOldAndNewParentIds = JSON.parse(xhr.response);
                let changesToImplementObj = changesToImplementAndOldAndNewParentIds.changes_to_implement;
                let oldParentId = changesToImplementAndOldAndNewParentIds.old_parent_id;
                let newParentId = changesToImplementAndOldAndNewParentIds.new_parent_id;

                let oldParentTask = gRootTask.getSubtaskByIdDeep(oldParentId);
                let newParentTask = gRootTask.getSubtaskByIdDeep(newParentId);

                let taskToBeMoved = gRootTask.getSubtaskByIdDeep(cutTaskId);

                if(oldParentId != newParentId){
                    
                    taskToBeMoved.parentTask = newParentTask;
                    delete oldParentTask.subtasks[taskToBeMoved.id];
                    newParentTask.subtasks[taskToBeMoved.id] = taskToBeMoved;

                    oldParentTask.implementChangesForSubtasks(changesToImplementObj);
                }
                newParentTask.implementChangesForSubtasks(changesToImplementObj);
                newParentTask.domSubtaskContainer.insertBefore(taskToBeMoved.domTask, this.domTask);

                taskToBeMoved.domTask.classList.remove("cut-task");

                // Check if there are no more subtasks in old parent task to remove subtaskscontainer from dom
                let subtasksKeysArray = Object.keys(oldParentTask.subtasks);
                if (subtasksKeysArray.length == 0) {
                    oldParentTask.domSubtaskContainer.parentNode.removeChild(oldParentTask.domSubtaskContainer);
                    delete oldParentTask.domSubtaskContainer;
                }
            }else if(xhr.status == 400){
                // Display that not allowed to move task into one of its descendants
                alert(JSON.parse(xhr.response).error);
            }else{
                console.log(xhr.status);
            }
        })
    }
    pasteInMeAtTheEnd(){
        let cutTaskId = gCutTask.id;
        ajax.me.moveTaskBefore(gAccessToken, cutTaskId, this.id, null, (xhr)=>{
            if(xhr.status == 200){
                let changesToImplementAndOldAndNewParentIds = JSON.parse(xhr.response);
                let changesToImplementObj = changesToImplementAndOldAndNewParentIds.changes_to_implement;

                let oldParentId = changesToImplementAndOldAndNewParentIds.old_parent_id;
                let newParentId = changesToImplementAndOldAndNewParentIds.new_parent_id;

                let oldParentTask = gRootTask.getSubtaskByIdDeep(oldParentId);
                let newParentTask = gRootTask.getSubtaskByIdDeep(newParentId);

                let taskToBeMoved = gRootTask.getSubtaskByIdDeep(cutTaskId);

                if(oldParentId != newParentId){
                    
                    taskToBeMoved.parentTask = newParentTask;
                    delete oldParentTask.subtasks[taskToBeMoved.id];
                    newParentTask.subtasks[taskToBeMoved.id] = taskToBeMoved;

                    oldParentTask.implementChangesForSubtasks(changesToImplementObj);
                }
                newParentTask.implementChangesForSubtasks(changesToImplementObj);

                newParentTask.addSubtaskToCorrectPlaceInDom(taskToBeMoved);
                /* newParentTask.domSubtaskContainer.insertBefore(taskToBeMoved.domTask, this.domTask); */

                taskToBeMoved.domTask.classList.remove("cut-task");

                // Check if there are no more subtasks in old parent task to remove subtaskscontainer from dom
                let subtasksKeysArray = Object.keys(oldParentTask.subtasks);
                if (subtasksKeysArray.length == 0) {
                    oldParentTask.domSubtaskContainer.parentNode.removeChild(oldParentTask.domSubtaskContainer);
                    delete oldParentTask.domSubtaskContainer;
                }
            }else if(xhr.status == 400){
                // Display that not allowed to move task into one of its descendants
                alert(JSON.parse(xhr.response).error);
            }else{
                console.log(xhr.status);
            }
        })
    }
    pasteElementBefore(pNewNextSiblingId, pNewParentId,pElementToMoveId = gCutElementId){
        let cutElementId = pElementToMoveId;
        
        ajax.me.moveElementBefore(gAccessToken, pElementToMoveId, pNewNextSiblingId, pNewParentId, (xhr) => {
            if(xhr.status ==200){
                let changesToImplementAndOldAndNewTaskIds = JSON.parse(xhr.response);
                let changesToImplementObj = changesToImplementAndOldAndNewTaskIds.changes_to_implement;

                let newTaskId = changesToImplementAndOldAndNewTaskIds.new_task_id;
                let oldTaskId = changesToImplementAndOldAndNewTaskIds.old_task_id;

                let oldTask = gRootTask.getSubtaskByIdDeep(oldTaskId);
                let newTask = gRootTask.getSubtaskByIdDeep(newTaskId);

                let elementToBeMoved = oldTask.getElementById(cutElementId);
                console.log('elementToBeMoved: ', elementToBeMoved);

                if(oldTask != newTask){
                    elementToBeMoved.task = newTask;
                    delete oldTask.elements[elementToBeMoved.id];
                    newTask.elements[elementToBeMoved.id] = elementToBeMoved;

                    oldTask.implementChangesForElements(changesToImplementObj);
                }
                newTask.implementChangesForElements(changesToImplementObj);

                newTask.addElementToCorrectPlaceInDom(elementToBeMoved);

                // Check if there are no more elements in old task to remove elementsContainer from dom
                let elementsKeysArray = Object.keys(oldTask.elements);
                if (elementsKeysArray.length == 0) {
                    oldTask.domElementsCtr.parentNode.removeChild(oldTask.domElementsCtr);
                    delete oldTask.domElementsCtr;
                }
            }else if(xhr.status == 403){
                window.location.assign("/");
            } else{
                console.log("status", xhr.status);
            }
        })
    }
    getElementById(pId){
        let elementKeys = Object.keys(this.elements)
        for(let i = 0; i < elementKeys.length; i++){
            let lResult = this.elements[elementKeys[i]];
            if (lResult != null){
                if(lResult.id  == pId){
                    return lResult;
                }
            }
        }   
        return null;
    }
    getSubtaskByIdDeep(pId){
        if(this.id == pId){
            return this
        }else{
            let subtaskKeys = Object.keys(this.subtasks)
            for(let i = 0; i < subtaskKeys.length; i++){
                let lResult = this.subtasks[subtaskKeys[i]].getSubtaskByIdDeep(pId);
                if (lResult != null){
                    return lResult;
                }
            }   
            return null;
        }
    }
    getLastSubtask(){
        return this.subtasks[this.domSubtaskContainer.lastChild.id];
    }
    getFirstSubtask(){
        // returns subtask with previous_subtask == null
        let subtasksKeys = Object.keys(this.subtasks)
        for (let i=0; i < subtasksKeys.length; i++){
            let subtask = this.subtasks[subtasksKeys[i]];
            if(subtask.previousSibling == null){
                return subtask;
            }
        }
    }
    getFirstElement(){
        // returns element with previous_subtask == null
        let elementKeys = Object.keys(this.elements)
        for (let i=0; i < elementKeys.length; i++){
            let element = this.elements[elementKeys[i]];
            if(element.previousSibling == null){
                return element;
            }
        }
    }
}

class RootTask extends Task {
    constructor(pJsonTaskObj) {
        super(pJsonTaskObj);

    }
    deleteMyself(){
        ajax.me.deleteTask(gAccessToken, this.id, (xhr)=> {
            if(xhr.status == 200){
                location.assign("/task-sequences-menu");
            }else{
                console.log(xhr.status);
            }
        });
    }
    updateDomTask() {
        // Delete Unused Buttons 
        this.domDetailsCtr.removeChild(this.domMoveUpBtnCtr);
        this.domDetailsCtr.removeChild(this.domMoveDownBtnCtr);
        this.domDetailsCtr.removeChild(this.domPasteBeforeBtnCtr);
        this.domDetailsCtr.removeChild(this.domCutBtnCtr);
        
        // Changing event listeners
        this.domDeleteTaskBtn.onclick = () => {
            this.deleteMyself();
        }
    }
}


let rootTask;

ajax.me.getTaskWithChildrenDeepWithPermissionsSharedWithUserAndElements(gAccessToken,gRootTaskId, (xhr)=> {
    if(xhr.status == 200){
        let jsonRes = JSON.parse(xhr.response);
        
        let rootTaskObj = jsonRes.task;
        let childrenArray = jsonRes.children_array;
        // let parentOfRootTaskJsonObj = jsonRes.parent_task;

        let receivedTasksObj = {}; // filled with Task -type objects
        
        // Transform children task (JSON) to instances of class Task
        for(let ii = 0; ii < childrenArray.length; ii++){
            let jsonTaskObj = childrenArray[ii];
            
            // Convert To Class "Task"
            let newTaskObj = new Task(jsonTaskObj);
            receivedTasksObj[newTaskObj.id] = newTaskObj;
        }

        gRootTask = new RootTask(rootTaskObj);

        receivedTasksObj[gRootTask.id] = gRootTask;

        receivedTasksObjKeysArray = Object.keys(receivedTasksObj);
        
        for(let ii = 0; ii < receivedTasksObjKeysArray.length; ii++){
            let taskObj = receivedTasksObj[receivedTasksObjKeysArray[ii]];

            taskObj.initialRelationshipsUpdate(receivedTasksObj);
        }

        /*--------------------- 
                ELEMENTS
        ---------------------*/

        let elementsArray = jsonRes.elements_array;
        let receivedElementsObj = {};

        // Transform elements (JSON) to instances of class Element
        for(let ii = 0; ii < elementsArray.length; ii++){
            let jsonElemObj = elementsArray[ii];
            
            // Convert To Class "Element"
            let newElemObj = new Element(jsonElemObj);
            receivedElementsObj[newElemObj.id] = newElemObj;
        }

        receivedElementsObjKeysArray = Object.keys(receivedElementsObj);

        for(let ii = 0; ii < receivedElementsObjKeysArray.length; ii++){
            let elemObj = receivedElementsObj[receivedElementsObjKeysArray[ii]];

            elemObj.initialRelationshipsUpdate(receivedElementsObj, receivedTasksObj);

        }
        /*--------------------- 
                ROOT TASK
        ---------------------*/

        gRootTask.createDomTask();
        gRootTask.updateDomTask();
        container.appendChild(gRootTask.domTask);

    } else {
        //console.log(xhr.status);
        window.location.assign("/");
    }
});