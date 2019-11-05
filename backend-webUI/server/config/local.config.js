exports.config = {
	db_config: {
		host: "10.55.123.60",
		/* user: "tuanvd10",
		password: "abc13579",
		db: "PhotoAlbums", */
		user: "admin",
		password: "Vht@12345",
		db: "pm_metadata",
		poolSize: 20
	},
	static_content: "../static",
	cassandraConfig :{
		contactPoints: ['10.55.123.52:9042', '10.55.123.59:9042'],
		keyspace: 'hdfs_test',
		localDataCenter: 'dc2',
		user: "webui",
		password: "abc13579"
	}

};
