const gAccessToken = window.localStorage.getItem('access_token');
const gTtsId = helpers.getAllUrlParams().tts_id;

// Get Tasks belonging to this TTS

let msToTime = (duration) => {
    let milliseconds = parseInt((duration % 1000) / 100),
    seconds = parseInt((duration / 1000) % 60),
    minutes = parseInt((duration / (1000 * 60)) % 60),
    hours = parseInt((duration / (1000 * 60 * 60)) % 24);

    hours = (hours < 10) ? "0" + hours : hours;
    minutes = (minutes < 10) ? "0" + minutes : minutes;
    seconds = (seconds < 10) ? "0" + seconds : seconds;

    return hours + ":" + minutes + ":" + seconds + ":" + milliseconds;
}

let timeToMs = (timeInMs) => {
    let orgTime = timeInMs.split(':');
    return (orgTime[0] * 3600 * 1000) + (orgTime[1] * 60 * 1000) + (orgTime[2] * 1000);
}

class Countdown {
    constructor(){
        this.iniMs = 0;
        this.leftMs = 0;

        this.startTime;
        this.reqanimationreference;

        this.state = 'stopped';
        this.shouldStop;
    }
    set(iniMs){
        this.iniMs = iniMs;

        this.reset();
    }
    start(callback){
        let referenceTime;
        if (this.state != 'ongoing'){
            if (this.state == 'paused') {
                referenceTime = this.leftMs;
            } else if (this.state == 'stopped'){
                referenceTime = this.iniMs;
            }
            this.shouldStop = false;
            let ctdnStep = (timestamp) => { 
                let timeElapsed = (timestamp - this.startTime);
                this.leftMs = referenceTime - timeElapsed;

                if (this.leftMs <= 0) {
                    
                    this.leftMs = 0;
                    this.stopAnimation();
                    this.shouldStop = true;
                }

                callback(this.leftMs);

                if (!this.shouldStop){
                    this.reqanimationreference = requestAnimationFrame(ctdnStep);
                } 
            };

            window.requestAnimationFrame((timestamp) => {
                this.startTime = timestamp;
                ctdnStep(timestamp);
            });

            this.state = 'ongoing';
        } else {
            console.log('already started');
        }
    }
    pause(){
        if(this.state == 'ongoing'){
            this.stopAnimation();
            this.state = 'paused';
        }
    }
    reset(){
        if(this.state != 'stopped'){
            this.stopAnimation();
            this.leftMs = this.iniMs;
            this.state = 'stopped';
        }

    }
    stopAnimation() {
        this.shouldStop = true;
        cancelAnimationFrame(this.reqanimationreference);
    }
}




