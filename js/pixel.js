;(function (exports) {
  var DIRECTIONS = ["n", "e", "s", "w", "ne", "nw", "se", "sw"];
  // Revisit: do you really need to pass index to pixel?
  // Proposal: Pixel should only deal with coords
  // Leave all coords <-> index calculation to canvas
  // Revisit: do you really need to pass imgData?
  // Currently needed to be able to calculate neighbors (img data width)
  function Pixel(sIndex, x, y, imgData) {
    var self = this;
    this.x = x;
    this.y = y;
    this.sIndex = sIndex;
    this.imgData = imgData.data;
    this.width = imgData.width;
    this.neighbors = [];

    DIRECTIONS.map(function(d,idx){
      self.neighbors.push(that[d]());
    });
  }

  Pixel.prototype.r = function() {
    return this.imgData[this.sIndex];
  };

  Pixel.prototype.g = function() {
    return this.imgData[this.sIndex + 1];
  };

  Pixel.prototype.b = function() {
    return this.imgData[this.sIndex + 2];
  };

  Pixel.prototype.a = function() {
    return this.imgData[this.sIndex + 3];
  };

  Pixel.prototype.n = function(){
    // pixels are simply arrays in canvas image data
    // where 1 pixel occupies 4 consecutive elements
    // equal to r-g-b-a
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

}(this));
