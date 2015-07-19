/**
 * Using Rails-like standard naming convention for endpoints.
 */

'use strict';

var _ = require('lodash');
var Schedule = require('./schedule.model');

// Get all schedules
exports.index = function(req, res) {
  Schedule.find(function (err, schedules) {
    if(err) { return handleError(res, err); }
    return res.json(200, schedules);
  });
};

// Get one schedule
exports.show = function(req, res) {
  var target_date = new Date((new Date()).setHours(0, 0, 0, 0));
  if (req.params.date) {
    target_date = req.params.date;
  }
  Schedule.findOne({date:target_date}, function (err, schedule) {
    if(err) { return handleError(res, err); }
    if(!schedule) { return res.send(404); }
    return res.json(schedule);
  });
};

// Creates a new job in the DB.
exports.create = function(req, res) {
  var target_date = new Date((new Date()).setHours(0, 0, 0, 0));
  if (req.params.date) {
    target_date = req.params.date;
  }
  var target_schedule;
  Schedule.findOne({ date: target_date }, function (err, schedule) {
    if(err) { return handleError(res, err); }
    if(!schedule) {
      console.log('schedule not found');
      console.log(target_date);
      target_schedule = new Schedule({ date: target_date });
      console.log('after create');
    }
    else{
      target_schedule = schedule;
      console.log('create schedule');
      console.log(schedule);
    }
    console.log(target_schedule);
    target_schedule.jobs.push(req.body);
    target_schedule.save(function (err) {
      if (!err) console.log('Success!');
    });
    return res.json(target_schedule);
  });
};

// Updates an existing thing in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Thing.findById(req.params.id, function (err, thing) {
    if (err) { return handleError(res, err); }
    if(!thing) { return res.send(404); }
    var updated = _.merge(thing, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, thing);
    });
  });
};

// Deletes a thing from the DB.
exports.destroy = function(req, res) {
  Thing.findById(req.params.id, function (err, thing) {
    if(err) { return handleError(res, err); }
    if(!thing) { return res.send(404); }
    thing.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}