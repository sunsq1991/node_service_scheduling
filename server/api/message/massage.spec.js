'use strict';

var should = require('should');
var app = require('../../app');
var request = require('supertest');
var Message = require('./message.model');

describe('Message Model', function() {

  it('should start with no message', function(done) {
    done();
  });


 it('should fail when saving without an text', function(done) {
    done();
  });

 it('should fail when saving without an date', function(done) {
    done();
  });
 it('should fail when saving without an sender', function(done) {
    done();
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
});
