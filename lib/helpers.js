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

module.exports = helpers;