var mySqlPool = require("../controllers/connector/mysql-connecttion/mysql-connector");
var deviceUserInfor = require("../models/devices/device_user_info")

function getDeviceInforFromUser(deviceID) {
	return new Promise(function (resolve, reject) {
		var connection = false;
		mySqlPool.getConnection().then(
			function (conn) {
				connection = conn;
				//return connection;
			}
		).then(function (conn) {
			connection.beginTransaction(function (err) {
				if (err)
					return new Promise(function (resolve, reject) {
						console.log("start transaction Error: " + err);
						reject(err);
					});
			});
		}).then(function (conn) {
			//execute querry

			/* create 3 promise */
			var getDeviceInfo = new Promise(function (resolve, reject) {
				connection.query("Select * from device where id = ?", deviceID, function (err, results) {
					if (err) {
						connection.rollback(function () {
							console.log("querry getDeviceInfo Error: " + err);
							return reject(err);
						});
					} else {
						resolve(results);
					}
				});
			});

			var getDeviceMeasure = new Promise(function (resolve, reject) {
				connection.query("Select * from device_index where device_id = ?", deviceID, function (err, results) {
					if (err) {
						connection.rollback(function () {
							console.log("querry getDeviceMeasure Error: " + err);
							return reject(err);
						});
					} else {
						resolve(results);
					}
				});
			});

			var getListUser = new Promise(function (resolve, reject) {
				connection.query("Select patient_wears_device.patient_id, patient.name, " +
					"patient_wears_device.start_time, patient_wears_device.end_time " +
					"from patient_wears_device inner join patient " +
					"on patient.id=patient_wears_device.patient_id where device_id = ?", deviceID, function (err, results) {
						if (err) {
							connection.rollback(function () {
								console.log("querry getListUser Error: " + err);
								return reject(err);
							});
						} else {
							resolve(results);
						}
					});
			});

			/*execute query parallel */
			return new Promise(function (resolve, reject) {
				Promise.all([getDeviceInfo, getDeviceMeasure, getListUser]).then((values) => {
					console.log("promise all results list: " + JSON.stringify(values));
					var deviceInfo = values[0];
					var deviceIndex = values[1];
					var listUser = values[2];
					var finalResult = new deviceUserInfor(deviceID);

					finalResult.deviceType = deviceInfo[0].type;
					finalResult.warranty = deviceInfo[0].manufacture_date;

					deviceIndex.forEach(element => {
						finalResult.measures.push(element.name);
					});

					finalResult.listUsers = listUser;

					resolve(finalResult);
				}).catch((err) => reject(err));
			});

		}).then(function (finalResult) {
			resolve(finalResult);
		})
			.catch((err) => reject(err))
			.finally(function () {
				if (connection)
					connection.release();
			});
	});
}

function addDeviceFromUser(deviceID, userID) {
	return new Promise(function (resolve, reject) {
		var connection = false;
		mySqlPool.getConnection().then(
			function (conn) {
				connection = conn;
				//return connection;
			}
		).then(function (conn) {
			connection.beginTransaction(function (err) {
				if (err)
					return new Promise(function (resolve, reject) {
						console.log("start transaction Error: " + err);
						reject(err);
					});
			});
		}).then(() => {
			/* check valid deviceid */
			return new Promise(function (resolve, reject) {
				connection.query("select * from device where id = ?", deviceID, function (err, results) {
					if (err) {
						connection.rollback(function () {
							console.log("querry Error: " + err);
							return reject(err);
						});
					} else {
						if (results.length == 0) {
							var error = new Error();
							error.code = "DEVICE_NOT_EXIST";
							error.message = "Cannot found device have id: " + deviceID;
							return reject(error);
						}
						resolve("NEXT");
					}
				});
			});
		}).then(() => {
			/* check device using or not */
			return new Promise(function (resolve, reject) {
				connection.query("select * from patient_wears_device where device_id = ? and end_time is null", deviceID, function (err, results) {
					if (err) {
						connection.rollback(function () {
							console.log("querry Error: " + err);
							return reject(err);
						});
					} else {
						if (results.length > 0) {
							var error = new Error();
							error.code = "DEVICE_IS_BEING_USED";
							error.message = "Device: " + deviceID + " is being used! Cannot add";
							return reject(error);
						}
						resolve("NEXT");
					}
				});
			});
		}).then(() => {
			/* get next ID first*/
			return new Promise(function (resolve, reject) {
				var nextID = 1;
				connection.query("select max(id) as max from patient_wears_device", function (err, results) {
					if (err) {
						connection.rollback(function () {
							console.log("query Error: " + err);
							return reject(err);
						});
					} else {
						console.log("max ID: " + JSON.stringify(results[0]));
						if (results[0].max) {
							nextID = results[0].max + 1;
						}
						resolve(nextID);
					}
				});
			});
		}).then((results) => {
			/* insert */
			return new Promise(function (resolve, reject) {
				connection.query("insert into patient_wears_device (id, patient_id, device_id, start_time) VALUES(?,?,?,?)", [results, userID, deviceID, new Date()], function (err) {
					if (err) {
						connection.rollback(function () {
							console.log("query Error: " + err);
							return reject(err);
						});
					} else {
						resolve("SUCCESS");
					}
				});
			});
		}).then(function (finalResult) {
			connection.commit(function (err) {
				if (err) {
					console.log("commit error, rollback !!: ");
					connection.rollback(function () {
						return reject(err);
					});
				}
			});
			resolve(finalResult);
		}).catch((err) => reject(err)).finally(function () {
			if (connection)
				connection.release();
		});
	});
}

