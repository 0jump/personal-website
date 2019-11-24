const gAccessToken = window.localStorage.getItem('access_token');
const gTtsId = helpers.getAllUrlParams().tts_id;

// Function to play a beep
var playBeep = (function beep() {
    var beep = new Audio("data:audio/wav;base64,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qJrx4KOQjahZxWbcZgztj2c49nKmkId44S71j0c8eV9yDK6uPRzx5X18eDvjvQ6yKo9ZSS6l//8elePK/Lf//IInrOF/FvDoADYAGBMGb7FtErm5MXMlmPAJQVgWta7Zx2go+8xJ0UiCb8LHHdftWyLJE0QIAIsI+UbXu67dZMjmgDGCGl1H+vpF4NSDckSIkk7Vd+sxEhBQMRU8j/12UIRhzSaUdQ+rQU5kGeFxm+hb1oh6pWWmv3uvmReDl0UnvtapVaIzo1jZbf/pD6ElLqSX+rUmOQNpJFa/r+sa4e/pBlAABoAAAAA3CUgShLdGIxsY7AUABPRrgCABdDuQ5GC7DqPQCgbbJUAoRSUj+NIEig0YfyWUho1VBBBA//uQZB4ABZx5zfMakeAAAAmwAAAAF5F3P0w9GtAAACfAAAAAwLhMDmAYWMgVEG1U0FIGCBgXBXAtfMH10000EEEEEECUBYln03TTTdNBDZopopYvrTTdNa325mImNg3TTPV9q3pmY0xoO6bv3r00y+IDGid/9aaaZTGMuj9mpu9Mpio1dXrr5HERTZSmqU36A3CumzN/9Robv/Xx4v9ijkSRSNLQhAWumap82WRSBUqXStV/YcS+XVLnSS+WLDroqArFkMEsAS+eWmrUzrO0oEmE40RlMZ5+ODIkAyKAGUwZ3mVKmcamcJnMW26MRPgUw6j+LkhyHGVGYjSUUKNpuJUQoOIAyDvEyG8S5yfK6dhZc0Tx1KI/gviKL6qvvFs1+bWtaz58uUNnryq6kt5RzOCkPWlVqVX2a/EEBUdU1KrXLf40GoiiFXK///qpoiDXrOgqDR38JB0bw7SoL+ZB9o1RCkQjQ2CBYZKd/+VJxZRRZlqSkKiws0WFxUyCwsKiMy7hUVFhIaCrNQsKkTIsLivwKKigsj8XYlwt/WKi2N4d//uQRCSAAjURNIHpMZBGYiaQPSYyAAABLAAAAAAAACWAAAAApUF/Mg+0aohSIRobBAsMlO//Kk4soosy1JSFRYWaLC4qZBYWFRGZdwqKiwkNBVmoWFSJkWFxX4FFRQWR+LsS4W/rFRb/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////VEFHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAU291bmRib3kuZGUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMjAwNGh0dHA6Ly93d3cuc291bmRib3kuZGUAAAAAAAAAACU=");  
    return function() {     
        beep.play(); 
    }
})();

// a Task (class:TaskDom) has 3 inputs: 1. title
//                                      2. description
//                                      3. duration

let AthX6Min =     [{
    "title": "Get in Position",
    "description": "Get yourselt ready",
    "duration": 10000
}, {
    "title": "AthX: Round 1",
    "description": "Knees one at a time then jump",
    "duration": 120000
}, {
    "title": "Rest",
    "description": "-",
    "duration": 30000
}, {
    "title": "AthX: Round 2",
    "description": "Mountain Climber",
    "duration": 120000
}, {
    "title": "Rest",
    "description": "-",
    "duration": 30000
}, {
    "title": "AthX: Round 3",
    "description": "Jumping Lunges",
    "duration": 120000
}];

