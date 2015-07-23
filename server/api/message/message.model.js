'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var message = new Schema({
  text: String,
  date: Date
});

module.exports = mongoose.model('message', message);