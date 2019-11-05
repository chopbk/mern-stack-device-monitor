var express = require('express');
var dataHandler = require('../../services/data_handler');

var router = express.Router();

/*get data realtime, base on device id and index */
/* return an object include current value*/
router.get('/getRealtimeData/', function (req, res) {
	/*if (!(req.session && req.session.logged_in)) {
			res.render('index', { title: 'Express' });
			return;
	}*/
	var deviceID = req.query.idDevice;
	var index = req.query.index;
	var patiendID = 20102450//get from session
	dataHandler.getRealtimeData(parseInt(patiendID), parseInt(deviceID), index)
		.then((result) => {
			if (!result)
				res.json("No data");
			else
				res.json(result.rows);
		})
		.catch((err) => console.log(err))
		.finally(() => {
			res.end();
		})
});

/*get history data, base on device id, index and time */
/* return a list */
router.get('/getHistoryData/', function (req, res) {
	/*if (!(req.session && req.session.logged_in)) {
			res.render('index', { title: 'Express' });
			return;
	}*/
	var listDeviceID = JSON.parse("[" + req.query.listDevice + "]");
	var index = req.query.index;
	var startTime = req.query.start;
	var endTime = req.query.end;
	if (!endTime)
		endTime = Date.now();
	var patiendID = 20102450//get from session
	dataHandler.getHistoryData(parseInt(patiendID), listDeviceID, index, parseInt(startTime), parseInt(endTime))
		.then((result) => {
			if (!result)
				res.json("No data");
			else
				res.json(result.rows);
		})
		.catch((err) => console.log(err))
		.finally(() => {
			res.end();
		});
});

/*get Agg data, base on , index and time */
/* return a list */
router.get('/getAggregateData/', function (req, res) {
	/*if (!(req.session && req.session.logged_in)) {
		res.render('index', { title: 'Express' });
		return;
	}*/
	var index = req.query.index;
	var startTime = req.query.start;
	var endTime = req.query.end;
	var table = req.query.type;
	if (!endTime)
		endTime = Date.now();
	var patiendID = 20102450//get from session

	dataHandler.getAggregateData(parseInt(patiendID), index, parseInt(startTime), parseInt(endTime), table)
		.then((result) => {
			if (!result)
				res.json("No data");
			else
				res.json(result.rows);
		})
		.catch((err) => console.log(err))
		.finally(() => {
			res.end();
		});
});


module.exports = router;