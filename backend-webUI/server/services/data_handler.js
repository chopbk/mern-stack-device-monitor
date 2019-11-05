var mySqlPool = require("../controllers/connector/mysql-connecttion/mysql-connector");
var cassandraClient = require("../controllers/connector/cassandra-connection/cassandra-connection");


async function getRealtimeData(patientID, deviceID, index) {
	var result = await cassandraClient.executeQuery("select value,timestamp from current_table where patient_id=? and device_id=? and key=? order by device_id asc, key asc, timestamp desc limit 1", [patientID, deviceID, index])
		.then((result) => {
			return result;
			//throw new Error("123123123123123");
		})
		.catch((err) => { console.log(err) })
		.finally();
	return result;
}

async function getHistoryData(patiendID, listDeviceID, index, startTime, endTime) {
	var result = await cassandraClient.executeQuery("select value, timestamp from current_table where patient_id=? and device_id IN ? and key=? and timestamp > ? and timestamp < ? order by device_id asc, key asc, timestamp desc",
		[patiendID, listDeviceID, index, startTime, endTime])
		.then((result) => {
			return result;
			//throw new Error("123123123123123");
		})
		.catch((err) => { console.log(err) })
		.finally();
	//console.log(JSON.stringify(result));
	return result;
}

async function getAggregateData(patiendID, index, startTime, endTime, table) {
	var result = await cassandraClient.executeQuery("select value, time_display from avg_by_" + table + " where patient_id=? and key=? and timestamp > ? and timestamp < ? order by key asc, timestamp desc limit 30",
		[patiendID, index, startTime, endTime])
		.then((result) => {
			return result;
			//throw new Error("123123123123123");
		})
		.catch((err) => { console.log(err) })
		.finally();
	//console.log(JSON.stringify(result));
	return result;
}

/* Test Function */
//getRealtimeData(20102450, 123, "heart rate")
//getHistoryData(20102450,[132,123],'heart rate', 1571798370000,1571798390000);


exports.getRealtimeData = getRealtimeData;
exports.getHistoryData = getHistoryData;
exports.getAggregateData = getAggregateData;