class CountdownDom extends Countdown {
    constructor(parentTaskObject){

        super();

        // Instance of a Task object that provides the DOM Elements for this class to work with
        this.TASK = parentTaskObject;

        // Important Variables from this task
        this.ctr = this.TASK.nbrsCtr;
        this.hU = this.TASK.hU;
        this.hD = this.TASK.hD;
        this.mU = this.TASK.mU;
        this.mD = this.TASK.mD;
        this.sU = this.TASK.sU;
        this.sD = this.TASK.sD;
        this.hiddenTimerInput = this.TASK.hiddenTimerInput;

        /*TODO: Remove this after testing  this.isActive = false; */

        // To track if the user just clicked on the timer to edit it
        this.is1stKeypress = true;

        this.userInput = ["0","0","0","0","0","0"];
        





        this.ctr.onclick = ()=>{
            if(this.TASK.TASK_CONTAINER.timerBeingEdited){
                // If it (or another task) is being edited, do nothing
            } else {
                // If it is not being edited
                this.setToBeingEdited();

                // Tell TASK.TASK_CONTAINER that I am being edited
                this.TASK.TASK_CONTAINER.timerBeingEdited = this.TASK.id;
            }
        };


        
    }
    setToBeingEdited(){
        console.log(`Task[${this.TASK.id}] is being edited, duration is ${this.iniMs}`);
        this.TASK.TASK_CONTAINER.is1stClickForTimerEdit = true;
        // 1. Add a DOM class linked to a style for being edited
        this.ctr.classList.add('task-timer-being-edited');
        // 2. Focus the hidden input field (so the virtual keyboard pops up on mobile devices)  
        this.hiddenTimerInput.focus();
        // 3. Add an evt listener on the input to listen for characters
        //this.hiddenTimerInput.addEventListener("keydown", this.keydownHandler);
        this.hiddenTimerInput.addEventListener("input", this.inputHandler);
    }
    setToNotBeingEdited(){
        console.log(`Task[${this.TASK.id}] stopped being edited, new time is ${this.iniMs}ms`);
        this.ctr.classList.remove('task-timer-being-edited');

        // Remove event listener for keydown
        //this.hiddenTimerInput.removeEventListener("keydown", this.keydownHandler);
        this.hiddenTimerInput.addEventListener("input", this.inputHandler);

        // Tell TASK_CONTAINER that this timer is not being edited anymore
        this.TASK.TASK_CONTAINER.timerBeingEdited = '';

        // Tell server to save new time
        ajax.me.updateTtsTask(this.TASK.id,this.TASK.taskTitle.value,this.TASK.taskDesc.value, this.iniMs, gTtsId, gAccessToken, (xhr)=>{
            if(xhr.status==200){
                this.updateCountdown(this.iniMs);
                this.TASK.TASK_CONTAINER.doAfterEveryTaskUpdate();
            } else {
                alert('Could not update Task');
                console.log(xhr.status);
            }
        });
    }
    inputHandler(evt) {
        console.log('evt: ', evt);
        // "this" here refers to the element that the event listener is listening for

        let taskObjBeingEdited = TaskContainerObj.tasksList[TaskContainerObj.getTaskIndexFromTasksList(TaskContainerObj.timerBeingEdited)];
        console.log('taskObjBeingEdited: ', taskObjBeingEdited);
        // Check if the key pressed is a number
        let isNbr = taskObjBeingEdited.cdDom.isNumberKey(evt);
        let isBackspace =  taskObjBeingEdited.cdDom.isBackspace(evt);
        if( isNbr >= 0){
            if (taskObjBeingEdited.cdDom.is1stKeypress){
                taskObjBeingEdited.cdDom.userInput = ["0","0","0","0","0","0"];
            }
            // Add the input to display to the user
            taskObjBeingEdited.cdDom.addOneUserInput(isNbr);

            // Specify that the user has already entered a number before
            taskObjBeingEdited.cdDom.is1stKeypress = false;

        } else if (isBackspace){
            // Remove the last number entered
            taskObjBeingEdited.cdDom.deleteOneUserInput(isNbr);
        }
        
    }
    addOneUserInput(nbrToInput){
        this.userInput.push(nbrToInput);
        this.userInput.shift();
        let timeEnteredInMs = timeToMs(this.userInput[0] + this.userInput[1] + ":" + this.userInput[2] + this.userInput[3] + ":" + this.userInput[4] + this.userInput[5] + ":00");

        this.hD.innerText = this.userInput[0];
        this.hU.innerText = this.userInput[1];
        this.mD.innerText = this.userInput[2];
        this.mU.innerText = this.userInput[3];
        this.sD.innerText = this.userInput[4];
        this.sU.innerText = this.userInput[5];

        this.set(timeEnteredInMs);
        console.log(this.iniMs);
    }
    deleteOneUserInput(){
        this.userInput.unshift('0');
        this.userInput.pop();
        let timeEnteredInMs = timeToMs(this.userInput[0] + this.userInput[1] + ":" + this.userInput[2] + this.userInput[3] + ":" + this.userInput[4] + this.userInput[5] + ":00");
        // Just like the backspace (deleting the last written element)
        this.hD.innerText = this.userInput[0];
        this.hU.innerText = this.userInput[1];
        this.mD.innerText = this.userInput[2];
        this.mU.innerText = this.userInput[3];
        this.sD.innerText = this.userInput[4];
        this.sU.innerText = this.userInput[5];

        this.set(timeEnteredInMs);
    }
    updateCountdown(timeInMs){
        let orgTimeLeft = msToTime(timeInMs).split(':');
        
        this.hU.innerText = orgTimeLeft[0][1];
        this.hD.innerText = orgTimeLeft[0][0];
        this.mU.innerText = orgTimeLeft[1][1];
        this.mD.innerText = orgTimeLeft[1][0];
        this.sU.innerText = orgTimeLeft[2][1];
        this.sD.innerText = orgTimeLeft[2][0];
    }
    isNumberKey(evt){
        let numbersArray = ["0","1","2","3","4","5","6","7","8","9"];
        if(numbersArray.includes(evt.data)){
            return evt.data;
        } else {
            return -1;
        }
    }
    isBackspace(evt){
        // TODO: Delete if it works without the line below after testing
        /* let charCode = (evt.which) ? evt.which : evt.keyCode; */
        let key = event.keyCode || event.charCode;
        /* console.log(key); */
        if (key == 8 || key == 46){
            evt.preventDefault();
            console.log('Pressed Backspace');
            return -1;
        }

        return true;
    }
    pause(){
        super.pause();
    }
}



