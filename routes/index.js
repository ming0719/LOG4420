var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('./index.jade', function(err, html) {
  	res.render('page', { title: 'Lone Wolf : Les Grottes de Katle', htmlPage: html })
  });
  // res.render('index', { title: 'Lone Wolf : Les Grottes de Katle' });
});

/* GET other pages. */
router.get('/:valeur', function(req, res, next) {

  var v = req.params.valeur;
  var page = "./" + v + ".jade";

  res.render(page, function(err, html) {
  	res.render('page', { title: 'Lone Wolf : Les Grottes de Katle', htmlPage: html })
  });  
});

module.exports = router;
