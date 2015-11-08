var express = require('express');
var session = require('express-session');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var creationJoueur = require('./routes/creationJoueur')
var pageJeu = require('./routes/pageJeu')
var serviceweb = require('./routes/serviceweb');

var mongoose = require('mongoose');
var Joueur = require('./models/joueur');
var Avancement = require('./models/avancement');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
// session setup
app.use(session({ secret: "secreetttt", resave: true, saveUninitialized: true/*, cookie: { secure: true }*/ }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/', creationJoueur);
app.use('/', pageJeu);

app.use('/api/*', bodyParser.json({ type: 'application/json' }));
app.use('/api', serviceweb);

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



// Connection URL
var dbURI = 'mongodb://user:log4420@ds045734.mongolab.com:45734/log4420';
// Use connect method to connect to the Server
mongoose.connect(dbURI, function(err, dbURI) {
  console.log("Connected correctly to server");
});

// Successfully connected
mongoose.connection.on('connected', function () {  
  console.log('Mongoose default connection open to ' + dbURI);
}); 

// Connection throws an error
mongoose.connection.on('error',function (err) {  
  console.log('Mongoose default connection error: ' + err);
}); 

// Connection is disconnected
mongoose.connection.on('disconnected', function () {  
  console.log('Mongoose default connection disconnected'); 
});

function disconnect() {  
  mongoose.connection.close(function () { 
    console.log('Mongoose default connection disconnected through app termination'); 
    process.exit(0); 
  });
}

// If the Node process ends, close the Mongoose connection 
process.on('SIGINT', disconnect).on('SIGTERM', disconnect);


module.exports = app;

