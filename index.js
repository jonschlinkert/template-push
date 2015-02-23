/*!
 * verb-push <https://github.com/jonschlinkert/verb-push>
 *
 * Based on https://github.com/doowb/assemble-push
 * Copyright (c) 2014-2015, Brian Woodward.
 *
 * Copyright (c) 2014-2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

/**
 * Expose `push`
 */

module.exports = push;

/**
 * Returns a function that takes the current instance of `verb`.
 *
 * ```js
 * var verb = require('verb');
 * var push = require('verb-push')(verb);
 * ```
 *
 * @param {Object} `verb` Current instance of verb.
 * @return {Function} Factory function used to build a stream.
 * @api public
 */

function push(verb) {

  /**
   * Returns a stream that pushes a collection of templates
   * onto a stream as vinyl file objects.
   *
   * ```js
   * // create a new arbitrary template type (collection)
   * verb.create('foo', {isRenderable: true});
   *
   * // Load `foo` templates
   * verb.foo('about-verb.md', {content: '...'});
   *
   * // push the `foo` collection into the stream to be rendered
   * verb.task('default', function () {
   *   push('foo').pipe(verb.dest('dist/'));
   * });
   * ```
   *
   * @param  {String} `collection` Name of the collection to push into the stream.
   * @return {Stream} Stream used in piping objects through.
   * @api public
   */

  return function push(collection) {
    setRenderables(collection);

    var tutils = require('template-utils');
    var through = require('through2');

    var source = through.obj();
    var pass = through.obj();
    source.pipe(pass);

    var obj = verb.views[collection] || {};
    process.nextTick(function () {
      Object.keys(obj).forEach(function (key) {
        source.write(tutils.toVinyl(obj[key]));
      });
      source.end();
    });
    return pass;
  };

  function setRenderables(collection) {
    var session = verb.session;
    var loaded = session.get('loaded') || [];
    loaded.push(collection);
    session.set('loaded', loaded);
  }
};
