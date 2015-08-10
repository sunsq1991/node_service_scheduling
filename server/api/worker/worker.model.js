'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var notAvaliableDate = new Schema({
  startDate: Date,
  endDate: Date
});

var worker = new Schema({
  workerName: String,
  email: String,
  discription: String,
  notAvaliableDates: [notAvaliableDate],
  isAvaliable: Boolean
});




module.exports = mongoose.model('worker', worker);
