/*!
 * template-push <https://github.com/jonschlinkert/template-push>
 *
 * Copyright (c) 2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

/* deps: mocha */
require('should');
var through = require('through2');
var verb = require('verb');
var push = require('./');
var verbPush = push(verb);

describe('template-push', function () {
  it('should throw an error when `app` is not an instance of Template:', function () {
    (function () {
      push();
    }).should.throw('template-push expects `app` to be an instance of Template.');
  });
  it('should throw an error when collection name is not a string:', function () {
    (function () {
      verbPush();
    }).should.throw('template-push expects collection `name` to be a string or object.');
  });

  verb.create('item', function () {
    return {
      one: { path: 'one.hbs', content: '1' },
      two: { path: 'two.hbs', content: '2' },
      three: { path: 'three.hbs', content: '3' },
      four: { path: 'four.hbs', content: '4' }
    };
  });
  verb.items();

  it('should add items to the stream by collection name', function (done) {
    var count = 0;
    verbPush('items')
      .on('data', function () {
        count++;
      })
      .on('error', done)
      .on('end', function () {
        count.should.eql(4);
        done();
      });
  });

  it('should pass items through when piped to', function (done) {
    var count = 0;
    var stream = through.obj();

    stream
      .pipe(verbPush('items'))
      .on('data', function () {
        count++;
      })
      .on('error', done)
      .on('end', function () {
        count.should.eql(6);
        done();
      });

    stream.write({path: 'foo'});
    stream.write({path: 'bar'});
    stream.end();
  });

  it('should read items from the stream', function (done) {
    var count = 0;
    verbPush('items')
      .pipe(through.obj(function (file, enc, cb) {
        count++;
        cb();
      }, function (cb) {
        count.should.eql(4);
        done();
      }))
      .on('error', done);
  });

  it('should allow an object to be passed:', function (done) {
    var templates = {
      foo: {path: 'foo.hbs', content: 'this is foooo.'},
      bar: {path: 'bar.hbs', content: 'this is baaar.'}
    };
    var count = 0;
    verbPush(templates)
      .pipe(through.obj(function (file, enc, cb) {
        count++;
        cb();
      }, function (cb) {
        count.should.eql(2);
        done();
      }))
      .on('error', done);
  });
});
