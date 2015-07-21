'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var worker = new Schema({
  workerName: String,
  email: String,
  discription: String,
  currentStatus: String,
  notAvaliableDate: [String]
});

module.exports = mongoose.model('worker', worker);