class Task{
    constructor(TaskContainer, taskObject){
        // This is the TaskContainer Instance that created this task
        this.TASK_CONTAINER = TaskContainer;

        this.id = taskObject.tts_task_id;
        this.parentDiv = this.TASK_CONTAINER.taskCtr;
        
        this.task = CDE('div', [["class","task"]]);
            this.leftCtr = CDE('div', [["class","left-ctr"]]);
                this.taskTitleCtr = CDE('div', [['class', 'task-title-ctr']]);
                    this.taskTitle = CDE('input', [['class',"task-title"], ['placeholder','Your Task Title']]);
                        this.taskTitle.value = taskObject.title;
                        
                    this.taskTitleCtr.appendChild(this.taskTitle);
                this.leftCtr.appendChild(this.taskTitleCtr);

                this.taskDescCtr = CDE('div',[['class', 'task-desc-ctr']]);
                    this.taskDesc = CDE('textarea', [['class', 'task-desc'], ['placeholder', 'Your Task Description']]);
                        this.taskDesc.value = taskObject.description;
                    this.taskDescCtr.appendChild(this.taskDesc);
                this.leftCtr.appendChild(this.taskDescCtr);

                this.taskDurationCtr = CDE('div', [['class', 'task-duration-ctr']]);

                    this.nbrsCtr = CDE('div', [['class',"numbers-ctr"], ['id',"numbers-ctr"]]);
                        this.hiddenTimerInput = CDE('input', [['type','tel'],['class','hidden-timer-input']]);
                        this.nbrsCtr.appendChild(this.hiddenTimerInput);
                        this.hD = CDE('span', [['class', "digit"], ['id',"hD"]]);
                            this.hD.innerText = '0';
                        this.nbrsCtr.appendChild(this.hD);
                        this.hU = CDE('span', [['class',"digit"],['id',"hU"]]);
                            this.hU.innerText = '0';
                        this.nbrsCtr.appendChild(this.hU);
                        this.digitLblH = CDE('span', [['class',"digit-lbl"]]);
                            this.digitLblH.innerText = 'h';
                        this.nbrsCtr.appendChild(this.digitLblH);

                        this.mD = CDE('span', [['class', "digit"], ['id',"mD"]]);
                            this.mD.innerText = '0';
                        this.nbrsCtr.appendChild(this.mD);
                        this.mU = CDE('span', [['class',"digit"],['id',"mU"]]);
                            this.mU.innerText = '0';
                        this.nbrsCtr.appendChild(this.mU);
                        this.digitLblM = CDE('span', [['class',"digit-lbl"]]);
                            this.digitLblM.innerText = 'm';
                        this.nbrsCtr.appendChild(this.digitLblM);

                        this.sD = CDE('span', [['class', "digit"], ['id',"sD"]]);
                            this.sD.innerText = '0';
                        this.nbrsCtr.appendChild(this.sD);
                        this.sU = CDE('span', [['class',"digit"],['id',"sU"]]);
                            this.sU.innerText = '0';
                        this.nbrsCtr.appendChild(this.sU);
                        this.digitLblS = CDE('span', [['class',"digit-lbl"]]);
                            this.digitLblS.innerText = 's';
                        this.nbrsCtr.appendChild(this.digitLblS);

                        this.cdDom = new CountdownDom(this);

                    this.taskDurationCtr.appendChild(this.nbrsCtr);
                this.leftCtr.appendChild(this.taskDurationCtr);
            this.task.appendChild(this.leftCtr);


            this.rightCtr = CDE('div', [["class", "right-ctr"]]);
                this.moveCtr = CDE('div', [['class','move-ctr']]);
                    this.moveCtr.innerHTML = `
                    <svg id="move-icon" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 210 210" style="enable-background:new 0 0 210 210;" xml:space="preserve">
                    <g id="XMLID_86_">
                        <path id="XMLID_87_" d="M115,0H95c-8.284,0-15,6.716-15,15v20c0,8.284,6.716,15,15,15h20c8.284,0,15-6.716,15-15V15
                            C130,6.716,123.284,0,115,0z"/>
                        <path id="XMLID_88_" d="M115,80H95c-8.284,0-15,6.716-15,15v20c0,8.284,6.716,15,15,15h20c8.284,0,15-6.716,15-15V95
                            C130,86.716,123.284,80,115,80z"/>
                        <path id="XMLID_89_" d="M115,160H95c-8.284,0-15,6.716-15,15v20c0,8.284,6.716,15,15,15h20c8.284,0,15-6.716,15-15v-20
                            C130,166.716,123.284,160,115,160z"/></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g></svg>
                    `;
                this.rightCtr.appendChild(this.moveCtr);

                this.deleteBtnCtr = CDE('div', [['class','delete-btn-ctr']]);
                    this.deleteBtn = CDE('div', [['class', 'delete-btn']]);
                        this.deleteBtn.innerHTML = `
                        <svg version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
                        width="20px" height="20px" viewBox="0 0 459 459" style="enable-background:new 0 0 459 459;" xml:space="preserve">
                        <g>
                            <g id="delete">
                                <path d="M76.5,408c0,28.05,22.95,51,51,51h204c28.05,0,51-22.95,51-51V102h-306V408z M408,25.5h-89.25L293.25,0h-127.5l-25.5,25.5
                                    H51v51h357V25.5z"/>
                            </g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g></svg>
                    `;
                    this.deleteBtn.onclick = () => {
                        this.TASK_CONTAINER.deleteTask(this);
                    }
                    this.deleteBtnCtr.appendChild(this.deleteBtn);
                this.rightCtr.appendChild(this.deleteBtnCtr);
            this.task.appendChild(this.rightCtr);
        this.parentDiv.appendChild(this.task);

        this.taskTitle.onblur = () => {this.taskInputFieldsOnBlurHandler()};
        this.taskDesc.onblur = () => {this.taskInputFieldsOnBlurHandler()};

        // Put updated time
        console.log(`Updated time for Task[${this.id}], it is ${taskObject.duration}`);
        this.cdDom.updateCountdown(taskObject.duration);
        this.cdDom.set(taskObject.duration)
        
    }
    taskInputFieldsOnBlurHandler(){
        ajax.me.updateTtsTask(this.id,this.taskTitle.value,this.taskDesc.value, this.cdDom.iniMs, gTtsId, gAccessToken, (xhr)=>{
            if(xhr.status==200){
                this.TASK_CONTAINER.doAfterEveryTaskUpdate();
            } else {
                alert('Could not update Task');
                console.log(xhr.status)
            }
        });
    }

}


