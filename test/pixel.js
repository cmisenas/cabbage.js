var assert = require('assert'),
    Pixel = require('../js/pixel').Pixel;

var pixel;

/*
  _________________
  |   | * |   |   |
  |___|___|___|___|
  |   |   |   |   |
  |___|___|___|___|

 */

describe('Pixel', function(){
  setup(function(){
    pixel = new Pixel(1, 0, [44, 36, 150, 255]);
  });

  it('stores its x and y coordinates', function() {
    assert.equal(pixel.x, 1);
    assert.equal(pixel.y, 0);
  });

  it('stores its rgba values', function() {
    assert.equal(pixel.r, 44);
    assert.equal(pixel.g, 36);
    assert.equal(pixel.b, 150);
    assert.equal(pixel.a, 255);
  });

  it('returns the x and y coordinates of its neighbors', function() {
    assert.deepEqual(pixel.neighbors.s, {x: 1, y: 1});
    assert.deepEqual(pixel.neighbors.e, {x: 2, y: 0});
    assert.deepEqual(pixel.neighbors.w, {x: 0, y: 0});
  });

  it('is dumb and returns invalid coordinate values if a neighbor does not exist', function() {
    assert.deepEqual(pixel.neighbors.n, {x: 1, y: -1});
  });
});
