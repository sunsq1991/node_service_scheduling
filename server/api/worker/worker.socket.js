/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var worker = require('./worker.model');

exports.register = function(socket) {
  worker.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  worker.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('worker:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('worker:remove', doc);
}