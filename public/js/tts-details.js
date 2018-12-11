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
    constructor(container, hU, hD, mU, mD, sU, sD, cdDomId, hiddenTimerInput){

        super();

        this.id = cdDomId;

        this.isActive = false;
        this.is1stKeypress = true;
        //this.containerClicked = false;
        this.hiddenTimerInput = hiddenTimerInput;

        this.userInput = ["0","0","0","0","0","0"];

        this.ctr = container;
        this.hU = hU;
        this.hD = hD;
        this.mU = mU;
        this.mD = mD;
        this.sU = sU;
        this.sD = sD;



        this.ctr.onclick = ()=>{
            console.log('clicked container');
            gLastCountdownDomClicked = this;
            console.log(gLastCountdownDomClicked);
            /* if(!this.isActive){
                setActiveTask(this);
                gLastCountdownDomClicked = this.id;
            }else if (this.isActive){
                this.deactivate();
            } */
        };


        
    }
    activate(){
        if(!this.isActive){
            ;
            this.pause();
            this.ctr.classList.add('active');
            this.is1stKeypress = true;
            // Set the hidden input field to focus so the keyboard shows up on mobile phone
            this.hiddenTimerInput.focus();
            // Add event listeners for keybord typing
            console.log(this.id ,'Keypress Active');
            document.onkeypress = (evt) =>{

                let isNbr = this.isNumberKey(evt);
                if( isNbr >= 0){
                    if (this.is1stKeypress){
                        this.userInput = ["0","0","0","0","0","0"];
                    }

                    this.userInput.push(isNbr);
                    this.userInput.shift();
                    let timeEnteredInMs = timeToMs(this.userInput[0] + this.userInput[1] + ":" + this.userInput[2] + this.userInput[3] + ":" + this.userInput[4] + this.userInput[5] + ":00");
                    console.log('time entered: ', timeEnteredInMs);

                    this.hD.innerText = this.userInput[0];
                    this.hU.innerText = this.userInput[1];
                    this.mD.innerText = this.userInput[2];
                    this.mU.innerText = this.userInput[3];
                    this.sD.innerText = this.userInput[4];
                    this.sU.innerText = this.userInput[5];

                    this.fillDigit(this.hD)
                    this.fillDigit(this.hU)
                    this.fillDigit(this.mD)
                    this.fillDigit(this.mU)
                    this.fillDigit(this.sD)
                    this.fillDigit(this.sU)
            

                    this.set(timeEnteredInMs);

                    this.is1stKeypress = false;
                }
            }
            this.ctr
            this.ctr.on
            this.isActive = true;
        } 
    } 
    deactivate(){
        if(this.isActive){
            this.ctr.classList.remove('active');
            // remove event listeners for keyboard typing
            // FIXME: removeEventListener does not work so i used onkeypress with empty function
            /* document.removeEventListener("keypress", ()=>{}); */
            document.onkeypress = (evt) =>{};
            console.log(this.id,'Keypress INActive');


            this.isActive = false;
            
        }
    }
    fillDigit(digitDiv){
        digitDiv.classList.add('full');
    }
    unfillDigit(digitDiv){
        digitDiv.classList.remove('full');
    }
    updateCountdown(timeInMs){
        let orgTimeLeft = msToTime(timeInMs).split(':');
        hU.innerText = orgTimeLeft[0][1];
        hD.innerText = orgTimeLeft[0][0];
        mU.innerText = orgTimeLeft[1][1];
        mD.innerText = orgTimeLeft[1][0];
        sU.innerText = orgTimeLeft[2][1];
        sD.innerText = orgTimeLeft[2][0];
    }
    isNumberKey(evt){
        
        let charCode = (evt.which) ? evt.which : evt.keyCode;
        
        if (charCode == 46 || charCode > 31 && (charCode < 48 || charCode > 57)){
            evt.preventDefault();
            return -1;
        }
        return String.fromCharCode(charCode);
    }
    pause(){
        super.pause();
    }
}



class Task{
    constructor(parentDiv, taskId){
        this.id = taskId;
        this.parentDiv = parentDiv;
        
        this.task = CDE('div', [["class","task"]]);
            this.leftCtr = CDE('div', [["class","left-ctr"]]);
                this.taskTitleCtr = CDE('div', [['class', 'task-title-ctr']]);
                    this.taskTitle = CDE('input', [['class',"task-title"], ['placeholder','Your Task Title']]);
                        this.taskTitle.innerText = 'Wake up';
                    this.taskTitleCtr.appendChild(this.taskTitle);
                this.leftCtr.appendChild(this.taskTitleCtr);

                this.taskDescCtr = CDE('div',[['class', 'task-desc-ctr']]);
                    this.taskDesc = CDE('textarea', [['class', 'task-desc'], ['placeholder', 'Your Task Description']]);
                    this.taskDescCtr.appendChild(this.taskDesc);
                this.leftCtr.appendChild(this.taskDescCtr);

                this.taskDurationCtr = CDE('div', [['class', 'task-duration-ctr']]);
                    /* this.taskDuration = CDE('input', [['class',"task-duration-ctr"], ['placeholder', 'hh:mm:ss']]);
                        
                    this.taskDurationCtr.appendChild(this.taskDuration); */
                    this.nbrsCtr = CDE('div', [['class',"numbers-ctr"], ['id',"numbers-ctr"]]);
                        this.hiddenTimerInput = CDE('input', [/* ['type','number'], */['class','hidden-timer-input']]);
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

                        this.cdDom = new CountdownDom(this.nbrsCtr, this.hU, this.hD,this.mU,this.mD,this.sU, this.sD, this.id, this.hiddenTimerInput);

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
                        this.delete();
                    }
                    this.deleteBtnCtr.appendChild(this.deleteBtn);
                this.rightCtr.appendChild(this.deleteBtnCtr);
            this.task.appendChild(this.rightCtr);
        this.parentDiv.appendChild(this.task);
    }
    delete(){
        this.parentDiv.removeChild(this.task);
    }
}

let newTaskBtn = _('new-task-btn');
let taskCtr = _('task-ctr');
let gLastCountdownDomClicked;
let gActiveCdDom;

let taskObjList = [];

let id = 0;

newTaskBtn.onclick= () => {
    let newTask = new Task(taskCtr, ++id);
    taskObjList.push(newTask);
};

let setActiveCountdownDom = (pCdDomObj) => {
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
}


// Initial send tts object to save after writing something as tts title
let ttsTitleInput = _('tts-title');



ttsTitleInput.onblur = () => {
    let ttsTitle = ttsTitleInput.value;
    console.log(ttsTitle);
    ttsObj.title = ttsTitle;

}

