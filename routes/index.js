var express = require('express');
var router = express.Router();
var jsforce = require('jsforce');
var http = require("http");
var https = require("https");
var constants = require('../constants');

/* GET home page. */
router.get('/', function(req, res) {
	
	res.render('index');

});


/* GET home page. */
router.get('/inbound', function(req, res) {
	
	console.log("Inbound Request reached...");
	
	var data = {};
	data.userImg = req.query.user_img;
	data.userName = req.query.user_name;
	data.message = req.query.text;
	data.timestamp = req.query.message_timestamp;
	data.fromUserId = req.query.user_id;
	data.ottURI = req.query.from;
	data.messageId = req.query.message_id;
	data.messageType =req.query.type;

	console.log("Data Object is ");
	console.log(data);


	// data.timestamp = '123';
	// data.messageId = '12';
	// data.message = '123';
	

	// Send it to SFDC
	var postData = JSON.stringify({
	  'Name' : 'Hello World! @ ' +  data.timestamp,
	  'R6PostId' : data.messageId,
	  'Content' : data.message
	});

	
	var headerAuth = 'Bearer ' + constants.TOKEN_CONST;
	console.log("<<<< Header AUTH TO BE USED >>>>>> " + headerAuth);

	var options = {
	  hostname: 'na6.salesforce.com',
	  path: '/services/data/v34.0/sobjects/socialpost',
	  method: 'POST',
	  headers: {
	    'Content-Type': 'application/json',
	    'Authorization': headerAuth
	  }
	};

	var sfdcReq = https.request(options, function(sfdcRes) {
	  	console.log('STATUS: ' + sfdcRes.statusCode);
	 	if(sfdcRes.statusCode == 201){
	 		
		    console.log("Making outbound call");
			var outBoundMessage = "Hello " + data.userName;
			outBoundMessage += " Why are you asking me " + data.message + " ?";
			var baseQuery = 'https://api.nexmo.com/ott/poc/chat/json?api_key=7a403ebf&api_secret=43b9ec8c&type=text&to=';
			baseQuery+=data.ottURI + '&text=' + outBoundMessage;
			
			
			console.log("Base query is : " + baseQuery);

			https.get(baseQuery, function(res1) {
		  		res1.on("data", function(chunk) {
		    		console.log("BODY: " + chunk);
		    		res.end();
		    	});
			
			}).on('error', function(e) {
		  			console.log("Got error: " + e.message);
			});

		 } else {
		 	res.end();
		 }

	 	sfdcRes.on('data', function (chunk) {
	    	console.log('Posted Data to SFDC' + chunk);
	  	});

	});

	sfdcReq.on('error', function(e) {
	  console.log('problem with SFDC request: ' + e.message);
	});

	// write data to request body
	sfdcReq.write(postData);
	sfdcReq.end();


});



/* GET home page. */
router.get('/delivery', function(req, res) {
	console.log("Delivery receipt received..");
	var delivery = {};
	delivery.messageRecepient = req.query.to;
	delivery.messageId = req.query.message_id;
	delivery.status = req.query.status;
	delivery.statusInfo = req.query.status_info;
	delivery.messageTimestamp = req.query.message_timestamp;

	console.log("Delivery Object is ");
	console.log(delivery);

	res.sendStatus(200);


});


router.post('/',function(req,res){
	var clientId=req.body.clientId;
	var secret=req.body.secret;

	// Local DEV ORG
	//var clientId='3MVG9AOp4kbriZOLjMhf4yQit9g7Gvhre508HErmJVGWZK9wRQOKPXk75ap.PGk4By1lTXx4QNO6PKC9GBWlJ';
	//var secret='8915655022077478930';
	
	var clientId = process.env.CLIENT_KEY || '3MVG9sG9Z3Q1Rlbf6ERG76nkgAxCKOLBRlxOWmTfbjFKdX3c3xM_vbnjxw6OHNeGUpdHpwLYvqPUCJTSiNSA_';
	var secret = process.env.CLIENT_SECRET || '3631655814888186810';

	req.session.clientId = clientId;
	req.session.secret = secret;

	console.error(clientId + ' ' + secret);

	var oauth2 = new jsforce.OAuth2({
		clientId: clientId,
		clientSecret: secret,
		redirectUri: process.env.redirect_url || 'http://localhost:3000/accounts',
		loginUrl : process.env.login_url || 'http://ahetawal-wsl:6109'
	});
	res.redirect(oauth2.getAuthorizationUrl({scope: 'api'}));
});

module.exports = router;
