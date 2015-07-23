/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var schedule = require('./schedule.model');

exports.register = function(socket) {
  schedule.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  schedule.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('schedule:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('schedule:remove', doc);
}