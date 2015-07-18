;(function (exports) {
  var DIRECTIONS = ["n", "e", "s", "w", "ne", "nw", "se", "sw"];

  // Pixel is a dumb object that does not know about image data
  // It is only meant to be used by Canvas directly for:
  // manipulating canvas values, storing and easy retrieval of rgba

  function Pixel(x, y, vals) {
    var self = this;
    this.x = x;
    this.y = y;
    this.r = vals.shift();
    this.g = vals.shift();
    this.b = vals.shift();
    this.a = vals.shift();
    this.neighbors = {};

    DIRECTIONS.forEach(function(d,idx){
      self.neighbors[d] = (self[d]());
    });
  }

  Pixel.prototype.n = function(){
    return {x: this.x, y: this.y - 1};
  };

  Pixel.prototype.e = function(){
    return {x: this.x + 1, y: this.y};
  };

  Pixel.prototype.s = function(){
    return {x: this.x, y: this.y + 1};
  };

  Pixel.prototype.w = function(){
    return {x: this.x - 1, y: this.y};
  };

  Pixel.prototype.ne = function(){
    return {x: this.x + 1, y: this.y - 1};
  };

  Pixel.prototype.nw = function(){
    return {x: this.x - 1, y: this.y - 1};
  };

  Pixel.prototype.se = function(){
    return {x: this.x + 1, y: this.y - 1};
  };

  Pixel.prototype.sw = function(){
    return {x: this.x + 1, y: this.y - 1};
  };

  exports.Pixel = Pixel;
}(this));
