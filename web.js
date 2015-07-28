var gzippo = require('gzippo');
var express = require('express');
var app = express();

var morgan         = require('morgan');
var bodyParser     = require('body-parser');
var methodOverride = require('method-override');

var http = require('http'),
    fs = require('fs'),
    ejs = require('ejs');

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
 
// app.use(express.logger('dev'));

app.use(morgan('dev')); // log   every request to the console

app.use(methodOverride());  // simulate DELETE and PUT

app.use(gzippo.staticGzip("" + __dirname + "/dist"));
app.listen(process.env.PORT || 5000);