let morningRoutine = [{
    "title": "Drink water",
    "description": "-",
    "duration": 10000
}, {
    "title": "Alopexy",
    "description": "-",
    "duration": 30000
}, {
    "title": "Brush teeth",
    "description": "-",
    "duration": 70000
}, {
    "title": "Put Mat On the floor",
    "description": "-",
    "duration": 25000
}, {
    "title": "Stretch",
    "description": "Hip Flexors - Left",
    "duration": 45000
}, {
    "title": "Change legs",
    "description": "Quick!",
    "duration": 5000
}, {
    "title": "Stretch",
    "description": "Hip Flexors - Right",
    "duration": 45000
}, {
    "title": "Stretch",
    "description": "Next: hams left",
    "duration": 5000
}, {
    "title": "Stretch",
    "description": "Hamstrings - Left Leg",
    "duration": 45000
}, {
    "title": "Stretch",
    "description": "Change Legs\nNext: hams right",
    "duration": 5000
}, {
    "title": "Stretch",
    "description": "Hamstrings - Right Leg",
    "duration": 45000
}, {
    "title": "Stretch",
    "description": "sit on the floor\nNext Butterfly stretch",
    "duration": 5000
}, {
    "title": "Stretch",
    "description": "Butterfly stretch",
    "duration": 50000
}, {
    "title": "Stretch",
    "description": "Stand up:\nNext: chest left arm",
    "duration": 5000
}, {
    "title": "Stretch",
    "description": "Chest - Left arm",
    "duration": 40000
}, {
    "title": "Stretch",
    "description": "Next: chest right arm",
    "duration": 5000
}, {
    "title": "Stretch",
    "description": "Chest - Right arm",
    "duration": 40000
}, {
    "title": "Put Mat Back",
    "description": "Quick!",
    "duration": 30000
}, {
    "title": "Make bed",
    "description": "-",
    "duration": 40000
}, {
    "title": "Meditate",
    "description": "-",
    "duration": 10*60000
}, {
    "title": "Make And Eat Bkfast",
    "description": "-",
    "duration": 12*60000
}, {
    "title": "Write 3 Goals for Today",
    "description": "-",
    "duration": 4*60000
}, {
    "title": "Put Plan on paper",
    "description": "-",
    "duration": 4*60000
}];

morningRoutine2 = [
{
    "title": "Brush Teeth",
    "description": "-",
    "duration": 70000
}
];

allTasks = []

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
        this.leftMs = iniMs;
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


