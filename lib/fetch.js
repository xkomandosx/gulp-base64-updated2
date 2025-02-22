/*
 * Grunt Image Embed
 * https://github.com/ehynds/grunt-image-embed
 *
 * Copyright (c) 2012 Eric Hynds
 * Licensed under the MIT license.
 */

// Node libs
var axios = require("axios");
var stream = require("stream");
var buffers = require("buffers");

// Grunt export wrapper
module.exports = (function () {
  "use strict";

  var exports = {};

  /**
   * Fetches a remote image.
   *
   * @param img Remote path, like http://url.to/an/image.png
   * @param done Function to call once done
   */
  exports.image = function (url, done) {
    var resultBuffer;
    var buffList = buffers();
    var imageStream = new stream.Stream();

    imageStream.writable = true;
    imageStream.write = function (data) {
      buffList.push(new Buffer(data));
    };
    imageStream.end = function () {
      resultBuffer = buffList.toBuffer();
    };

    axios({
      method: "get",
      url: url,
    })
      .then(function (response) {
        if (response.status !== 200) {
          done(
            "Unable to get " +
              url +
              " because the URL did not return an image. Status code " +
              response.status +
              " received"
          );
          return;
        }

        response.data.pipe(imageStream);

        done(null, resultBuffer, true);
      })
      .catch(function (error) {
        done("Unable to get " + url + ". Error: " + error.message);
      });
  };

  return exports;
})();
