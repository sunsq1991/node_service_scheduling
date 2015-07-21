'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var notAvaliableDate = new Schema({
  startDate: String,
  endDate: String
});

var worker = new Schema({
  workerName: String,
  email: String,
  discription: String,
  currentStatus: String,
  notAvaliableDates: [notAvaliableDate]
});



module.exports = mongoose.model('worker', worker);