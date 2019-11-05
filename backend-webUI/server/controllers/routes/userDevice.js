/*action relate device of user: add/remove/get info */

var express = require('express');
var deviceHandler = require('../../services/device_handler');

var router = express.Router();

router.get('/getDeviceInfo/:idDevice', function (req, res) {
	/*if (!(req.session && req.session.logged_in)) {
		res.render('index', { title: 'Express' });
		return;
	}*/
	var deviceID = req.params.idDevice;
	deviceHandler.getDeviceInforFromUser(deviceID)
		.then((result) => console.log("Final Result:" + JSON.stringify(result)))
		.catch((err) => console.log("Err userDevice:" + err))
		.finally(res.end());
});

/* data format:
	{
		deviceID: 123456
	}
*/

router.post('/addnewdevice', function (req, res) {
	var userID;
	if (!(req.session && req.session.logged_in)) {
		res.render('index', { title: 'Express' });
		return;
	} else {
		userID = req.session.logged_in;
	}

	var deviceID = req.body.deviceID;

	/* validate input */

	deviceHandler.addDeviceFromUser(deviceID, userID)
		.then((result) => console.log("Final Result:" + JSON.stringify(result)))
		.catch((err) => console.log("Err:" + err))
		.finally(res.end());
});

/* get list index device can measure, for realtime data checking*/
router.get('/getDeviceInfo/getIndexOfDevice/:idDevice', function (req, res) {
	var deviceID = req.params.idDevice;
	deviceHandler.getDeviceIndex(deviceID)
		.then((result) => console.log("Final Result:" + JSON.stringify(result)))
		.catch((err) => console.log("Err:" + err))
		.finally(res.end());
});

/*get list device, show in dashboard */
router.get('/getListDeviceOfUser/', function (req, res) {
	var userID = req.query.userID;//get userID from session
	console.log(userID);
	deviceHandler.getAllDeviceList(userID)
		.then((result) => {
			console.log(JSON.stringify(result));
			res.status(200);
			res.end(JSON.stringify(result));
		})
		.catch((err) => console.log("Err:" + err))
		.finally();
});

/*get list device user using in time*/
router.get('/getListDeviceUsingIntime/', function (req, res) {
	var userID = '20102450';//get userID from session
	var startTime = req.query.start;
	var endTime = req.query.end;
	var index = req.query.index
	deviceHandler.getAllDeviceUsingInTime(userID, index, startTime, endTime)
		.then((result) => res.end(JSON.stringify(result)))
		.catch((err) => console.log("Err:" + err))
		.finally();
});

module.exports = router;
