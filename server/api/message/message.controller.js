/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /messages              ->  index
 * POST    /messages              ->  create
 * GET     /messages/:id          ->  show
 * PUT     /messages/:id          ->  update
 * DELETE  /messages/:id          ->  destroy
 */

'use strict';

var _ = require('lodash');
var message = require('./message.model');

// Get list of messages

exports.index = function(req, res) {
  message.find(function (err, message) {
    if(err) { return handleError(res, err); }
    return res.json(200, message);
  });
};
// exports.index = function(req, res) {
//   var target_date = new Date((new Date()).setHours(0, 0, 0, 0));
//   if (req.params.date) {
//     target_date = req.params.date;
//   }
//   console.log(target_date);
//   message.find(function (err, messages) {
//     console.log(messages);
//     if(err) { return handleError(res, err); }
//     for (var i = messages.length - 1; i >= 0; i--) {
//       messages[i].isAvaliable = true;
//       for (var j = messages[i].notAvaliableDates.length - 1; j >= 0; j--) {
//         console.log(messages[i].notAvaliableDates[j]);
//         if(target_date >= messages[i].notAvaliableDates[j].startDate && target_date <= messages[i].notAvaliableDates[j].endDate)
//         {
//            messages[i].isAvaliable = false;
//            console.log(messages[i].isAvaliable);
//         } 
//       };
//     };
//     return res.json(200, messages);
//   });
// };

// Get a single message
exports.show = function(req, res) {
  message.findById(req.params.id, function (err, message) {
    if(err) { return handleError(res, err); }
    if(!message) { return res.send(404); }
    return res.json(message);
  });
};

// Creates a new message in the DB.
exports.create = function(req, res) {
  message.create(req.body, function(err, message) {
    if(err) { return handleError(res, err); }
    return res.json(201, message);
  });
};

// Creates a new message vacation in the DB.
exports.createVacation = function(req, res) {
  console.log(req.body);
  if(req.body._id) { delete req.body._id; }
  message.findById(req.params.id, function (err, message) {
    if (err) { return handleError(res, err); }
    if(!message) { return res.send(404); }
    message.notAvaliableDates.push(req.body);
    message.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, message);
    });
  });
};

exports.deleteVacation = function(req, res) {
  message.findById(req.params.id, function (err, message) {
    if (err) { return handleError(res, err); }
    if(!message) { return res.send(404); }
     console.log(req.body._id);
   message.notAvaliableDates.id(req.body._id).remove(function (err){
       if (err) { return handleError(res, err); }
      
   });
      console.log(message.notAvaliableDates);
      message.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, message);
    });


  });
};


// Updates an existing message in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  message.findById(req.params.id, function (err, message) {
    if (err) { return handleError(res, err); }
    if(!message) { return res.send(404); }
    var updated = _.merge(message, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, message);
    });
  });
};

// Deletes a message from the DB.
exports.destroy = function(req, res) {
  message.findById(req.params.id, function (err, message) {
    if(err) { return handleError(res, err); }
    if(!message) { return res.send(404); }
    message.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}