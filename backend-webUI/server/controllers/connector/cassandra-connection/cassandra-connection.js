const cassandra = require('cassandra-driver');
var config = require('../../../config/local.config')
var conn_props = config.config.cassandraConfig;
const client = new cassandra.Client({
	contactPoints: conn_props.contactPoints,
	authProvider: new cassandra.auth.PlainTextAuthProvider(conn_props.user, conn_props.password),
	keyspace: conn_props.keyspace,
	localDataCenter: conn_props.localDataCenter
});

async function executeQuery(query, args) {
	var results = client.execute(query, args,{ prepare : true })
		.then(function (results) {
			return results;
		})
		.catch(function (err) {
			throw err;
		});
	return results;
}

exports.executeQuery = executeQuery;
//exports.client = client;