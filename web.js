var gzippo = require('gzippo');
var express = require('express');
 var morgan = require('morgan')

var app = express();
 
 app.use(morgan('combined'))
 
app.get('/', function (req, res) {
  res.send('hello, world!')
})
//app.use(express.logger('dev'));
app.use(gzippo.staticGzip("" + __dirname + "/dist"));
app.listen(process.env.PORT || 5000);