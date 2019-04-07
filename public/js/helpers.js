// Container for all helpers
let helpers = {};

/*  function to check for keys with false values within objects */
helpers.checkForKeysWithFalseValues = (object) => {
    let objKeysList = Object.keys(object)
    let objSize = objKeysList.length;
    if (objSize >= 1) {
        let listOfKeysWithFalseValues = [];
        for (let i = 0; i < objKeysList.length; i++){
            let key = objKeysList[i];
            if (object[key] == false){
                listOfKeysWithFalseValues.push(key);
            }
        }
        return listOfKeysWithFalseValues;
    } else {
        console.log('[helpers.checkForKeysWithFalseValues] parameter "object" is empty');
        return false;
    }
};


// Valiate an email address using regex
helpers.isValidEmail = (email) => {
    let re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
};

helpers.isValidPassword = (pass) => {
    if (pass.length >= 8 && pass.length <= 255) {
        return true;
    } else {
        return false;
    }
};

helpers.msToTime = (duration) => {
    let milliseconds = parseInt((duration % 1000) / 100),
    seconds = parseInt((duration / 1000) % 60),
    minutes = parseInt((duration / (1000 * 60)) % 60),
    hours = parseInt((duration / (1000 * 60 * 60)) % 24);

    hours = (hours < 10) ? "0" + hours : hours;
    minutes = (minutes < 10) ? "0" + minutes : minutes;
    seconds = (seconds < 10) ? "0" + seconds : seconds;

    return hours + ":" + minutes + ":" + seconds + ":" + milliseconds;
}


helpers.getAllUrlParams = (url) => {
    // get query string from url (optional) or window
    let queryString = url ? url.split('?')[1] : window.location.search.slice(1);

    // we'll store the parameters here
    let obj = {};

    // if query string exists
    if (queryString) {

        // stuff after # is not part of query string, so get rid of it
        queryString = queryString.split('#')[0];

        // split our query string into its component parts
        let arr = queryString.split('&');

        for (let i = 0; i < arr.length; i++) {
            // separate the keys and the values
            let a = arr[i].split('=');

            // set parameter name and value (use 'true' if empty)
            let paramName = a[0];
            let paramValue = typeof (a[1]) === 'undefined' ? true : a[1];

            // (optional) keep case consistent
            paramName = paramName.toLowerCase();
            if (typeof paramValue === 'string') paramValue = paramValue.toLowerCase();

            // if the paramName ends with square brackets, e.g. colors[] or colors[2]
            if (paramName.match(/\[(\d+)?\]$/)) {

                // create key if it doesn't exist
                let key = paramName.replace(/\[(\d+)?\]/, '');
                if (!obj[key]) obj[key] = [];

                // if it's an indexed array e.g. colors[2]
                if (paramName.match(/\[\d+\]$/)) {
                    // get the index value and add the entry at the appropriate position
                    let index = /\[(\d+)\]/.exec(paramName)[1];
                    obj[key][index] = paramValue;
                } else {
                    // otherwise add the value to the end of the array
                    obj[key].push(paramValue);
                }
            } else {
                // we're dealing with a string
                if (!obj[paramName]) {
                    // if it doesn't exist, create property
                    obj[paramName] = paramValue;
                } else if (obj[paramName] && typeof obj[paramName] === 'string') {
                    // if property does exist and it's a string, convert it to an array
                    obj[paramName] = [obj[paramName]];
                    obj[paramName].push(paramValue);
                } else {
                    // otherwise add the property
                    obj[paramName].push(paramValue);
                }
            }
        }
    }

    return obj;
}