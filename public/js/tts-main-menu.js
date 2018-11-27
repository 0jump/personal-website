const newTtsButton = _('new-tts-btn');
const ttsCtr = _('tts-container');

let gEditClick = false;

class TimedTaskSequence {
    constructor(parentDiv){
        this.tts = CDE('div', [['class', 'tts']]);       
            this.ttsHeaderRow = CDE('div', [['class','tts-header-row tts-row']]);
                this.ttsTitleCtr = CDE('div', [['class',"tts-title-ctr"]]);
                    this.ttsTitle = CDE('h4' , [['class', "tts-title"]]);
                        this.ttsTitle.innerText = 'Morning Routine';
                    this.ttsTitleCtr.appendChild(this.ttsTitle);
                this.ttsHeaderRow.appendChild(this.ttsTitleCtr);

                this.ttsDurationCtr = CDE('div', [['class',"tts-duration-ctr"]]);
                    this.ttsDuration = CDE('span', [['class',"tts-duration"]]);
                        this.ttsDuration.innerText = '20';
                    this.ttsDurationCtr.appendChild(this.ttsDuration);
                this.ttsHeaderRow.appendChild(this.ttsDurationCtr);
            this.tts.appendChild(this.ttsHeaderRow);


            this.ttsRow2 = CDE('div', [['class',"tts-row-2 tts-row"]]);
                this.ttsStatusCtr = CDE('div', [['class',"tts-status-ctr"]]);
                    this.ttsStatusIconCtr = CDE('div', [['class','tts-status-icon-ctr']]);
                        this.ttsStatusIcon = CDE('div', [['class',"tts-status-icon"]]);
                        
                        this.ttsStatusIconCtr.appendChild(this.ttsStatusIcon);
                    this.ttsStatusCtr.appendChild(this.ttsStatusIconCtr);


                this.ttsStatusTextCtr = CDE('div', [['class', "tts-status-text-ctr"]]);
                    this.ttsStatus = CDE("span", [['class', "tts-status"]]);
                        this.ttsStatus.innerText = 'stopped';
                    this.ttsStatusTextCtr.appendChild(this.ttsStatus);
                
                    this.ttsStatusCtr.appendChild(this.ttsStatusTextCtr);
                this.ttsRow2.appendChild(this.ttsStatusCtr);

                this.ttsEditBtnCtr = CDE('div', [['class','tts-edit-btn-ctr']]);
                    this.ttsEditBtn = CDE('button',[["class","tts-edit-btn"]]);
                        this.ttsEditBtn.innerHTML = `
                        <svg id="tts-edit-btn-icon" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
                        width="10px" height="10px" viewBox="0 0 528.899 528.899"
                        xml:space="preserve"><g>
                        <path d="M328.883,89.125l107.59,107.589l-272.34,272.34L56.604,361.465L328.883,89.125z M518.113,63.177l-47.981-47.981 c-18.543-18.543-48.653-18.543-67.259,0l-45.961,45.961l107.59,107.59l53.611-53.611 C532.495,100.753,532.495,77.559,518.113,63.177z M0.3,512.69c-1.958,8.812,5.998,16.708,14.811,14.565l119.891-29.069 L27.473,390.597L0.3, 512.69z"/>
                        </g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g>
                        </svg>
                        `;
                    this.ttsEditBtnCtr.appendChild(this.ttsEditBtn);
                this.ttsRow2.appendChild(this.ttsEditBtnCtr);
            this.tts.appendChild(this.ttsRow2);
        parentDiv.appendChild(this.tts);



        this.tts.onclick = () => {
            // Request to server with token
            if(!gEditClick){
                window.location = "/timer";
            }
            gEditClick = false;
            
        }

        this.ttsEditBtn.onclick = () => {
            gEditClick = true;
            console.log('EDIT');
        }
    }
}

newTtsButton.onclick = () => {
    let newTTS = new TimedTaskSequence(ttsCtr);
}


new TimedTaskSequence(ttsCtr);
new TimedTaskSequence(ttsCtr);
new TimedTaskSequence(ttsCtr); 