var express = require('express');
var router = express.Router();
var jsforce = require('jsforce');
var http = require("http");
var https = require("https");

var util = require('../constants');


var memjs = require('memjs');
var storage = memjs.Client.create();

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

	var dateObj = new Date(data.timestamp);
	var isoDate = dateObj.toISOString();

	console.log("Data Object is ");
	console.log(data);
	console.log(isoDate);
	
	var brandMessage = "Welcome to Hackathon !! ";
	brandMessage+= "Get ready for the crazy ideas. \n Please use #question for any queries on the hack you will see.";

	console.log("Brand message is : " + brandMessage);

	storage.get('oAuthData', function(err, authData){
		console.log("Auth Data is >> " + authData);
		if(authData){
			var conn = util.getConnection(authData, req.app.get('oAuth2'));

			// Send it to SFDC
			var postData = {
			  'username' 	: data.userName,
			  'userId' 		: data.fromUserId,
			  'message' 	: data.message,
			  'timestamp' 	: isoDate,
			  'messageId'	: data.messageId,
			  'messageType' : data.messageType,
			  'userImg' 	: data.userImg,
			  'ottUri' 		: data.ottURI
			}

			conn.apex.post("/testAmit/chat", postData, function(err, result) {
					console.log("Response received from Salesforce....");
					if (err || !result.success) { 
						console.log("In Error part");
						console.error(err, result);
						res.end();
					} else if(data.message == 'subscribe' && data.messageType == 'event'){
						console.log("This is a subscribe message ....");
						var outBoundMessage = "Hey " + data.userName + "... ";
						outBoundMessage += brandMessage;
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
						console.log("IN Final else");
						res.end();
					}
					console.log("Response received from Salesforce.... END...");
				});
		} else {
			console.log(err);
			res.send("Cannot find connection");
		}
	})
});









/* ORIGINAL CALL GET home page. */
// router.get('/inbound', function(req, res) {
	
// 	console.log("Inbound Request reached...");
	
// 	var data = {};
// 	data.userImg = req.query.user_img;
// 	data.userName = req.query.user_name;
// 	data.message = req.query.text;
// 	data.timestamp = req.query.message_timestamp;
// 	data.fromUserId = req.query.user_id;
// 	data.ottURI = req.query.from;
// 	data.messageId = req.query.message_id;
// 	data.messageType =req.query.type;

// 	console.log("Data Object is ");
// 	console.log(data);


// 	// data.timestamp = '123';
// 	// data.messageId = '12';
// 	// data.message = '123';
	

// 	storage.get('oAuthData', function(err, authData){
// 		console.log("Auth Data is >> " + authData);
// 		if(authData){
// 			var conn = util.getConnection(authData, req.app.get('oAuth2'));

// 			// Send it to SFDC
// 			var postData = {
// 			  'Name' : 'Hello World! @ ' +  data.timestamp,
// 			  'R6PostId' : data.messageId,
// 			  'Content' : data.message
// 			}

// 			conn.sobject("socialpost").create(postData, function(err, result) {
// 					console.log("Resposne received from Salesforce....")
// 					if (err || !result.success) { 
// 						console.error(err, result);
// 						res.end();
// 					} else {
// 						console.log("Making outbound call");
// 						var outBoundMessage = "Hello " + data.userName;
// 						outBoundMessage += " Why are you asking me " + data.message + " ?";
// 						var baseQuery = 'https://api.nexmo.com/ott/poc/chat/json?api_key=7a403ebf&api_secret=43b9ec8c&type=text&to=';
// 						baseQuery+=data.ottURI + '&text=' + outBoundMessage;
// 						console.log("Base query is : " + baseQuery);

// 						https.get(baseQuery, function(res1) {
// 					  		res1.on("data", function(chunk) {
// 					    		console.log("BODY: " + chunk);
// 					    		res.end();
// 					    	});
						
// 						}).on('error', function(e) {
// 					  			console.log("Got error: " + e.message);
// 						});
// 					}
					
// 				});

// 		} else {
// 			console.log(err);
// 			res.send("Cannot find connection");
// 		}
// 	})
	
	
// });



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

router.get('/oauth2/auth',function(req,res){
	
	var localOAuth2 = req.app.get('oAuth2');
	console.log("OAuth Object is >> ");
	console.log(localOAuth2);
	res.redirect(localOAuth2.getAuthorizationUrl({scope: 'api refresh_token'}));
});


router.get('/oauth2/callback',function(req,res){
	
	var localOAuth2 = req.app.get('oAuth2');
	var oAuthData = {};


	var conn = new jsforce.Connection({oauth2: localOAuth2, logLevel:'INFO'});
	conn.authorize(req.query.code, function(err, userInfo) {
		if (err) {
			console.error(err);
			return next(err);
		}
	console.log("Access token: " + conn.accessToken);
	console.log("Refresh token: " + conn.refreshToken);
	console.log("Instance Url: " + conn.instanceUrl);

	oAuthData['accessToken'] = conn.accessToken;
	oAuthData['refreshToken'] = conn.refreshToken;
	oAuthData['instanceUrl'] = conn.instanceUrl;
	
	console.log('Setting data in memchache...');
	storage.set('oAuthData', JSON.stringify(oAuthData));

	res.redirect('/accounts');	
	});

});


function sampleHttpCallToSFDC() {
	// var postData = JSON.stringify({
	//   'Name' : 'Hello World! @ ' +  data.timestamp,
	//   'R6PostId' : data.messageId,
	//   'Content' : data.message
	// });
	// var headerAuth = 'Bearer ' + constants.TOKEN_CONST;
	// console.log("<<<< Header AUTH TO BE USED >>>>>> " + headerAuth);

	// var options = {
	//   hostname: 'na6.salesforce.com',
	//   path: '/services/data/v34.0/sobjects/socialpost',
	//   method: 'POST',
	//   headers: {
	//     'Content-Type': 'application/json',
	//     'Authorization': headerAuth
	//   }
	// };

	// var sfdcReq = https.request(options, function(sfdcRes) {
	//   	console.log('STATUS: ' + sfdcRes.statusCode);
	//  	if(sfdcRes.statusCode == 201){
	 		
	// 	    console.log("Making outbound call");
	// 		var outBoundMessage = "Hello " + data.userName;
	// 		outBoundMessage += " Why are you asking me " + data.message + " ?";
	// 		var baseQuery = 'https://api.nexmo.com/ott/poc/chat/json?api_key=7a403ebf&api_secret=43b9ec8c&type=text&to=';
	// 		baseQuery+=data.ottURI + '&text=' + outBoundMessage;
			
			
	// 		console.log("Base query is : " + baseQuery);

	// 		https.get(baseQuery, function(res1) {
	// 	  		res1.on("data", function(chunk) {
	// 	    		console.log("BODY: " + chunk);
	// 	    		res.end();
	// 	    	});
			
	// 		}).on('error', function(e) {
	// 	  			console.log("Got error: " + e.message);
	// 		});

	// 	 } else {
	// 	 	res.end();
	// 	 }

	//  	sfdcRes.on('data', function (chunk) {
	//     	console.log('Posted Data to SFDC' + chunk);
	//   	});

	// });

	// sfdcReq.on('error', function(e) {
	//   console.log('problem with SFDC request: ' + e.message);
	// });

	// // write data to request body
	// sfdcReq.write(postData);
	// sfdcReq.end();
}


module.exports = router;
