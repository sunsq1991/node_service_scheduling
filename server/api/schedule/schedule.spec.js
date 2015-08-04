'use strict';

var should = require('should');
var app = require('../../app');
var request = require('supertest');
var Schedule = require('./schedule.model');

var schedule = new Schedule({
  date: new Date(),
});


describe('Schedule Model', function() {
  before(function(done) {
    // Clear schedule before testing
    Schedule.remove().exec().then(function() {
      done();
    });
  });

  afterEach(function(done) {
    Schedule.remove().exec().then(function() {
      done();
    });
  });

  it('should begin with 0 schedule', function(done) {

    Schedule.find({}, function(err, schedule) {
      schedule.should.have.length(0);
      done();
    });
  });

   it('should fail when there date property is empty', function(done) {

    Schedule.find({}, function(err, schedule) {
      schedule.should.have.property;
      done();
    });
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

  it('should respond client 123', function(done) {  
    request(app)
      .get('/api/schedule/'+new Date(),{
        client: '123',
        location: '456',})
      .end(function(err, res) {
        if (err) return done(err);
      res.body.should.have.client;
        done();
      });
  });

});



 



