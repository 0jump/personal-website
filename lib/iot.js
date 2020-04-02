const moment = require('moment');
const helpers = require('./helpers');

class IOTTracker {
    constructor(){
        //this.domIotDevicesCtr = pDomIotDevicesCtr;
        this.devices = []; // Array that holds iotdevices
    }
    update(){
        for(let i = 0; i < this.devices.length; i ++){
            this.devices[i].update();
        }
    }
    display(){
        for(let i = 0; i < this.devices.length; i ++){
            this.devices[i].display();
        }
    }
    isMsgCorrectFormat(pJsonObj){
        console.log('pJsonObj: ', pJsonObj);
        console.log('pJsonObj: ', typeof(pJsonObj));
        // Check if attribute:
        
        // "id" of type number
        if(typeof(pJsonObj["id"]) === 'number'){console.log("id exists");}else{
            console.log("id doesnt exists");
            return false;}
        // "msg_type" of type string 
        if(typeof(pJsonObj["msg_type"]) === 'string'){console.log("msg_type exists");}else{return false;}
        
        // if all tests pass
        return true;
    }
    getIotDeviceIndexById(pIotDeviceId){
        for(let i = 0; i < this.devices.length; i++){
            if(this.devices[i]["id"] == pIotDeviceId){
                return i;
            }
        }
        return -1;
    }
    isIotDeviceKnown(pJsonObj){
        // Check if in devices array
        if(getIotDeviceIndexById(pJsonObj.id) != -1){
            return true;
        }
        return false;
    }
    processMsg(pMsg, callback){
        let incomingJsonIotDevice = pMsg;
        if(typeof(pMsg) == 'string'){
            incomingJsonIotDevice = helpers.parseJsonToObject(pMsg);
        }
        console.log('incomingJsonIotDevice: ', incomingJsonIotDevice);
        // Check if the message is the correct format
        if(this.isMsgCorrectFormat(incomingJsonIotDevice)){
            // Check if msg is coming from known iot device
            let iotDeviceIndex = this.getIotDeviceIndexById(incomingJsonIotDevice.id)
            if(iotDeviceIndex != -1){
                return this.devices[iotDeviceIndex].processMsg(pMsg);
            }else{
                throw {
                    "err_type": "device_unknown",
                    "err_desc": "msg is correct format but device is unknown",
                    "reference": 82668266
                };
                //console.log("IOT Device is not known");
            }
        }else{
            throw {
                "err_type": "wrong_msg_format",
                "err_desc": "msg given is wrong format (not json format)",
                "reference": 82668267
            };
            console.log("IOT Device Message is wrong format");
        }
    }
}

class IOTDevice {
    constructor(pJsonObj){
        this.id = pJsonObj.id;
        this.isOnline = false;
        this.delayBetweenCheckIns = 60000; // How much time between checkins to consider not online (In milliseconds)

        this.lastCheckIn = moment.utc(); // Datetime to know when was the last signal
        this.beforeLastCheckIn = this.lastCheckIn - ( 1.2 * this.delayBetweenCheckIns );
    }
    checkIn(){
        // Say that iotDevice is operational
        this.beforeLastCheckIn = this.lastCheckIn;
        this.lastCheckIn = moment.utc();
    }
    connectionStatusUpdate(){
        // checks if iot device is operational
        let durationBetweenLastTwoCheckIns = moment.duration(this.lastCheckIn.diff(this.beforeLastCheckIn));

        if(durationBetweenLastTwoCheckIns < this.delayBetweenCheckIns){
            this.isOnline = true;
        }else{
            this.isOnline = false;
        }

    }
    processMsg(pJsonObj){
        // Process every msg coming from iot device update
        if(pJsonObj["msg_type"] == "check_in"){
            // Device is only saying that it is online (nothing else expected)
            this.checkIn();
            this.update();
            return this.getAttributesAsJsonObj();
        }else{
            console.log("Unknown message type");
        }
    }
    getAttributesAsJsonObj(){
        return {
            "id": this.id,
            "isOnline": this.isOnline ,
            "last_check_in": this.lastCheckIn.format('YYYY-MM-DD HH:mm:ss')
        }
    }
    update(){
        this.connectionStatusUpdate();
    }
    display(){
        if(this.isOnline){

        }
    } 
}

let iotTracker = new IOTTracker();
iotTracker.devices[0] = new IOTDevice({"id": 826601});

module.exports = iotTracker;