class TaskContainer {
    constructor(taskContainer, newTaskBtn, ttsTitleInput,ttsDeleteBtn){
        // Important DOM Elements that are external to the task container
        this.newTaskBtn = newTaskBtn;       // Button to create a new task
        this.taskCtr = taskContainer;       // Container of all the Task DOM elements
        this.ttsTitleInput = ttsTitleInput; // Input Element to Display TTS Name
        this.ttsDeleteBtn = ttsDeleteBtn;   // Button to delete TTS

        this.tasksList = [];        // Store all existing "Task" Class instances
        this.timerBeingEdited = ''; // Hold the id of the Task who's timer is being edited

        this.is1stClickForTimerEdit = false;

        this.ttsDurationDom = _('tts-duration');
        //  ------------------------
        //  Things To Do Immediately after Instantiating this Class, which should coincide with immediately after the page loads
        //  ------------------------
        
        // Ask server for TTS Title and all Tasks
        ajax.me.getTtsTitleAndAllTtsTasks(gTtsId, gAccessToken, (xhr) => {
            if (xhr.status == 200){
                let responseObj = JSON.parse(xhr.response);
                // Create(=Display) all tasks given by the server
                this.createListOfTasks(responseObj.tts_tasks_array);
                // Display TTS Name in the Title Input Field
                this.ttsTitleInput.value = responseObj.tts_title;
            }else if(xhr.status == 403){
                window.location.assign("/");
            }else{
                console.log(xhr.status);
            }
        });

        // Ask Server for TTS Duration
        ajax.me.getTtsInfo(gTtsId,gAccessToken, (xhr)=> {
            if(xhr.status==200){
                console.log('xhr.status: ', xhr.status);
                let resObj = JSON.parse(xhr.response);
                let ttsObj = resObj.tts_obj;
                this.updateTtsDurationInUi(ttsObj.duration);
            }else if (xhr.status == 403){
                window.location.assign("/");
            } else {
                alert('Could not update Task');
                console.log(xhr.status)
            }
        })
        
        
        // Set up Event Listeners

        // Changing the TTS Title
        this.ttsTitleInput.onblur = () => {this.ttsTitleInputFieldsOnBlurHandler()};

        // New Task Button = onclick
        this.newTaskBtn.onclick = () => {
            // Ask server to create a new entry (returns task object)
            ajax.me.addNewTtsTask(gTtsId, gAccessToken, (xhr)=> {
                if(xhr.status == 200){
                    let resObj = JSON.parse(xhr.response);
                    let newTtsTaskObj = resObj.tts_task
                    console.log('newTtsTaskObj: ', newTtsTaskObj);
                    // Create(=Display) new Task if everything went right
                    this.createTask(newTtsTaskObj);
                }else{
                    console.log(xhr.status);
                }
            });
        }

        // Event Listener for Any clicks on the window
        document.onclick = () => {
            if (typeof this.timerBeingEdited == 'number'){
                if(!this.is1stClickForTimerEdit){
                    let activeTask = this.tasksList[this.getTaskIndexFromTasksList(this.timerBeingEdited)];
                    console.log('activeTask: ', activeTask);
                    // If there is a timer being edited, set it to not being edited
                    activeTask.cdDom.setToNotBeingEdited();
                }
                this.is1stClickForTimerEdit = false;
            }
        }
        
        // Delete TTS Button click event listener
        this.ttsDeleteBtn.onclick = () => {
            ajax.me.deleteTtsAndTtsTasks(gTtsId,gAccessToken, (xhr)=>{
                if(xhr.status == 200){
                    alert('TTS Deleted');
                    window.location.assign("/tts-main-menu");
                }else{
                    console.log(xhr.status);
                }
            });
        }
    }
    
