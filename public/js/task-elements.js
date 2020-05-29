class Element {
    constructor(pElemJsonObj){
        this.id = pElemJsonObj.id;
        this.task;
        this.previousSibling;
        this.nextSibling;
    }
    createDomElem(){
        this.domElem = CDE('div',[['class','task-element'],['id',this.id]]);
            this.domElemBody = CDE('div',[['class','task-element-body']]);
                this.domElemIdCtr = CDE('div', [['class','task-element-id-ctr']]);
                    this.domElemId = CDE('span', [["class", 'task-element-id']]);
                        this.domElemId.innerText = this.id;
                    this.domElemIdCtr.appendChild(this.domElemId);
                this.domElemBody.appendChild(this.domElemIdCtr);
            this.domElem.appendChild(this.domElemBody);
    }
}