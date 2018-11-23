var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

// Holds all ajax-related functions
const ajax = {};


/* 
-------------HIGH LEVEL AJAX FUNCTIONS--------------
*/

ajax.getIpInfo = (ipAddr, callback) => {
    const ipApiServer = 'http://ip-api.com/json/';
    ajax.sendJsonGetRequest(ipApiServer + ipAddr, {}, (xhr)=>{
        if (xhr.status == 200) { // status 200 means response is received with no problem
            let ipAddrInfo = xhr.response;
            console.log(ipAddrInfo);
            callback(ipAddrInfo);
        }
        
    });
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

module.exports = ajax;