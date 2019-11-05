var mysql = require('mysql');
var bcrypt = require('bcrypt');
var uuid = require('node-uuid');
var config = require('../../../config/local.config')
var async = require('async');


var conn_props = config.config.db_config;

function db(callback) {

	var connection = mysql.createConnection({
		host: conn_props.host,
		user: conn_props.user,
		password: conn_props.password,
		database: conn_props.db
	});
	callback(null, connection);
}

var connectionPool = mysql.createPool({
	connectionLimit: 10,
	host: conn_props.host,
	user: conn_props.user,
	password: conn_props.password,
	database: conn_props.db
});

exports.getConnection = function () {
	return new Promise(function (resolve, reject) {
		connectionPool.getConnection(function (err, connection) {
			if (err)
				return reject(err);
			resolve(connection);
		});
	});
}


/*Waterfall test */
exports.register = function (email, name, pwd, callback) {
	var dbc;
	var userid;
	async.waterfall([
		function (cb) {
			//verify email, pwd
			console.log('waterfall 1 ');
		},
		function (cb) {//connect DB
			db(cb);
			console.log('waterfall 1.5 ');
		},
		function (dbclient, cb) { //hash
			dbc = dbclient;
			bcrypt.hash(pwd, 10, cb);
			console.log('waterfall 2 ');
		},
		function (hash, cb) {
			userid = uuid();
			dbc.query("INSERT INTO users VALUES(?,?,?,?,UNIX_TIMESTAMP(),NULL,0)", [userid, email, name, hash], cb);
			console.log('waterfall 3 ');
		},
		function (results, fields, cb) {
			exports.user_by_uuid(userid, cb);
			console.log('waterfall 4 ');
		}
	],
		function (err, user_data) {
			console.log('waterfall END ');
			if (dbc) dbc.end();
			if (err) {
				callback(err);
			} else {
				callback(null, user_data);
			}
		});
}