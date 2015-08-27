var express = require('express');
var router = express.Router();
var jsforce = require('jsforce');
var constants = require('../constants');

/* GET accounts page. */
router.get('/', function(req, res, next) {
	var oauth2 = new jsforce.OAuth2({
		clientId: req.session.clientId,
		clientSecret: req.session.secret,
		redirectUri: process.env.redirect_url || 'http://localhost:3000/accounts',
		loginUrl : process.env.login_url || 'http://ahetawal-wsl:6109'
	});

	var conn = new jsforce.Connection({oauth2: oauth2, logLevel:'INFO'});
	debugger;
	conn.authorize(req.query.code, function(err, userInfo) {
		if (err) {
			console.error(err);
			return next(err);
		}
		req.session.accessToken = conn.accessToken;
		req.session.instanceUrl = conn.instanceUrl;
		
		constants.TOKEN_CONST = conn.accessToken;
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

