'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var Jobs = new Schema({
  client: String,
  location: String,
  discription: String
});

var ScheduleSchema = new Schema({
  date: Date,
  jobs: [Jobs]
});

module.exports = mongoose.model('Schedule', ScheduleSchema);