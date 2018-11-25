

// Container for all helpers
var helpers = {};

// Parse a JSON string to an object in all cases without throwing
helpers.parseJsonToObject = (str) => {
    try {
        var object = JSON.parse(str);
        return object;
    } catch(e) {
        return {};
    }
};

helpers.asyncParseJsonToObject = (str, callback) => {
    try {
        var object = JSON.parse(str);
        callback(false, object);
    } catch(e) {
        callback(true, object);
    }
};

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
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
};

helpers.isValidPassword = (pass) => {
    if (pass.length >= 8 && pass.length <= 255) {
        return true;
    } else {
        return false;
    }
};

// Get the data returned from the ip-api.com/json API and turn it into a saveable format to MySQL
helpers.getDbFriendlyIpData = (ipApiResponseObject, callback) => {
    let dbFriendlyObject = {
        ip_address: ipApiResponseObject.query,
        country: ipApiResponseObject.country,
        city: ipApiResponseObject.city,
        visit_date: moment.utc().format('YYYY-MM-DD HH:mm:ss')
    };
    
    callback(dbFriendlyObject);
}


module.exports = helpers;