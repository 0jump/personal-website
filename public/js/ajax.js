// Holds all ajax-related functions
const ajax = {};


/* 
-------------HIGH LEVEL AJAX FUNCTIONS--------------
*/

// Holds all requests to the server that is running the website 'me' (NOT to other apis)
ajax.me = {};

// Users service requests

// Create new user
ajax.me.createUser = (fName, lName, emailAddr, pass, passConf, tosAgreement, callback) => {
    let reqPayload = {
        'fName': fName,
        'lName':lName,
        'emailAddr': emailAddr,
        'pass': pass,
        'passConf': passConf,
        'tosAgreement': true
    };

    ajax.sendJsonPostRequest('users?func=createUser', {}, reqPayload, callback);
};

// Auth Services 

ajax.me.signIn = (emailAddr, pass, callback) => {
    let reqPayload = {
        'emailAddr': emailAddr,
        'pass': pass
    };

    ajax.sendJsonPostRequest('auth?func=signIn', {}, reqPayload, callback);
};

ajax.me.makeSureUserIsAuthorized = (pAccessToken, callback) => {
    let headersObj = {
        'access_token': pAccessToken
    }
    ajax.sendJsonPostRequest('auth?func=makeSureUserIsAuthorized', headersObj, {}, callback);
};


// Promocode Services

ajax.me.submitPromocode = (promocode, callback) => {
    let reqPayload = {
        promocode
    };

    ajax.sendJsonPostRequest('promocode?func=submitPromocode', {}, reqPayload, callback);
}


// Task Services
ajax.me.createNewRootTaskForUser = (pAccessToken, callback) => {
    let headersObj = {
        'access_token': pAccessToken
    }
    ajax.sendJsonPostRequest('tasks?func=createNewRootTaskForUser', headersObj, {}, callback);
}

ajax.me.getTaskWithChildrenDeepAsArray = (pAccessToken, pTaskId, callback) => {
    let reqPayload = { 
        'task_id':pTaskId,
    }
    let headersObj = {
        'access_token': pAccessToken
    }
    ajax.sendJsonPostRequest('tasks?func=getTaskWithChildrenDeepAsArray', headersObj, reqPayload, callback);
}

ajax.me.createNewTaskForUser = (pAccessToken, pParentId, pRefSiblingId, pBeforeOrAfter, callback) => {
    let reqPayload = { 
        'parent_id':pParentId
    }
    let headersObj = {
        'access_token': pAccessToken
    }
    if(pBeforeOrAfter == "after"){
        reqPayload.previous_sibling_id = pRefSiblingId;
    }else if(pBeforeOrAfter == "before"){
        reqPayload.next_sibling_id = pRefSiblingId;
    }
    ajax.sendJsonPostRequest('tasks?func=createNewTaskForUser', headersObj, reqPayload, callback);
}

ajax.me.deleteTask = (pAccessToken, pTaskId, callback)=>{
    let reqPayload = { 
        'task_id':pTaskId
    }
    let headersObj = {
        'access_token': pAccessToken
    }
    ajax.sendJsonPostRequest('tasks?func=deleteTaskForUser', headersObj, reqPayload, callback);
}

// TTS Services
ajax.me.createNewTts = (pAccessToken,callback) => {
    // Created new entry in db and returns id
    let headersObj = {
        'access_token': pAccessToken
    }
    ajax.sendJsonPostRequest('tts?func=createNewTts', headersObj, {}, callback);
};

ajax.me.getAllTts = (pAccessToken, callback) => {
    let headersObj = {
        'access_token': pAccessToken
    }
    ajax.sendJsonPostRequest('tts?func=getAllTts', headersObj, {}, callback);
};

ajax.me.updateTtsTitle = (pNewTitle, pTtsId, pAccessToken, callback) => {
    let reqPayload = { 
        'tts_id':pTtsId,
        'tts_title':pNewTitle
    }
    let headersObj = {
        'access_token': pAccessToken
    }
    ajax.sendJsonPostRequest('tts?func=updateTtsTitle',headersObj, reqPayload, callback);
}

ajax.me.addNewTtsTask = (pTtsId, pAccessToken, callback) => {
    let reqPayload = { 
        'tts_task':{
            'title':'',
            'description':'',
            'duration': '0',
            'tts_id':pTtsId
        }
    }
    let headersObj = {
        'access_token': pAccessToken
    }
    ajax.sendJsonPostRequest('tts?func=addNewTtsTask',headersObj, reqPayload, callback);
};

ajax.me.getAllTtsTasks = (pTtsId, pAccessToken, callback) => {
    let reqPayload = { 
        'tts_id':pTtsId
    }
    let headersObj = {
        'access_token': pAccessToken
    }
    ajax.sendJsonPostRequest('tts?func=getAllTasksForTtsInOrder',headersObj, reqPayload, callback);
}

ajax.me.deleteTtsTask = (pTtsTaskId ,pTtsId, pAccessToken, callback) => {
    let reqPayload = { 
        'tts_id':pTtsId,
        'tts_task_id':pTtsTaskId.toString()
    }
    let headersObj = {
        'access_token': pAccessToken
    }
    ajax.sendJsonPostRequest('tts?func=deleteTtsTask',headersObj, reqPayload, callback);
}

