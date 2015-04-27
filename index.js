/*!
 * template-push <https://github.com/jonschlinkert/template-push>
 *
 * Copyright (c) 2014-2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

var File = require('vinyl');
var through = require('through2');
var toVinyl = require('to-vinyl');

/**
 * Expose `push`
 */

module.exports = push;

/**
 * Returns a function that takes the current instance of `app`.
 *
 * ```js
 * var app = require('your-app');
 * var appPush = require('template-push')(app);
 * ```
 *
 * @param {Object} `app` Instance of app.
 * @return {Function} Factory function used to build a stream.
 * @api public
 */

function push(app) {
  if (!app || typeof app.views === 'undefined') {
    throw new Error('template-push expects `app` to be an instance of Template.');
  }

  /**
   * Returns a stream that pushes a collection of templates
   * onto a stream as vinyl file objects.
   *
   * ```js
   * // create a new arbitrary template type (collection)
   * app.create('foo', {isRenderable: true});
   *
   * // Load `foo` templates
   * app.foo('about-app.md', {content: '...'});
   *
   * // push the `foo` collection into the stream to be rendered
   * app.task('default', function () {
   *   appPush('foo').pipe(app.dest('dist/'));
   * });
   * ```
   *
   * @name appPush
   * @param  {String} `name` Name of the collection to push into the stream.
   * @return {Stream} Stream used in piping objects through.
   * @api public
   */

  return function(name) {
    var isString = typeof name === 'string';
    if (!isString && typeof name !== 'object') {
      throw new TypeError('template-push expects collection `name` to be a string or object.');
    }

    var session = app.session;
    var loaded = session.get('loaded') || [];
    loaded.push(name);
    session.set('loaded', loaded);

    var stream = through.obj();
    var pass = through.obj();
    stream.pipe(pass);

    var collection = isString
      ? (app.views[name] || {})
      : name;

    process.nextTick(function () {
      for (var key in collection) {
        if (collection.hasOwnProperty(key)) {
          stream.write(toVinyl(collection[key], File));
        }
      }
      stream.end();
    });
    return pass;
  };
}
