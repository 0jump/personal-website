class Element {
    constructor(pElemJsonObj){
        this.id = pElemJsonObj.id;
        this.task;
        this.previousSibling;
        this.nextSibling;

        this.jsonElemObj = pElemJsonObj;
    }
    createDomElem(){
        this.domElem = CDE('div',[['class','task-element'],['id',this.id]]);
            this.domElemBody = CDE('div',[['class','task-element-body']]);
                this.domElemIdCtr = CDE('div', [['class','task-element-id-ctr']]);
                    this.domElemId = CDE('span', [["class", 'task-element-id']]);
                        this.domElemId.innerText = this.id;
                    this.domElemIdCtr.appendChild(this.domElemId);
                this.domElemBody.appendChild(this.domElemIdCtr);

                this.domElemMoveUpBtnCtr = CDE('div', [['class', 'elem-move-up-btn-ctr']])
                    this.domElemMoveUpBtn = CDE('button', [['class', 'elem-move-up-btn']])
                            this.domElemMoveUpBtn.innerText = "Up";
                            this.domElemMoveUpBtn.onclick = () => {
                                this.moveMyselfUpWithinTask();
                            }
                        this.domElemMoveUpBtnCtr.appendChild(this.domElemMoveUpBtn)
                    this.domElemBody.appendChild(this.domElemMoveUpBtnCtr)
                this.domElem.appendChild(this.domElemBody);

                this.domMoveDownBtnCtr = CDE('div', [['class', 'elem-move-down-btn-ctr']])
                        this.domMoveDownBtn = CDE('button', [['class', 'elem-move-down-btn']])
                            this.domMoveDownBtn.innerText = "Down";
                            this.domMoveDownBtn.onclick = () => {
                                this.moveMyselfDownWithinTask();
                            }
                        this.domMoveDownBtnCtr.appendChild(this.domMoveDownBtn)
                    this.domElemBody.appendChild(this.domMoveDownBtnCtr)
                this.domElem.appendChild(this.domElemBody);


                this.domElemDeleteBtnCtr = CDE('div', [['class', 'element-delete-btn-ctr']])
                    this.domElemDeleteBtn = CDE('button', [['class', 'element-delete-btn']])
                        this.domElemDeleteBtn.innerText = "Delete Element";
                        this.domElemDeleteBtn.onclick = () => {
                            this.task.deleteElement(this);
                        }
                    this.domElemDeleteBtnCtr.appendChild(this.domElemDeleteBtn)
                this.domElemBody.appendChild(this.domElemDeleteBtnCtr)
            this.domElem.appendChild(this.domElemBody);

    }
    onElemCreationRelationshipsUpdate(pTask){
        if(this.jsonElemObj.task_id != null){
            this.task = pTask;
            this.task.elements[this.id] = this;
        }/* else{
            this.task = null;
        } */
        if(this.jsonElemObj.previous_sibling_id != null){
            this.previousSibling = pTask.elements[this.jsonElemObj.previous_sibling_id];
        }else{
            this.previousSibling = null;
        }
        if(this.jsonElemObj.next_sibling_id != null){
            this.nextSibling = pTask.elements[this.jsonElemObj.next_sibling_id];
        }else{
            this.nextSibling = null;
        }
    }
    initialRelationshipsUpdate(pInitializedElementsObj, pInitializedTasksObj){
        //console.log('pInitializedElementObj: ', pInitializedElementObj);
        // Use to ask parent to give next sibling and previous sibling Task Objects after initialization of all tasks
        if(this.jsonElemObj.task_id != null){
            this.task = pInitializedTasksObj[this.jsonElemObj.task_id];
            if (typeof(this.task) === 'undefined'){
                this.task = null;
            }else{
                this.task.elements[this.id] = this;
            }
        }else{
            this.task = null;
        }
        if(this.jsonElemObj.previous_sibling_id != null){
            this.previousSibling = pInitializedElementsObj[this.jsonElemObj.previous_sibling_id];
        }else{
            this.previousSibling = null;
        }
        if(this.jsonElemObj.next_sibling_id != null){
            this.nextSibling = pInitializedElementsObj[this.jsonElemObj.next_sibling_id];
        }else{
            this.nextSibling = null;
        }
    }
    moveMyselfUpWithinTask(){
        if(this.previousSibling != null){
            this.task.pasteElementBefore(this.previousSibling.id, this.task.id ,this.id)
        }else{
            console.log("Cannot move up anymore")
        }
    }
    moveMyselfDownWithinTask(){
        if(this.nextSibling != null){
            if(this.nextSibling.nextSibling != null){
                this.task.pasteElementBefore(this.nextSibling.nextSibling.id, this.task.id ,this.id)
            }else{
                this.task.pasteElementBefore(null, this.task.id ,this.id)
            }
        }
    }
    
}