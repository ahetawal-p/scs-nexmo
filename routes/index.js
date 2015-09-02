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
	

	var conn = constants.SFDC_CONN;

	// Send it to SFDC
	var postData = JSON.stringify({
	  'Name' : 'Hello World! @ ' +  data.timestamp,
	  'R6PostId' : data.messageId,
	  'Content' : data.message
	});

	conn.sobject("socialpost").create(postData, function(err, result) {
			console.log("Resposne received from Salesforce....")
			if (err || !result.success) { 
				console.error(err, result);
				res.end();
			} else {
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
			}
			
		});
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

router.get('/oauth2/auth',function(req,res){
	
	var localOAuth2 = req.app.get('oAuth2');
	console.log("OAuth Object is >> ");
	console.log(localOAuth2);
	res.redirect(localOAuth2.getAuthorizationUrl({scope: 'api refresh_token'}));
});


router.get('/oauth2/callback',function(req,res){
	
	var localOAuth2 = req.app.get('oAuth2');

	var conn = new jsforce.Connection({oauth2: localOAuth2, logLevel:'INFO'});
	conn.authorize(req.query.code, function(err, userInfo) {
		if (err) {
			console.error(err);
			return next(err);
		}
	console.log("Access token: " + conn.accessToken);
	console.log("Refresh token: " + conn.refreshToken);
	console.log("Instance Url: " + conn.instanceUrl);

	req.app.set('accessToken', conn.accessToken);
	req.app.set('refreshToken', conn.refreshToken);
	req.app.set('instanceUrl', conn.instanceUrl);
	
	constants.SFDC_CONN = setupSalesforceConnection(req);
	
	res.redirect('/accounts');	
	});

});


function setupSalesforceConnection(req){

	var localOAuth2 = req.app.get('oAuth2');

	var accessToken = req.app.get('accessToken');
	var refreshToken = req.app.get('refreshToken');
	var instanceUrl = req.app.get('instanceUrl');
	var localOAuth2 = req.app.get('oAuth2');
	constants.TOKEN_CONST = accessToken;


	var conn = new jsforce.Connection({
					oauth2 : localOAuth2,
  					instanceUrl : instanceUrl,
  					accessToken : accessToken,
  					refreshToken : refreshToken,
  					logLevel:'DEBUG'
				});
	
	conn.on("refresh", function(accessToken, res) {
			console.log("<<<<< Access Token Refreshed >>>");
			console.log("Refresh token : " + res.refresh_token);
			console.log("Instance url : " + res.instance_url);
			
			req.app.set('accessToken', accessToken);
			req.app.set('refreshToken', res.refresh_token);
			req.app.set('instanceUrl', res.instance_url);
			constants.TOKEN_CONST = accessToken;

	});
	return conn;

}

function sampleHttpCallToSFDC() {
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
