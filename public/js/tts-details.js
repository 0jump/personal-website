

class Task {
    constructor(parentDiv){
        this.task = CDE('div', [["class","task hh"]]);
            this.leftCtr = CDE('div', [["class","left-ctr"]]);
                this.taskTitleCtr = CDE('div', [['class', 'task-title-ctr']]);
                    this.taskTitle = CDE('h4', [['class',"task-title"]]);
                        this.taskTitle.innerText = 'Wake up';
                    this.taskTitleCtr.appendChild(this.taskTitle);
                this.leftCtr.appendChild(this.taskTitleCtr);

                this.taskDescCtr = CDE('div',[['class', 'task-desc-ctr']]);
                    this.taskDesc = CDE('p', [['class', 'task-desc']]);
                        this.taskDesc.innerText = 'Do x do y do ...';
                    this.taskDescCtr.appendChild(this.taskDesc);
                this.leftCtr.appendChild(this.taskDescCtr);

                this.taskDurationCtr = CDE('div', [['class', 'task-duration-ctr']]);
                    this.taskDuration = CDE('div', [['class',"task-duration-ctr"]]);
                        this.taskDuration.innerText = '20m 25s';
                    this.taskDurationCtr.appendChild(this.taskDuration);
                this.leftCtr.appendChild(this.taskDurationCtr);
            this.task.appendChild(this.leftCtr);


            this.rightCtr = CDE('div', [["class", "right-ctr"]]);
                this.rightCtr.innerHTML = `
                <svg id="move-icon" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 210 210" style="enable-background:new 0 0 210 210;" xml:space="preserve">
                <g id="XMLID_86_">
                    <path id="XMLID_87_" d="M115,0H95c-8.284,0-15,6.716-15,15v20c0,8.284,6.716,15,15,15h20c8.284,0,15-6.716,15-15V15
                        C130,6.716,123.284,0,115,0z"/>
                    <path id="XMLID_88_" d="M115,80H95c-8.284,0-15,6.716-15,15v20c0,8.284,6.716,15,15,15h20c8.284,0,15-6.716,15-15V95
                        C130,86.716,123.284,80,115,80z"/>
                    <path id="XMLID_89_" d="M115,160H95c-8.284,0-15,6.716-15,15v20c0,8.284,6.716,15,15,15h20c8.284,0,15-6.716,15-15v-20
                        C130,166.716,123.284,160,115,160z"/></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g></svg>`
            this.task.appendChild(this.rightCtr);
        parentDiv.appendChild(this.task);
    }
}

let newTaskBtn = _('new-task-btn');
let taskCtr = _('task-ctr');

newTaskBtn.onclick= () => {
    let newTask = new Task(taskCtr);
};
