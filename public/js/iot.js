class IotManager {
    constructor(){
        this.lastUpdate = Date.now(); // Gets timestamp on creation
        this.devices = [];

        this.iotDevicesCtr = _('iot-devices-ctr');
    }
    getDevicesAsJsonObj(callback){
        // gets all iot devices from server
        ajax.me.getKnownIotDevices((xhr)=> {
            if(xhr.status == 200){
                let devicesAsJsonObjs = JSON.parse(xhr.response);
                for(let i = 0; i < devicesAsJsonObjs.length; i++){
                    this.devices.push(new IotDeviceDom(devicesAsJsonObjs[i]));
                }
                callback();
            }else{
                console.log("Could not get known devices");
            }
        });
    }
    displayAllDevices(){
        for(let i = 0; i < this.devices.length; i++){
            this.iotDevicesCtr.appendChild(this.devices[i].dom);
        }
    }
    updateAllDevices(callback){
        // gets all iot devices from server
        ajax.me.getKnownIotDevices((xhr)=> {
            if(xhr.status == 200){
                let devicesAsJsonObjs = JSON.parse(xhr.response);
                for(let i = 0; i < devicesAsJsonObjs.length; i++){
                    let jsonDevice = devicesAsJsonObjs[i];
                    let iotDevObj = this.devices[this.getDeviceIndex(jsonDevice.id)];
                    
                    iotDevObj.updateWithJsonObj(jsonDevice);
                }
                callback();
            }else{
                console.log("Could not get known devices");
            }
        });
    }
    getDeviceIndex(pId){
        for(let i = 0; i < this.devices.length; i++){
            if(this.devices[i].id == pId){
                return i;
            }
        }
    }
};


class IotDevice {
    constructor(pJsonObj){
        console.log('pJsonObj: ', pJsonObj);
        this.id = pJsonObj.id;
        this.isOnline = pJsonObj.is_online;
        this.name = pJsonObj.name;

        this.lastUpdate = Date.now(); // Datetime to know when was the last update
    }
    updateWithJsonObj(pJsonObj){
        // For Checking incoming JSON Object and making necessary changes
        let newJsonObj = pJsonObj;
        if(typeof(newJsonObj) != 'object'){
            newJsonObj = JSON.parse(newJsonObj);
        }
        if(pJsonObj.id == this.id){
            this.isOnline = newJsonObj.is_online;
            // Then I can make methods "updateThermometer" if the device has thermometer attachment/capability
        }else{
            console.log("IotDevice id does not match provided id");
        }
    }   
}

class IotDeviceDom extends IotDevice{
    constructor(pJsonObj){
        super(pJsonObj);

        this.dom = CDE('div', [['class', 'iot-device']]);
            this.domNameCtr = CDE('div', [['class','iot-dev-name-ctr']]);
                this.domName = CDE('span', [['class', 'iot-dev-name']]);
                    this.domName.innerText = this.name;
                this.domNameCtr.appendChild(this.domName);
            this.dom.appendChild(this.domNameCtr);

            this.domIdCtr = CDE('div', [['class','iot-dev-id-ctr']]);
                this.domId = CDE('div', [['class', 'iot-dev-id']]);
                    this.domId.innerText = `#${this.id}`;
                this.domIdCtr.appendChild(this.domId);
            this.dom.appendChild(this.domIdCtr);

            this.domConnectionStatusCtr = CDE('div', [['class', 'connection-status-ctr']]);
                this.domConnectionStatusCircle = CDE('div', [['class', 'connection-status-circle']]);
                    this.updateDomConnectionStatusCircle();
                this.domConnectionStatusCtr.appendChild(this.domConnectionStatusCircle);
                this.domConnectionStatus = CDE('div', [['class', 'connection-status']]);
                    this.updateDomConnectionStatusText();
                this.domConnectionStatusCtr.appendChild(this.domConnectionStatus);
            this.dom.appendChild(this.domConnectionStatusCtr);
    }
    updateDomConnectionStatusCircle(){
        if(this.isOnline){
            if(!this.domConnectionStatusCircle.classList.contains("online-connection-status-circle")){
                
                this.domConnectionStatusCircle.classList.add("online-connection-status-circle");
            }
        }else{
            this.domConnectionStatusCircle.classList.remove("online-connection-status-circle");
        }
    }
    updateDomConnectionStatusText(){
        if(this.isOnline){
            this.domConnectionStatus.innerText = 'online';
        }else{
            this.domConnectionStatus.innerText = 'offline';
        }
    }
    updateWithJsonObj(pJsonObj){
        // Update super-class
        super.updateWithJsonObj(pJsonObj);

        // Update graphical (according to changes made in superclass)
        this.updateDomConnectionStatusCircle();
        this.updateDomConnectionStatusText();
    }
}

let iotManager = new IotManager();
iotManager.getDevicesAsJsonObj(()=>{
    iotManager.displayAllDevices();
});

setInterval(()=>{iotManager.updateAllDevices(()=>{})}, 3000);