class TaskDom extends Countdown{
    constructor(pTaskTitle, pTaskDescription, pTask_ManagerParentInstance) {
        super();
        /* this.ctdn = new Countdown; */
        this.TASK_MANAGER = pTask_ManagerParentInstance;
        this.title = pTaskTitle;
        this.description = pTaskDescription;
        this.duration = 0;

        // state possible values: stopped, ongoing, paused, done
        this.state = 'stopped';

        this.hD;
        this.hU;
        this.mD;
        this.mU; 
        this.sD;
        this.sU;
        this.hLabel;
        this.mLabel;
        this.sLabel;
        this.startPauseBtn;
        this.resetBtn;
        this.taskTitleDE = pTaskTitle;

        this.dom = CDE('div', [['class', 'task']]);

    }
    build(){
        let timer = CDE('div',[['class','timer']]);
            let nbrsCtr = CDE('div', [['class',"numbers-ctr"]]);
                    this.hD = CDE('span', [['class',"digit"]]);
                nbrsCtr.appendChild(this.hD);
                    this.hU = CDE('span', [['class',"digit"]]);
                nbrsCtr.appendChild(this.hU);

                this.hLabel = CDE('span', [['class',"digit-lbl"]]);
                    this.hLabel.innerText = 'h';
                nbrsCtr.appendChild(this.hLabel);

                this.mD = CDE('span', [['class',"digit"]]);
                nbrsCtr.appendChild(this.mD);
                this.mU = CDE('span', [['class',"digit"]]);
                nbrsCtr.appendChild(this.mU);

                this.mLabel = CDE('span', [['class',"digit-lbl"]]);
                    this.mLabel.innerText = 'm';
                nbrsCtr.appendChild(this.mLabel);

                this.sD = CDE('span', [['class',"digit"]]);
                nbrsCtr.appendChild(this.sD);
                this.sU = CDE('span', [['class',"digit"]]);
                nbrsCtr.appendChild(this.sU);

                this.sLabel = CDE('span', [['class',"digit-lbl"]]);
                    this.sLabel.innerText = 's';
                nbrsCtr.appendChild(this.sLabel);
            timer.appendChild(nbrsCtr);
        this.dom.appendChild(timer);
        
        // Task Data
        let taskData = CDE("div", [["class","task-data"]]);
            // Task Title
            let taskTitleCtr = CDE("div", [["class","task-title-ctr"]]);
                this.taskTitleDE = CDE("span", [["class","task-title"]]);
                    this.taskTitleDE.innerText = this.title;
                taskTitleCtr.appendChild(this.taskTitleDE);
            taskData.appendChild(taskTitleCtr);

            // Task Description
            let taskDescriptionCtr = CDE("div", [["class","task-description-ctr"]]);
                this.taskDescription = CDE("span", [["class","task-description"]]);
                    this.taskDescription.innerText = this.description;
                taskDescriptionCtr.appendChild(this.taskDescription);
            taskData.appendChild(taskDescriptionCtr);
        this.dom.appendChild(taskData);

        let taskFooter = CDE("div", [["class","task-footer"]]);
            this.doneBtnCtr = CDE("div", [["class", "done-task-btn-ctr"]]);
                this.doneBtn = CDE("button", [["class", "done-task-btn"]]);
                    this.doneBtn.innerText = "Done";
                    this.doneBtn.onclick = () => {
                        this.TASK_MANAGER.pause();
                        this.TASK_MANAGER.activeTask++;
                        this.TASK_MANAGER.setTaskAsDone(this)
                        this.TASK_MANAGER.start();
                       /*  ;
                        this.TASK_MANAGER.startChain(); */
                    };
                this.doneBtnCtr.appendChild(this.doneBtn);
            taskFooter.appendChild(this.doneBtnCtr);

        this.dom.appendChild(taskFooter);
    }
    updateCountdown(){
        let orgTimeLeft = msToTime(this.leftMs).split(':');
        this.hU.innerText = orgTimeLeft[0][1];
        this.hD.innerText = orgTimeLeft[0][0];
        this.mU.innerText = orgTimeLeft[1][1];
        this.mD.innerText = orgTimeLeft[1][0];
        this.sU.innerText = orgTimeLeft[2][1];
        this.sD.innerText = orgTimeLeft[2][0];
    }
    set(iniMs){
        super.set(iniMs);
        this.updateCountdown();
    }
    pause(){
        super.pause();
    }
    start(callback){
        super.start((leftMs)=>{
            this.updateCountdown();
            callback(leftMs);

        });
    }
    reset(){
        super.reset();
        this.updateCountdown();
        this.state = 'stopped';

        this.dom.classList.remove('active-task');
        this.dom.classList.remove('done-task');
    }
    setAsActive(){
        this.dom.classList.add('active-task');
    }
    setAsDone(){
        this.dom.classList.add('done-task');
        playBeep();
        this.dom.classList.remove('active-task');
    }

}

