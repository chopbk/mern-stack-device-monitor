class DeviceUserInfo {
	constructor(deviceId) {
		this.deviceId = deviceId;
		this.deviceType = "no def";
		this.warranty = "no def";
		this.description = "no def";
		this.listUsers = [];//userid + start + stoptime
		this.measures = [];//list index device can measure
	}
}

module.exports = DeviceUserInfo;