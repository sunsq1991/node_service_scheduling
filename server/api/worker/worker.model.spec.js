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
   before(function(done) {
 Worker.remove().exec().then(function() {
      done();
    });
  });

  afterEach(function(done) {
    Worker.remove().exec().then(function() {
      done();
    });
  });

  it('should have 0 workers', function(done) {
    Worker.find({}, function(err, worker) {
      worker.should.have.length(0);
      done();
    });
  });
 it('should fail when saving without an name', function(done) {
    worker.workerName  = '';
    worker.save(function(err) {
      
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
});

describe('GET /api/worker', function() {
  it('should get worker name Skuma', function(done) {
    worker.workerName = 'Skuma';
    worker.save(function(err) {
      should.exist(err);
      done();
    });
  });

 it('should be not availble when worker are on vacation', function(done) {
    worker.vacation = true;
    worker.save(function(err) {
      should.exist(err);
      done();
    });
  });

 it('worker name shou be modified to Resheng', function(done) {
    worker.vacation = true;
    worker.save(function(err) {
      should.exist(err);
      done();
    });
  });

 it('Worker Skuma should be delete', function(done) {
    request(app)
      .delete('/api/worker/'+1)
      .end(function(err, res) {
        if (err) return done(err);
        done();
      });
  });

  it('should respond with 500', function(done) {
    request(app)
      .get('/api/worker')
      .expect(401)
      .end(function(err, res) {
        if (err) return done(err);
        done();
      });
  });

  it('should respond with 401', function(done) {
    request(app)
      .get('/api/worker')
      .expect(401)
      .end(function(err, res) {
        if (err) return done(err);
        done();
      });
  });
});