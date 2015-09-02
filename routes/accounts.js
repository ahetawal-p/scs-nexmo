var express = require('express');
var router = express.Router();
var jsforce = require('jsforce');
var memjs = require('memjs');
var storage = memjs.Client.create();

/* GET accounts page. */
router.get('/', function(req, res, next) {

	storage.get('sfdc_conn', function(err, conn){
		console.log("Connection is >> ");
		console.log(conn);
		if(conn){
			conn.query('SELECT id, name, (SELECT id, Subject FROM Cases) FROM Account LIMIT 10', function(err, result) {
			if (err) {
				 console.error(err);
				// res.redirect('/');
				return next(err);
			}
			res.render('accounts', {title: 'Accounts List', accounts: result.records});
			//res.redirect('http://ahetawal-wsl:6109/services/socialengagement/oauth?code=Bearer ' + conn.accessToken);
			});
		} else {
			res.send("Cannot find connection");
		}
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

