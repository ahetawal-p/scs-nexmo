var express = require('express');
var router = express.Router();
var jsforce = require('jsforce');
var http = require("http");
var https = require("https");

/* GET home page. */
router.get('/', function(req, res) {
	
	res.render('index');

});


/* GET home page. */
router.get('/inbound', function(req, res) {
	
	//res.render('index');

	console.log("Inbound Request reached...");
	//console.log(req.query.test);

	var data = {};
	data.userName = req.query.user_name;
	data.message = req.query.text;
	data.timestamp = req.query.message_timestamp;
	data.fromUserId = req.query.user_id;
	data.ottURI = req.query.from;
	data.messageId = req.query.message_id;
	data.messageType =req.query.type;

	console.log("Data Object is ");
	console.log(data);

<<<<<<< .merge_file_wkHypg

	// Send it to SFDC
	var postData = JSON.stringify({
	  'Name' : 'Hello World!',
	  'R6PostId' : data.messageId,
	  'Content' : data.message
	});

	var options = {
	  hostname: 'na6.salesforce.com',
	  port: 80,
	  path: '/services/data/v34.0/sobjects/socialpost',
	  method: 'POST',
	  headers: {
	    'Content-Type': 'application/json',
	    'Authorization': 'Bearer 00D80000000PUfv!ARQAQBoCxrdaDpOIx09tn7GS0.7gGAABkpe_GCTpa3MSWATexqHBq5a2YXUlrN0crYFBIVqsBN1ZkF1_uR21tOlsSwtIdtJD'
	  }
	};

	var sfdcReq = https.request(options, function(sfdcRes) {
	  console.log('STATUS: ' + sfdcRes.statusCode);
	  sfdcRes.setEncoding('utf8');
	  sfdcRes.on('data', function (chunk) {
	    
	    console.log('Posted Data to SFDC' + chunk);

	    console.log("Making outbound call");
		var outBoundMessage = "Hello " + data.userName;
		var baseQuery = 'https://api.nexmo.com/ott/poc/chat/json?api_key=7a403ebf&api_secret=43b9ec8c&type=text&to=';
		baseQuery+=data.ottURI + '&text=' + outBoundMessage;
		
		//baseQuery = 'https://api.nexmo.com/ott/poc/chat/json?api_key=7a403ebf&api_secret=43b9ec8c&to=ott:wechat:oGBOUxCRgfs6ECuAxP1yaym2QCWs&type=text&text=Test_Resposne';

		console.log("Base query is : " + baseQuery);




		https.get(baseQuery, function(res1) {
	  		res1.on("data", function(chunk) {
	    		console.log("BODY: " + chunk);
	    		res.set('Content-Type', 'text/html');
				res.send(new Buffer(chunk));
	  		});
		
		}).on('error', function(e) {
	  			console.log("Got error: " + e.message);
		});

	  });

=======
	console.log("Making outbound call");
	var outBoundMessage = "Hello " + data.userName + "!!";
	outBoundMessage += " Why are you asking me " + data.message + " ?";
	var baseQuery = 'https://api.nexmo.com/ott/poc/chat/json?api_key=7a403ebf&api_secret=43b9ec8c&type=text&to=';
	baseQuery+=data.ottURI + '&text=' + outBoundMessage;
	
	console.log("Base query is : " + baseQuery);
>>>>>>> .merge_file_6JSJJK

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

	

	var clientId = '3MVG9sG9Z3Q1Rlbf6ERG76nkgAxCKOLBRlxOWmTfbjFKdX3c3xM_vbnjxw6OHNeGUpdHpwLYvqPUCJTSiNSA_';
	var secret = '3631655814888186810';

	req.session.clientId = clientId;
	req.session.secret = secret;

	console.error(clientId + ' ' + secret);

	var oauth2 = new jsforce.OAuth2({
		clientId: clientId,
		clientSecret: secret,
		redirectUri: process.env.redirect_url || 'http://localhost:3000/accounts',
		loginUrl : 'https://login.salesforce.com'
		//loginUrl : 'http://ahetawal-wsl:6109'
	});
	res.redirect(oauth2.getAuthorizationUrl({scope: 'api'}));
});

module.exports = router;
