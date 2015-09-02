var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var jsforce = require('jsforce');
var routes = require('./routes/index');
var accounts = require('./routes/accounts');

var constants = require('constants');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

    
var clientId = process.env.CLIENT_KEY || '3MVG9AOp4kbriZOKLj5C2RBzAEYmq2vwb_mbkq6mjGeOHYuWS4nRDlPt3YMuT2M79Or0GsSvOq9lFzJhss9Ry';
var secret = process.env.CLIENT_SECRET || '3496815519206622165';

var oauth2 = new jsforce.OAuth2({
        clientId: clientId,
        clientSecret: secret,
        redirectUri: process.env.redirect_url || 'http://localhost:3000/oauth2/callback',
        loginUrl : process.env.login_url || 'http://ahetawal-wsl:6109'
    });

app.set('oAuth2', oauth2);


// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
    secret: 'sfdemo',
    resave: true,
    saveUninitialized: true
}));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/accounts', accounts);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
