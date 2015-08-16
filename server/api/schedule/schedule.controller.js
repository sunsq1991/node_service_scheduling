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
    var jobsToSort = schedule.jobs.filter(function (jb) {
      return jb.worker == req.body.worker &&
             jb.isMorning === req.body.isMorning
    }).sort(function(a, b) {
      return a.sort - b.sort;
    });
    for (var i = 0; i < jobsToSort.length; i++) {
      var updated = _.merge(jobsToSort[i], {slot: i});
    };
    console.log(jobsToSort);
    schedule.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, schedule);
    });
  });
};

// Searchs multipul dates in the DB.
exports.searchJobs = function(req, res) {
  Schedule.find({}, function (err, schedules) {
    if (err) { return handleError(res, err); }
    var jobs = [];
    for (var i = schedules.length -1; i >= 0; i--) {
      var d = schedules[i].date.toISOString();
      var str_date = d.substr(5, 5) + "-" + d.substr(0, 4);
      for (var j = 0; j < schedules[i].jobs.length; j++) {
        schedules[i].jobs[j].date = str_date;
        jobs.push(schedules[i].jobs[j]);
      }
      if (jobs.length > 1000) { break; }
    }
    return res.json(200, jobs);
  });
};

function handleError(res, err) {
  return res.send(500, err);
}