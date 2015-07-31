'use strict';

var should = require('should');
var app = require('../../app');
var request = require('supertest');
var Worker = require('./worker.model');

var worker = new Worker({
  workerName: 'test',
  email: 'test@test.com',
  discription: 'discription'
});

describe('Worker Model', function() {

  it('should begin with no worker', function(done) {
    Worker.find({}, function(err, worker) {
      worker.should.have.length(0);
      done();
    });
  });


 it('should fail when saving without an email', function(done) {
    worker.email = '';
    worker.save(function(err) {
      should.exist(err);
      done();
    });
  });

 it('should fail when saving without an workerName', function(done) {
    worker.workerName = '';
    worker.save(function(err) {
      should.exist(err);
      done();
    });
  });

 it('should fail when saving without an desciption', function(done) {
    worker.desciption = '';
    worker.save(function(err) {
      should.exist(err);
      done();
    });
  });
});

describe('GET /api/worker', function() {

  it('should respond with 401 ', function(done) {
    request(app)
      .get('/api/worker')
      .expect(401)
      .end(function(err, res) {
        if (err) return done(err);
        done();
      });
  });
});