async function getDeviceIndex(deviceID) {
	var connection;
	var results;
	try {
		connection = await mySqlPool.getConnection();
		await new Promise((resolve, reject) => connection.beginTransaction(function (err) {
			if (err)
				reject(err);
			resolve();
		}));
		results = await new Promise((resolve, reject) =>
			connection.query("select device_index.name, device_index.measure, key_table.type from device_index join key_table on device_index.name = key_table.key where device_id=?", deviceID, function (err, results) {
				if (err) {
					reject(err);
				}
				else {
					resolve(results);
				}
			}));
	} catch (err) {
		throw err;
	} finally {
		if (connection)
			connection.release();
	}

	return results;
}

async function getAllDeviceList(userID) {
	var connection;
	var results;
	try {
		connection = await mySqlPool.getConnection();
		await new Promise((resolve, reject) => connection.beginTransaction(function (err) {
			if (err)
				reject(err);
			resolve();
		}));
		results = await new Promise((resolve, reject) =>
			connection.query("select distinct device_id from patient_wears_device where patient_id=?", userID, function (err, results) {
				if (err) {
					reject(err);
				}
				else {
					resolve(results);
				}
			}));

		for (var item of results) {
			var status = new Promise((resolve, reject) =>
				connection.query("select status from device where id=?", item.device_id, function (err, results) {
					if (err) {
						reject(err);
					}
					else {
						resolve(results);
					}
				}));

			var indexs = new Promise((resolve, reject) =>
				connection.query("select name, measure from device_index where device_id=?", item.device_id, function (err, results) {
					if (err) {
						reject(err);
					}
					else {
						resolve(results);
					}
				}));

			await Promise.all([status, indexs]).then((values) => {
				item.status = values[0];
				item.indexs = values[1];
			}).catch((err) => {
				console.log(err);
				throw err;
			});
		}

	} catch (err) {
		console.log("Error: " + err);
		throw err;
	} finally {
		if (connection)
			connection.release();
	}
	return results;
}


async function getAllDeviceUsingInTime(userID, index, startTime, endTime) {
	var connection;
	var results;
	try {
		connection = await mySqlPool.getConnection();
		await new Promise((resolve, reject) => connection.beginTransaction(function (err) {
			if (err)
				reject(err);
			resolve();
		}));
		results = await new Promise((resolve, reject) =>
			connection.query("select distinct patient_wears_device.device_id from patient_wears_device join device_index "
				+ "on device_index.device_id=patient_wears_device.device_id "
				+ "where patient_id=? and device_index.name=? and patient_wears_device.start_time>? "
				+ "and (patient_wears_device.end_time is null or patient_wears_device.end_time<?)", [userID, index, startTime, endTime], function (err, results) {
					if (err) {
						reject(err);
					}
					else {
						resolve(results);
					}
				}));
	} catch (err) {
		console.log("Error: " + err);
		throw err;
	} finally {
		if (connection)
			connection.release();
	}
	//console.log(JSON.stringify(results));
	return results;
}

/* Test Function */
//getDeviceInforFromUser(123);
//addDeviceFromUser(123, 20102450).then((res) => console.log(res)).catch((err) => console.log("ERROR: " + JSON.stringify(err)));
//getDeviceIndex(123);
//getAllDeviceList(20102450);
//getAllDeviceUsingInTime(20102450,'spo2','2018-10-20 00:00:00', '2019-12-12 00:00:00');

exports.getDeviceIndex = getDeviceIndex;
exports.getDeviceInforFromUser = getDeviceInforFromUser;
exports.addDeviceFromUser = addDeviceFromUser;
exports.getAllDeviceList = getAllDeviceList;
exports.getAllDeviceUsingInTime = getAllDeviceUsingInTime;