class Task_Manager {
    constructor(tasksContainer, startPauseBtn, resetBtn){
        this.state = 'stopped';

        this.taskList = [];
        this.activeTask = 0;

        this.tasksCtr = tasksContainer;
        this.startPauseBtn = startPauseBtn;
        this.resetBtn = resetBtn;
    }
    start(){
        if (this.taskList.length > 0){
            console.log('Started with',this.taskList.length, 'elements.');
            if (this.state != 'ongoing'){
                this.state = 'ongoing';
                this.startPauseBtn.innerText = 'PAUSE';
                this.startChain();
                
            } else {
                alert('Cannot start if it is already ongoing!')
            }
            

        } else {
            alert('Unable to Start: here are no elements in tasks list');
            console.log('Unable to Start: here are no elements in tasks list');
            return 0;
        }
    }
    startChain() {
        // Recursive function to start new task after last one is done
        let task = this.taskList[this.activeTask] ;

        this.activateTask(task);

        task.start((leftMs)=> {
            if (leftMs == 0){
                if (this.activeTask == this.taskList.length - 1){
                    this.setTaskAsDone(task);
                    this.state = 'stopped';
                    this.startPauseBtn.innerText = 'START';
                } else {
                    this.setTaskAsDone(task);
                    this.activeTask++;

                    this.startChain();
                }
            } else {
                
            }
        });
    }
    activateTask(taskObj){
        taskObj.setAsActive();
        
        taskObj.dom.scrollIntoView(true);
    }
    setTaskAsDone(taskObj){
        taskObj.setAsDone();
    }
    resetTask(taskObj){
        taskObj.reset();
    }
    pause(){
        if(this.state == 'ongoing'){
            let actTask = this.taskList[this.activeTask];
            actTask.pause();
            this.state = 'paused';
            this.startPauseBtn.innerText = 'START';
        }
    }
    reset(){
        if(this.state != 'stopped'){
            for(let i = 0; i < this.taskList.length; i++){
                let task = this.taskList[i];
                task.reset();
                this.activeTask = 0;
                this.state = 'stopped';
                this.startPauseBtn.innerText = 'START';
                this.taskList[0].dom.scrollIntoView(true);
            }
        }
    }
    addTaskArray(taskArray){
        for(let i=0; i < taskArray.length; i++){
            let taskObj = typeof(taskArray[i]) == 'object' ? taskArray[i] : false;
            if (taskObj) {
                let taskTitle = typeof(taskObj.title) == 'string' ? taskObj.title : false;
                let taskDesc = typeof(taskObj.description) == 'string' ? taskObj.description : false;
                let taskDuration = typeof(taskObj.duration) == 'number' ? taskObj.duration : false;
    
                if (/* taskTitle && taskDesc && */ taskDuration){
                    let newTask = new TaskDom(taskTitle, taskDesc, this);
                    newTask.build();
                    newTask.updateCountdown();
                    newTask.set(taskDuration);
                    /* this.tasksCtr.insertBefore(newTask.dom, this.tasksCtr.firstChild); */
                    this.tasksCtr.appendChild(newTask.dom);
                    this.taskList.push(newTask);

                } else {
                    console.log('Could not add Task[', i, '] is missing (title, description or duration) or they are not in correct data types (string, string, number respectively)');
                    break;
                }
            } else {
                console.log('Could not add Task Array: element =', i, "is not of type object");
                break;
            }
        }
    }
    deleteTask(taskName){

    }

}

// Ask server for TTS Title and all Tasks
ajax.me.getTtsTitleAndAllTtsTasks(gTtsId, gAccessToken, (xhr) => {
    if (xhr.status == 200){
        let responseObj = JSON.parse(xhr.response);
        console.log('responseObj: ', responseObj);

        // Create Task_Manager Instance
        let taskMgr = new Task_Manager(_('tasks-container'), _('start-pause-btn'), _('reset-btn'));

        // Add Tasks
        taskMgr.addTaskArray(responseObj.tts_tasks_array);

        // Set important Event listeners
        _('tasks-container').scrollIntoView(false);
        _('start-pause-btn').onclick = () => {
            if (taskMgr.state != 'ongoing') {
                taskMgr.start();
            } else if (taskMgr.state == 'ongoing') {
                taskMgr.pause();
            }

        }
        _('reset-btn').onclick = () => {
            taskMgr.reset();
        }
    }else if(xhr.status == 403){
        window.location.assign("/");
    }else{
        console.log(xhr.status);
    }
});




