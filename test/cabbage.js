var assert = require('assert'),
    sinon = require('sinon'),
    jsdom = require('jsdom').jsdom,
    document = jsdom('<html></html>', {}),
    window = document.defaultView;

var Cabbage = require('../js/cabbage').Cabbage,
    canvas;

describe('Cabbage', function(){
  setup(function(){
    document.getElementById = sinon.stub().returns({
      getContext: function(){
        return {
          putImageData: sinon.spy(),
          getImageData: sinon.spy(),
          createImageData: sinon.spy(),
          fillRect: sinon.spy()
        };
      }
    });
    canvas = new Cabbage('foo', 10, 10, document);
  });

  describe('loadImg', function() {
    it('uses the x and y coordinates if provided', function() {
    });
  });

  describe('setImg', function() {
  });

  describe('deleteImg', function() {
  });

  describe('resetImg', function() {
  });

  describe('getCurrentImg', function() {
  });

  describe('getOriginalImg', function() {
  });

  describe('map', function() {
  });

  describe('convolve', function() {
  });

  describe('getPixel', function() {
  });

  describe('setPixel', function() {
  });

  describe('isBorder', function() {
  });

  describe('_convertToIndex', function() {
  });

  describe('_convertToCoords', function() {
  });

  describe('putImageData', function() {
  });

  describe('_buildMatrix', function() {
  });
});

