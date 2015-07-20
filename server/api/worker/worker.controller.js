/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /workers              ->  index
 * POST    /workers              ->  create
 * GET     /workers/:id          ->  show
 * PUT     /workers/:id          ->  update
 * DELETE  /workers/:id          ->  destroy
 */

'use strict';

var _ = require('lodash');
var worker = require('./worker.model');

// Get list of workers
exports.index = function(req, res) {
  worker.find(function (err, workers) {
    if(err) { return handleError(res, err); }
    return res.json(200, workers);
  });
};

// Get a single worker
exports.show = function(req, res) {
  worker.findById(req.params.id, function (err, worker) {
    if(err) { return handleError(res, err); }
    if(!worker) { return res.send(404); }
    return res.json(worker);
  });
};

// Creates a new worker in the DB.
exports.create = function(req, res) {
  worker.create(req.body, function(err, worker) {
    if(err) { return handleError(res, err); }
    return res.json(201, worker);
  });
};

// Updates an existing worker in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  worker.findById(req.params.id, function (err, worker) {
    if (err) { return handleError(res, err); }
    if(!worker) { return res.send(404); }
    var updated = _.merge(worker, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, worker);
    });
  });
};

// Deletes a worker from the DB.
exports.destroy = function(req, res) {
  worker.findById(req.params.id, function (err, worker) {
    if(err) { return handleError(res, err); }
    if(!worker) { return res.send(404); }
    worker.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}