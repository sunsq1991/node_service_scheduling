'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var Jobs = new Schema({
  client: String,
  location: String,
  discription: String,
  isMorning: Boolean,
  slot: Number,
  editing: Boolean,
  worker: {
  	type: Schema.Types.ObjectId,
  	ref: 'Worker'
  }
});

var ScheduleSchema = new Schema({
  date: {
  	type: Date,
  	index: { unique: true }
  },
  jobs: [Jobs]
});

module.exports = mongoose.model('Schedule', ScheduleSchema);