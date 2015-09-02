var memjs = require('memjs');
var storage = memjs.Client.create();
var jsforce = require('jsforce');

var createConnection = function(oAuthData, localOAuth2) {

	var parsedOAuthdata = JSON.parse(oAuthData);
	console.log('Parsed memchache data ' + parsedOAuthdata);
	

	var conn = new jsforce.Connection({
					oauth2 : localOAuth2,
  					instanceUrl : parsedOAuthdata.instanceUrl,
  					accessToken : parsedOAuthdata.accessToken,
  					refreshToken : parsedOAuthdata.refreshToken,
  					logLevel:'DEBUG'
				});
	
	conn.on("refresh", function(accessToken, res) {
			
		console.log("<<<<< Access Token Refreshed >>>");
		console.log("Refresh token : " + res.refresh_token);
		console.log("Instance url : " + res.instance_url);

		var oAuthData = {};
		oAuthData['accessToken'] = conn.accessToken;
		oAuthData['refreshToken'] = conn.refreshToken;
		oAuthData['instanceUrl'] = conn.instanceUrl;

		console.log('Setting data in memchache...');
		storage.set('oAuthData', JSON.stringify(oAuthData));

	});	

	return conn;

}


module.exports = {
    getConnection : createConnection
};