ajax.me.updateTtsTask = (pTtsTaskId, pNewTitle, pNewDescription, pNewDuration, pTtsId, pAccessToken, callback) => {
    let reqPayload = { 
        'tts_id':pTtsId,
        'tts_task':{
            'title':pNewTitle,
            'description': pNewDescription,
            'duration':pNewDuration,
            'tts_task_id':pTtsTaskId
        }
    }
    let headersObj = {
        'access_token': pAccessToken
    }
    ajax.sendJsonPostRequest('tts?func=updateTtsTask',headersObj, reqPayload, callback);
}

ajax.me.getTtsTitleAndAllTtsTasks = (pTtsId, pAccessToken, callback) => {
    let reqPayload = { 
        'tts_id':pTtsId
    }
    let headersObj = {
        'access_token': pAccessToken
    }
    ajax.sendJsonPostRequest('tts?func=getTtsTitleAndAllTasksForTtsInOrder',headersObj, reqPayload, callback);
}

ajax.me.getTtsInfo = (pTtsId, pAccessToken, callback)=> {
    let reqPayload = { 
        'tts_id':pTtsId
    }
    let headersObj = {
        'access_token': pAccessToken
    }
    ajax.sendJsonPostRequest('tts?func=getTtsInfo',headersObj, reqPayload, callback);
}

ajax.me.deleteTtsAndTtsTasks = (pTtsId, pAccessToken, callback) => {
    let reqPayload = { 
        'tts_id':pTtsId
    }
    let headersObj = {
        'access_token': pAccessToken
    }
    ajax.sendJsonPostRequest('tts?func=deleteTtsAndTtsTasks',headersObj, reqPayload, callback);
}

// Debugging emails
ajax.me.sendDebugEmail = (pEmailSubject, pEmailBody, callback) => {
    let reqPayload = { 
        'emailSubject':pEmailSubject,
        'emailText':pEmailBody
    }
    ajax.sendJsonPostRequest('send-debug-email', {}, reqPayload, callback);
}


/* 
-------------LOW LEVEL AJAX FUNCTIONS--------------

Note: Remember to check for xhr.status when calling these functions

Example:
--------
ajax.sendJsonPostRequest = (url, headersObject, jsonObj,()=>{
    if (xhr.status == 200) { // status 200 means response is received with no problem
        console.log('Response:', xhr.response);
    }
});

----------------------------------------------------
*/

// JSON-type Requests

// [JSON] POST Request
ajax.sendJsonPostRequest = (url, headersObject, jsonObj,callback)=> {
    // Sending and receiving data in JSON format using POST method

    var xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-Type", "application/json");

    if (Object.keys(headersObject).length > 0) {
        for (i = 0; i < Object.keys(headersObject).length; i++) {
            xhr.setRequestHeader(Object.keys(headersObject)[i], headersObject[Object.keys(headersObject)[i]]);
        }
    }

    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4){
            callback(xhr);
        }
    };
    var data = JSON.stringify(jsonObj);
    //console.log(xhr);
    xhr.send(data);
};

// [JSON] GET Request
ajax.sendJsonGetRequest = (url, headersObject,callback)=> {
    // Sending and receiving data in JSON format using POST method

    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    if (Object.keys(headersObject).length > 0) {
        for (i = 0; i < Object.keys(headersObject).length; i++) {
            xhr.setRequestHeader(Object.keys(headersObject)[i], headersObject[Object.keys(headersObject)[i]]);
        }
    }
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4){
            callback(xhr);
        }
    };
    xhr.send();
};

// [JSON] DELETE Request
ajax.sendJsonDeleteRequest = (url, headersObject, jsonObj, callback) => {
    var xhr = new XMLHttpRequest();
    xhr.open("DELETE", url, true);
    xhr.setRequestHeader("Content-Type", "application/json");

    if (Object.keys(headersObject).length > 0) {
        for (i = 0; i < Object.keys(headersObject).length; i++) {
            xhr.setRequestHeader(Object.keys(headersObject)[i], headersObject[Object.keys(headersObject)[i]]);
        }
    }

    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4){
            callback(xhr);
        }
    };
    var data = JSON.stringify(jsonObj);
    xhr.send(data);
};

// [JSON] PUT Request
ajax.sendJsonPutRequest = (url, headersObject, jsonObj, callback) => {
    var xhr = new XMLHttpRequest();
    xhr.open("PUT", url, true);
    xhr.setRequestHeader("Content-Type", "application/json");

    if (Object.keys(headersObject).length > 0) {
        for (i = 0; i < Object.keys(headersObject).length; i++) {
            xhr.setRequestHeader(Object.keys(headersObject)[i],headersObject[Object.keys(headersObject)[i]]);
        }
    }

    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4){
            callback(xhr);
        }
    };
    var data = JSON.stringify(jsonObj);
    xhr.send(data);
};