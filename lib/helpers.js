let moment = require('moment');
const jwt = require('jsonwebtoken');
const config = require('./server-configurations');

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
        console.log('JSON ERROR: \n--------------\n', e);
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

helpers.verifyAccessToken = (pReq, callback) => {
    /* 
    Takes the request [pReq] and checks if the access token inside is valid.
    Returns:
        - false: the token is invalid, or if it was not possible to read the header "access_token" for whatever reason
        - authdata: object containing the information in the access_token header 
    */

    let access_token = pReq.header('access_token');
    if (typeof access_token == 'string' && access_token.length > 0){
        jwt.verify(access_token, config.jwt.secret, (err, authData) => {
            if (!err) {
                callback(authData);
            }else{
                callback(false);
            }
        });
    }else{
        callback(false);
    }
}

helpers.mergeChangesToImplementObjects = (pCh1, pCh2) => {
    let changesToImplement = {};

    
    let ch1Keys = Object.keys(pCh1);
    let ch2Keys = Object.keys(pCh2);

    let NoDuplicateKeys = [];

    for(let i=0; i< ch1Keys.length; i++){
        let ch1 = pCh1[ch1Keys[i]]; // '1': {'previous_sibling_id': 2, 'next_sibling_id': 1}
        
        let id1Keys = Object.keys(ch1); // ['previous_sibling_id', 'next_sibling_id']
        
        for(let ii=0;ii<id1Keys.length; ii++){
            let id1 = id1Keys[ii] // 'previous_sibling_id'
            
            if(typeof(changesToImplement[ch1Keys[i]]) == 'undefined'){
                changesToImplement[ch1Keys[i]] = {};
            }

            changesToImplement[ch1Keys[i]][id1] = ch1[id1];
        }
    }

    for(let i=0; i< ch2Keys.length; i++){
        let ch2 = pCh2[ch2Keys[i]]; // '1': {'previous_sibling_id': 2, 'next_sibling_id': 1}
        
        let id2Keys = Object.keys(ch2); // ['previous_sibling_id', 'next_sibling_id']
        for(let ii=0;ii<id2Keys.length; ii++){
            let id2 = id2Keys[ii] // 'previous_sibling_id'

            if(typeof(changesToImplement[ch2Keys[i]]) == 'undefined'){
                changesToImplement[ch2Keys[i]] = {};
            }

            changesToImplement[ch2Keys[i]][id2] = ch2[id2];
        }
    }

    return changesToImplement;
}

helpers.isBetterPermissionStrict = (pNewPermission, pOldPermission) => {
    // If at the same level returns false
    if(db._permissionsList.includes(pNewPermission)){
        if(pOldPermission == "no_permission"){
            switch(pNewPermission){
                // Anything is better than no permission except itself
                case "no_permission":
                    return false;
                    break;
                default:
                    callback('','',true);
            }
        }else if (pOldPermission == "read_only"){
            switch(pNewPermission){
                case "no_permission":
                    return false;
                    break;
                case "read_only":
                    return false;
                    break;
                default:
                    callback('','',true);
            }
        }else if (pOldPermission == "can_edit"){
            switch(pNewPermission){
            
                case "no_permission":
                    return false;
                    break;
                case "read_only":
                    return false;
                    break;
                case "can_edit":
                    callback('', '', false);
                    break;
                default:
                    callback('','',true);
            }
        }else if (pOldPermission == "can_give_permissions"){
            switch(pNewPermission){
                
                case "no_permission":
                    return false;
                    break;
                case "read_only":
                    return false;
                    break;
                case "can_edit":
                    return false;
                    break;
                case "can_give_permissions":
                    return false;
                    break;
                default:
                    return true;
            }
        }else if (pOldPermission == "owner"){
            return false;
        }
    }else{
        return false;
    }
}

/** verifyTokenExistence method - this method verifies token */
/* helpers.verifyTokenExistence = (req, res, next) => {
    //Request header with authorization key
    const bearerHeader = req.headers['access_token'];
    console.log('\nbearerHeader: ', bearerHeader, '\n');
    
    //Check if there is a header
    if(typeof bearerHeader !== 'undefined'){

        const bearer = bearerHeader.split(' ');
        console.log('bearer: ', bearer);
        
        
        //Get Token arrray by spliting
        const bearerToken = bearer[0];

        req.token = bearerToken;
        
        //call next middleware
        next();

    }else{
        
        res.status(403).json({'Error':'VerifyTokenExistence Failed'});
    }
} */

module.exports = helpers;