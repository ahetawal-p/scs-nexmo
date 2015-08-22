var express = require('express');
var router = express.Router();
var jsforce = require('jsforce');

/* GET home page. */
router.get('/', function(req, res) {
	
	res.render('index');

	//console.log("Request is >>> ");
	
	//console.log(req);
	

	// // Local DEV ORG
	// var clientId='3MVG9AOp4kbriZOLjMhf4yQit9g7Gvhre508HErmJVGWZK9wRQOKPXk75ap.PGk4By1lTXx4QNO6PKC9GBWlJ';
	// var secret='8915655022077478930';

	// // PROD DEV Org
	// //var clientId = '3MVG9sG9Z3Q1Rlbf6ERG76nkgAxCKOLBRlxOWmTfbjFKdX3c3xM_vbnjxw6OHNeGUpdHpwLYvqPUCJTSiNSA_';
	// //var secret = '3631655814888186810';

	// req.session.clientId = clientId;
	// req.session.secret = secret;

	// console.error(clientId + ' ' + secret);

	// var oauth2 = new jsforce.OAuth2({
	// 	clientId: clientId,
	// 	clientSecret: secret,
	// 	redirectUri: process.env.redirect_url || 'http://localhost:3000/accounts',
	// 	//loginUrl : 'https://login.salesforce.com'
	// 	loginUrl : 'http://ahetawal-wsl:6109'
	// });
	// res.redirect(oauth2.getAuthorizationUrl({scope: 'api'}));



});

/* GET home page. */
router.get('/inbound', function(req, res) {
	
	res.render('index');

	console.log("Inbound Request reached...");
	//console.log(req.query.test);

	var data = {};
	data.userName = req.query.user_name;
	data.message = req.query.text;
	data.timestamp = req.query.message_timestamp;
	data.fromUserId = req.query.user_id;
	data.ottURI = req.query.from;

	console.log("Data Object is ");
	console.log(data);

});



router.post('/',function(req,res){
	var clientId=req.body.clientId;
	var secret=req.body.secret;

	// Local DEV ORG
	var clientId='3MVG9AOp4kbriZOLjMhf4yQit9g7Gvhre508HErmJVGWZK9wRQOKPXk75ap.PGk4By1lTXx4QNO6PKC9GBWlJ';
	var secret='8915655022077478930';

	// PROD DEV Org
	//var clientId='3MVG9AOp4kbriZOLjMhf4yQit9qFjRTs5WINg76XtjozpoDdKFz7F7.Tj8TixrkAFytpzRFRD4eKQircBif3Q';
	//var secret= '5797889978287280572';


	//var clientId = '3MVG9sG9Z3Q1Rlbf6ERG76nkgAxCKOLBRlxOWmTfbjFKdX3c3xM_vbnjxw6OHNeGUpdHpwLYvqPUCJTSiNSA_';
	//var secret = '3631655814888186810';

	req.session.clientId = clientId;
	req.session.secret = secret;

	console.error(clientId + ' ' + secret);

	var oauth2 = new jsforce.OAuth2({
		clientId: clientId,
		clientSecret: secret,
		redirectUri: process.env.redirect_url || 'http://localhost:3000/accounts',
		//loginUrl : 'https://login.salesforce.com'
		loginUrl : 'http://ahetawal-wsl:6109'
	});
	res.redirect(oauth2.getAuthorizationUrl({scope: 'api'}));
});

module.exports = router;