    getTaskIndexFromTasksList(pTaskIdToFind){
        // Find task in tasks list and return its index in the list as well as the task
        let foundTaskIndex = false;
        for(let i = 0; i < this.tasksList.length; i++){
            let task = this.tasksList[i];
            if (task.id == pTaskIdToFind){
                
                foundTaskIndex = i;
                break
            }
        }
        return foundTaskIndex;
    }
    createTask (pTaskObject){
        // pTaskObject Should have Title, Description, Time Left in ms, and an id
        let newTask = new Task(this, pTaskObject);

        // Add new task to the list of tasks
        this.tasksList.push(newTask);
    }
    createListOfTasks (pArrayOfTaskObjects){
        // Add to the Task Container DOM Element all the Task Objects in the Input Array
        for(let i=0; i < pArrayOfTaskObjects.length; i++){
            this.createTask(pArrayOfTaskObjects[i]);
        }
    }
    deleteTask(pTaskObject){
        let indexOfTaskToBeDeleted = this.getTaskIndexFromTasksList(pTaskObject.id);
        if(indexOfTaskToBeDeleted >= 0){
            
            // Ask server if it can be deleted
            ajax.me.deleteTtsTask(pTaskObject.id ,gTtsId, gAccessToken, (xhr)=>{
                if(xhr.status == 200){
                    
                    // It has been deleted from DB
                    // Now to remove it from display and browser memory
                    // Delete the Task.task (which is the DOM Element)
                    this.taskCtr.removeChild(pTaskObject.task);
                    // Delete its record from tasks list (Make sure to check the id before deleting it, because maybe something else modified it in the mean time)
                    if (this.tasksList[indexOfTaskToBeDeleted].id === pTaskObject.id){
                        this.tasksList.splice(indexOfTaskToBeDeleted, 1);
                    } else {
                        let newIndexOfTaskToBeDeleted = this.getTaskIndexFromTasksList(pTaskObject.id);
                        this.tasksList.splice(newIndexOfTaskToBeDeleted, 1);
                    }

                    this.doAfterEveryTaskUpdate();
                }else if (xhr.status == 403){
                    window.location.assign("/");
                }else{
                    console.log('status: ', xhr.status);
                    console.log('Could not remove Task')
                }
            });
        } else {
            console.log('Could not find Task:', pTaskObject.id);
        }
    }
    ttsTitleInputFieldsOnBlurHandler(){
        console.log('TTS Title Input: ', this.ttsTitleInput.value);
        ajax.me.updateTtsTitle(this.ttsTitleInput.value, gTtsId, gAccessToken, (xhr)=>{
            if(xhr.status==200){

            }else if (xhr.status == 403){
                window.location.assign("/");
            }  else {
                alert('Could not update Task');
                console.log(xhr.status)
            }
        });
    }

