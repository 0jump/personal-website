const gAccessToken = window.localStorage.getItem('access_token');

class TaskSequencesManager {
    constructor(pRootTaskId){
        console.log('pRootTaskId: ', pRootTaskId);
        this.rootTaskId = pRootTaskId;
        this.taskSequences = [];
        this.taskSeqCtr = _("owned-ts-container");
        this.newTsBtn = _("new-ts-btn");

        this.sharedTaskSeqCtr = _("shared-ts-ctr");
        this.sharedTaskSequences = [];

        this.newTsBtn.onclick = ()=>{
            this.createTaskSequence();
        }
    }
    getTasksFromServer(callback){
        ajax.me.getFirstGenerationSubtasks(gAccessToken, this.rootTaskId, (xhr)=> {
            if(xhr.status == 200){
                callback(JSON.parse(xhr.response));
            }else if(xhr.status == 403){
                window.location.assign("/");
            }
        });
    }
    getSharedTasksFromServer(callback){
        ajax.me.getTasksSharedWithUser(gAccessToken, (xhr)=> {
            if(xhr.status == 200){
                callback(JSON.parse(xhr.response));
            }else if(xhr.status == 403){
                window.location.assign("/");
            }
        });
    }
    displayTaskSequences(){
        /* When page is loaded, there is a request to get all root tasks
        The response is an array which contains json objects representing the task sequences
        Convert these json objs into "TaskSequence" objects */
        for(let i = 0; i < this.taskSequences.length; i ++){
            this.taskSequences[i].createDomElement();
            this.taskSeqCtr.appendChild(this.taskSequences[i].dom);
        }
    }
    displaySharedTaskSequences(){
        /* When page is loaded, there is a request to get all root tasks
        The response is an array which contains json objects representing the task sequences
        Convert these json objs into "TaskSequence" objects */
        for(let i = 0; i < this.sharedTaskSequences.length; i ++){
            this.sharedTaskSequences[i].createDomElement();
            this.sharedTaskSeqCtr.appendChild(this.sharedTaskSequences[i].dom);
        }
    }
    createTaskSequence(){
        // ask server to create new task sequence and add it to taskSequences array and display it
        ajax.me.createNewTaskForUser(gAccessToken, this.rootTaskId, null, "before", (xhr)=>{
            if(xhr.status == 200){
                let newTaskId = JSON.parse(xhr.response).new_task.id;
                window.location.assign("/task-sequence-details?task_id=" + newTaskId);
            }else if(xhr.status == 403){
                window.location.assign("/");
            }
        });
    }
    constructTaskSequences(pJsonArray){
        for(let i = 0; i < pJsonArray.length; i ++){
            let jsonTask = pJsonArray[i];
            this.taskSequences.push(new TaskSequence(jsonTask));
        }
    }
    constructSharedTaskSequences(pJsonArray){
        for(let i = 0; i < pJsonArray.length; i ++){
            let jsonTask = pJsonArray[i];
            this.sharedTaskSequences.push(new TaskSequence(jsonTask));
        }
    }
}

class TaskSequence{
    constructor(pJsonTaskSeq){
        this.id = pJsonTaskSeq["id"];
        this.title = pJsonTaskSeq["title"];
        this.prevSibling = pJsonTaskSeq["previous_sibling"];
        this.nextSibling = pJsonTaskSeq["next_sibling"];
        
        this.createDomElement();
    }
    createDomElement(){
        this.dom = CDE('div', [['class', 'task-sequence']]);
            this.domHeaderRow = CDE('div', [['class','ts-header-row']]);
                this.domTitleCtr = CDE('div', [['class','ts-title-ctr']]);
                    this.domTitle = CDE('div', [['class', 'ts-title']]);
                        this.changeDomTitle(this.title);
                    this.domTitleCtr.appendChild(this.domTitle);
                this.domHeaderRow.appendChild(this.domTitleCtr);
                this.domIdCtr = CDE('div', [['class', 'ts-id-ctr']]);
                    this.domId = CDE('div', [['class', 'ts-id']]);
                        this.domId.innerText = this.id;
                    this.domIdCtr.appendChild(this.domId);
                this.domHeaderRow.appendChild(this.domIdCtr);

                this.dom.onclick = () => {
                    window.location.assign("/task-sequence-details?task_id=" + this.id);
                }
            this.dom.appendChild(this.domHeaderRow);
    }
    changeDomTitle(pNewTitle){
        this.domTitle.innerText = pNewTitle;
    }
}

ajax.me.getRootTaskForUserifNotFoundCreateIt(gAccessToken, (xhr) => {
    if(xhr.status == 200){
        let rootTaskId = JSON.parse(xhr.response).task_id;
        let taskSeqManager = new TaskSequencesManager(rootTaskId);
        taskSeqManager.getTasksFromServer((jsonArray)=>{
            taskSeqManager.constructTaskSequences(jsonArray);
            taskSeqManager.displayTaskSequences();
            console.log('Owned Task Sequences: ', taskSeqManager.taskSequences);
        });
        taskSeqManager.getSharedTasksFromServer((sharedTasksJsonArray) => {
            taskSeqManager.constructSharedTaskSequences(sharedTasksJsonArray);
            taskSeqManager.displaySharedTaskSequences();
            console.log('Shared Task Sequences: ', taskSeqManager.sharedTaskSequences);
        })
    }else if (xhr.status == 403){
        window.location.assign("/");
    }else{
        console.log("status", xhr.status);
    }
})
