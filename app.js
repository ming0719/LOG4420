var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var routes = require('./routes/index');
var users = require('./routes/users');
var constantes = require('./var.js');

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
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'ouvre un coca, ouvre du bonheur',
  resave: false,
  saveUninitialized: true
}))

app.use('/', routes);
app.use('/users', users);

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

// On passe les objets et tableaux javascript crees
app.locals.disciplines = constantes.disciplines;
app.locals.armes = constantes.armes;
app.locals.objSpeciaux = constantes.objSpeciaux;
app.locals.objSacADos = constantes.objSacADos;
app.locals.armes_ids = constantes.armes_ids;
app.locals.tableCombatPositifs = constantes.tableCombatPositifs;
app.locals.tableCombatNegatifs = constantes.tableCombatNegatifs;
app.locals.tableCorrespondancePage = constantes.tableCorrespondancePage;
app.locals.pagesCombat = constantes.pagesCombat;
app.locals.pagesChoixAleatoires = constantes.pagesChoixAleatoires;

module.exports = app;
