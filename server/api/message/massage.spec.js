'use strict';

var should = require('should');
var app = require('../../app');
var request = require('supertest');
var Message = require('./message.model');

describe('Message Model', function() {
     before(function(done) {
      Message.remove().exec().then(function() {
      done();
    });
  });

  afterEach(function(done) {
    Message.remove().exec().then(function() {
      done();
    });
  });

   it('should begin with no Message', function(done) {
    Message.find({}, function(err, message) {
      message.should.have.length(0);
      done();
    });
  });
 

});
     

describe('GET /api/message', function() {

  it('should respond with JSON array', function(done) {
    request(app)
      .get('/api/message')
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) return done(err);
        res.body.should.be.instanceof(Array);
        done();
      });
  });

   it('should get sender name of a message', function(done) {
    request(app)
      .get('/api/message')
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) return done(err);
        res.body.should.be.instanceof(Array);
        done();
      });
  });


  it('should respond Test message', function(done) {
   request(app)
      .get('/api/message/')
      .end(function(err, res) {
        if (err) return done(err);
      res.body.should.have.message;
        done();
      });
  });
});
