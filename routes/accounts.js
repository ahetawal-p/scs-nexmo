var express = require('express');
var router = express.Router();
var jsforce = require('jsforce');
var constants = require('../constants');

/* GET accounts page. */
router.get('/', function(req, res, next) {
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

	console.log("<<<< Access Token >>>>>> " + constants.TOKEN_CONST);

		conn.query('SELECT id, name, (SELECT id, Subject FROM Cases) FROM Account LIMIT 10', function(err, result) {
			if (err) {
				 console.error(err);
				// res.redirect('/');
				return next(err);
			}
			res.render('accounts', {title: 'Accounts List', accounts: result.records});
			//res.redirect('http://ahetawal-wsl:6109/services/socialengagement/oauth?code=Bearer ' + conn.accessToken);
		});
	
});

module.exports = router;



// SEE MY REQ >>>>>>>>
// { domain: null,
//   _events: { error: [Function], complete: [Function], pipe: [Function] },
//   _maxListeners: undefined,
//   callback: [Function],
//   headers: 
//    { Authorization: 'Bearer 00Dxx0000001gGh!ARwAQOpdBbOh460NjCkDsgje8QySeHu0xKGliQNoW3va09wIv.y0GbnxRQgxQk8fbf53E1e.csRNQOlMKqzw.4qFgAiMb7A3',
//      host: 'ahetawal-wsl:6109' },
//   method: 'GET',
//   followAllRedirects: true,
//   readable: true,
//   writable: true,
//   explicitMethod: true,

// TO RUN : DEBUG=express:* iron-node ./bin/www

