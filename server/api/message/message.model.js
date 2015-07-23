'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var message = new Schema({
  text: String,
  time: { type : Date, default: Date.now },
  sender: String
});

module.exports = mongoose.model('message', message);