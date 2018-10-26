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

module.exports = helpers;