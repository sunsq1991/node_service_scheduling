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
    if(!schedule) { schedule = {jobs:[]}; }
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
    req.body.slot = target_schedule.jobs.filter(function (el) {return el.worker == req.body.worker}).length;
    target_schedule.jobs.push(req.body);
    target_schedule.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, target_schedule);
    });
  });
};

// Updates an existing job in the DB.
exports.update = function(req, res) {
  Schedule.findOne(req.params.date, function (err, schedule) {
    if (err) { return handleError(res, err); }
    if(!schedule) { return res.send(404); }
    var job = schedule.jobs.id(req.body._id);
    console.log(typeof (job.worker));
    if(!job) { return res.send(404); }
    else { delete req.body._id; }
    var updated = _.merge(job, req.body);
    schedule.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, schedule);
    });
  });
};

// Updates multipul jobs in the DB.
exports.updateJobs = function(req, res) {
  Schedule.findOne(req.params.date, function (err, schedule) {
    if (err) { return handleError(res, err); }
    if(!schedule) { return res.send(404); }
    for (var i = 0; i < req.body.jobs.length; i++) {
      var job = schedule.jobs.id(req.body.jobs[i]._id);
      if(!job) { return res.send(404); }
      else { delete req.body.jobs[i]._id; }
      var updated = _.merge(job, req.body.jobs[i]);
    }
    schedule.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, schedule);
    });
  });
};

// Deletes a job from the DB.
exports.destroy = function(req, res) {
  Schedule.findOne(req.params.date, function (err, schedule) {
    if(err) { return handleError(res, err); }
    if(!schedule) { return res.send(404); }
    var job = schedule.jobs.id(req.body._id);
    if(!job) { return res.send(404); }
    job.remove(function (err) {
      if(err) { return handleError(res, err); }
    });
    schedule.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, schedule);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}