    updateTtsDurationInUi(pDurationInMs){
        let orgTime = helpers.convertMsToDisplayableTime(pDurationInMs);
        this.ttsDurationDom.innerText = orgTime;
    }
    doAfterEveryTaskUpdate(){
        /* 
            1 - Get New Task Sequence Information because after every ajax request related to tasks, information about Task Sequence (especially duration) might have changed, so we have to update it on the UI also
        */
        // 1.1 - Get new Duration
        console.log("Entered do after every task function.");
        ajax.me.getTtsInfo(gTtsId,gAccessToken, (xhr)=> {
            if(xhr.status==200){
                let resObj = JSON.parse(xhr.response);
                let ttsObj = resObj.tts_obj;

                // 1.2 - Update new Duration in the UI
                this.updateTtsDurationInUi(ttsObj.duration);
            }else if (xhr.status == 403){
                window.location.assign("/");
            } else {
                alert('Could not update Task');
                console.log(xhr.status)
            }
        })
        
    }

}



// Needed global variables in order for TaskContainer class to Work

// Button to Create a new Task
let newTaskBtn = _('new-task-btn');

// Container for all the tasks
let taskCtr = _('task-ctr');

// Initial send tts object to save after writing something as tts title
let ttsTitleInput = _('tts-title');

// Button to Delete TTS
let ttsDeleteBtn = _('delete-tts-btn');

// Initialize TaskContainer As soon as page loads
let TaskContainerObj = new TaskContainer(taskCtr, newTaskBtn, ttsTitleInput, ttsDeleteBtn);













/* let setActiveCountdownDom = (pCdDomObj) => {
    console.log('Setting Active:', pCdDomObj.id)
    if (gActiveCdDom) {
        gActiveCdDom.deactivate();
    }
    gActiveCdDom = pCdDomObj;
    pCdDomObj.activate();
}
window.onclick = () => {
    console.log('clicked window');
    if (gLastCountdownDomClicked){
        setActiveCountdownDom(gLastCountdownDomClicked);
    } else {
        if(gActiveCdDom){
            console.log('Setting INactive:', gActiveCdDom.id);
            gActiveCdDom.deactivate();
            gActiveCdDom = 0;
        }
    }
    gLastCountdownDomClicked=0; 
} */








