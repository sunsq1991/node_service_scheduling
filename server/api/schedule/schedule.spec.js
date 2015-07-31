'use strict';

var should = require('should');
var app = require('../../app');
var request = require('supertest');
var Schedule = require('./schedule.model');

var schedule = new Schedule({
  date: new Date(),
  jobs: []
});


describe('schedule Model', function() {

  it('should begin with no schedule', function(done) {
    Schedule.find({}, function(err, schedule) {
      schedule.should.have.length(1);
      done();
    });
  });


 it('should fail when saving without an date', function(done) {
    schedule.date = null;
    schedule.save(function(err) {
      should.exist(err);
      done();
    });
  });

 it('should fail when duplcate jobs', function(done) {
    done();
  });
  it('should fail when duplcate workers', function(done) {
    done();
  });
});



describe('GET /api/schedule', function() {

  it('should respond with JSON array', function(done) {
    request(app)
      .get('/api/schedule')
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) return done(err);
        res.body.should.be.instanceof(Array);
        done();
      });
  });
});
