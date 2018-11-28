
class Task {
    constructor(parentDiv){
        this.parentDiv = parentDiv;

        this.task = CDE('div', [["class","task hh"]]);
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
                    this.taskDuration = CDE('input', [['class',"task-duration-ctr"], ['placeholder', 'hh:mm:ss']]);
                        
                    this.taskDurationCtr.appendChild(this.taskDuration);
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

newTaskBtn.onclick= () => {
    let newTask = new Task(taskCtr);
};
