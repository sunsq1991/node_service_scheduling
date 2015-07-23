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
  Schedule.findOne({date: new Date(req.params.date)}, function (err, schedule) {
    if(err) { return handleError(res, err); }
    if(!schedule) { schedule = {jobs:[]}; }
    return res.json(schedule);
  });
};

// Creates a new job in the DB.
exports.create = function(req, res) {
  var target_schedule;
  Schedule.findOne({ date: new Date(req.params.date) }, function (err, schedule) {
    if(err) { return handleError(res, err); }
    if(!schedule) {
      target_schedule = new Schedule({ date: new Date(req.params.date) });
    }
    else{
      target_schedule = schedule;
    }
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
  Schedule.findOne({date: new Date(req.params.date)}, function (err, schedule) {
    if (err) { return handleError(res, err); }
    if(!schedule) { return res.send(404); }
    var job = schedule.jobs.id(req.body._id);
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
  Schedule.findOne({date: new Date(req.params.date) }, function (err, schedule) {
    if (err) { return handleError(res, err); }
    if(!schedule) { return res.send(404); }
    for (var i = 0; i < req.body.jobs.length; i++) {
      var job = schedule.jobs.id(req.body.jobs[i]._id);
      if(!job) { return res.send(404); }
      console.log(job);
      console.log(req.body.jobs[i]);
      var updated = _.merge(job, {
        worker: req.body.jobs[i].worker,
        isMorning: req.body.jobs[i].isMorning,
        slot: req.body.jobs[i].slot
      });
    }
    schedule.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, schedule);
    });
  });
};

// Deletes a job from the DB.
exports.destroy = function(req, res) {
  Schedule.findOne({date: new Date(req.params.date)}, function (err, schedule) {
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