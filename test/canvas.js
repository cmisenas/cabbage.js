/*
  Canvas
    index is based on actual place of the pixel (not by 4s)

  List of Functions:

  loadImg = function(img, sx, sy)
  setImg = function(imgData)
  deleteImg = function()
  resetImg = function()
  getCurrentImg = function()
  originalImg = function()
  map = function()
  convolve = function()
  getPixel = function(loc, defVal)
  setPixel = function(pixel, val)
  isBorder = function(coords)
  _convertToIndex = function(coords)
  _convertToCoords = function(index)
  putImageData = function(imgData, x, y)
  _getMatrix = function(cx, cy, size)

 */
var assert = require('assert'),
    sinon = require('sinon'),
    jsdom = require('jsdom').jsdom,
    document = jsdom('<html></html>', {}),
    window = document.defaultView;

var Canvas = require('../js/cabbage').Canvas,
    canvas;

describe('Canvas', function(){
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
    canvas = new Canvas('foo', 10, 10, document);
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

