const { getNameFromCache, putUserIDOnCache } = require('./cache');

var catalyst = require('zcatalyst-sdk-node');
const fs = require('fs');

//3party
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

const express = require('express');
const expressApp = express();

expressApp.use(cookieParser());
expressApp.use(bodyParser.urlencoded({ extended: true }));
expressApp.use(bodyParser.json());

var userID;

expressApp.get('/', (req, res) => {
	let app = catalyst.initialize(req);
	let zcql = app.zcql();

	let selectedPosts = [];//send Variable

	//10 POSTS using CHANNELID order by CREATEDTIME desc
	let query1 = `SELECT GroupId, ChannelId FROM GroupsChannels`;
	// let query2 = `SELECT ROWID, ChannelName, ChannelID FROM Channels WHERE ChannelId = ${req.params.channelId}`;
	zcql.executeZCQLQuery(query1).then((gc) => {
		console.log(gc)
	});

	// console.log(Date.get())
	res.send('ok');
});

expressApp.post('/signup', (req, res) => {
	var app = catalyst.initialize(req);

	//CONFIG VARIABLE
	let userManagement = app.userManagement();
	const signupConfig = {
		platform_type: 'web',
		zaid: 50010626049
	}
	const { Email, UserName, Password } = req.body;
	const userConfig = {
		last_name: UserName,
		email_id: Email,
		role_id: '2213000000015160'
	}

	let registerPromise = userManagement.registerUser(signupConfig, userConfig);
	registerPromise.then(user => {
		// DTASTORE
		//UserID DataStore
		const userDetails = { UserName, Email, Password, UserId: user.user_details.zuid };
		let UserID = app.datastore().table('2213000000015192');//UserID TABLE
		let insertPromise = UserID.insertRow(userDetails);
		console.log(userDetails)

		insertPromise.then((user) => {
			// CAHCHE
			// Store in the cache
			console.log('Cache')
			let cache = app.cache();
			let segment = cache.segment('2213000000023001');
			putUserIDOnCache(segment, user.ROWID);

			res.status(201).send('added');
		}).catch((err) => {
			console.log(err)
			res.sendStatus(500)
		});
	}
	).catch((err) => {
		console.log(err)
		res.sendStatus(500)
	});
});


//=======================POSTS======================

//Post GET using CHANNELID 
expressApp.get('/posts/:channelId', (req, res) => {
	let app = catalyst.initialize(req);
	let zcql = app.zcql();

	let selectedPosts = [];//send Variable

	//10 POSTS using CHANNELID order by CREATEDTIME desc
	let query = `SELECT Title,Description,Image,ROWID,CREATEDTIME FromUser FROM Posts WHERE ChannelId = ${req.params.channelId} ORDER BY CREATEDTIME DESC LIMIT 10`;
	zcql.executeZCQLQuery(query).then((result) => {

		selectedPosts = result;

		return res.status(200).json({
			'status': '200',
			'channelId': req.params.channelId,
			'data': selectedPosts,
		});
	}).catch((err) => {

		console.log(err)

		return res.sendStatus(500).json({ 'status': '500', 'error': err })
	});
});

//Post POST
expressApp.post('/posts/:channelId', (req, res) => {
	let app = catalyst.initialize(req);
	let Posts = app.datastore().table('Posts');

	const { Title, Description, FromUser } = req.body;
	const ChannelId = req.params.channelId;
	// let dt = new Date();//DATE PREREQUEST
	// const DateTime = dt.getFullYear() + '-' + dt.getMonth() + '-' + dt.getDate() + ' ' + dt.getHours() + ':' + dt.getMinutes() + ':' + dt.getSeconds();

	var postConfig = {
		Title, Description, FromUser, ChannelId
	}

	console.log(postConfig);

	Posts.insertRow(postConfig).then((suc) => {
		console.log(suc);
		return res.status(200).send('Posted');
	}).catch((err) => {
		console.log(err);
		return res.status(500).send('Not Posted');
	})
});

module.exports = expressApp;
