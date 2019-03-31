/* 
This file holds all functions that help the server process any information concerning Rask Sequences
*/

// Object that holds all the task sequence functions
const taskSeq = {};

// Compute the duration of a Timed Task Sequence
taskSeq.computeDurationOfTaskSequence = (pListOfTaskObjects) => {
    durationInMs = 0;
    for(let i = 0; i < pListOfTaskObjects.length; i++){
        let taskObj = pListOfTaskObjects[i];
        durationInMs = durationInMs + taskObj.duration;
    }
    return durationInMs
}

module.exports = taskSeq;