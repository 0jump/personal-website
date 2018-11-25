const newTtsButton = _('new-tts-btn');
const ttsCtr = _('tts-container');

let gEditClick = false;

class TimedTaskSequence {
    constructor(parentDiv){
        this.tts = CDE('div', [['class', 'tts']]);                
            this.ttsTitleCtr = CDE('div', [['class',"tts-title-ctr"]]);
                this.ttsTitle = CDE('h4' , [['class', "tts-title"]]);
                    this.ttsTitle.innerText = 'Morning Routine';
                this.ttsTitleCtr.appendChild(this.ttsTitle);
            this.tts.appendChild(this.ttsTitleCtr);
            
            this.ttsEditBtnCtr = CDE('div', [['class',"tts-edit-btn-ctr"]]);
                this.ttsEditBtn = CDE('button', [['class',"tts-edit-icon"]]);
                    this.ttsEditBtn.innerText = 'e';
                this.ttsEditBtnCtr.appendChild(this.ttsEditBtn);
            this.tts.appendChild(this.ttsEditBtnCtr);
        parentDiv.appendChild(this.tts);

        /* this.ttsTitleCtr.onclick = () => {
            // Request to server with token

            window.location = "/timer";
        } */

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