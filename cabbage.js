;(function (exports) {
  var DIRECTIONS = ["n", "e", "s", "w", "ne", "nw", "se", "sw"];
  var VALS = ["r", "g", "b", "a"];

  // Pixel is a dumb object that does not know about image data
  // It is only meant to be used by Cabbage directly for:
  // manipulating canvas values, storing and easy retrieval of rgba

  function Pixel(x, y, vals) {
    var self = this;
    this.x = x;
    this.y = y;
    this.neighbors = {};

    VALS.forEach(function(d) {
      self[d] = vals.shift();
    });

    DIRECTIONS.forEach(function(d){
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

;(function (exports) {
  var d = exports.document;
  var COORDS = 'coordinate';
  var PIXIDX = 'pixel index';
  var IDIDX = 'image data index';

  function Cabbage(id, w, h, doc) {
    d = d || doc;
    this.width = w || 600;
    this.height = h || 400;
    this.elem = d.getElementById(id) || this._createCanvas(id);
    this.ctx = this.elem.getContext('2d');
    this.origImg = {};
    this.currImg = {};
  }

  Cabbage.prototype.loadImg = function(img, sx, sy) {
    var self = this;
    if (typeof img === 'string') {
      this._createImage(img, function(usrImg) {
        self._img = usrImg;
        if (usrImg.width !== self.width || usrImg.height !== self.height) {
          self.width = usrImg.width;
          self.height = usrImg.height;
          self.elem.width = self.width;
          self.elem.height = self.height;
        }
        self.drawImage(sx, sy);
      });
    } else if (/HTMLImageElement/.test(img.constructor)){
      this._img = img;
      this.drawImage(sx, sy);
    }
    return this;
  };

  Cabbage.prototype._createImage = function(imgSrc, fn) {
    var self = this;
    usrImg = new Image();
    usrImg.onload = function() {
      fn(usrImg);
    };
    usrImg.src = imgSrc;
  };

  Cabbage.prototype._createCanvas = function(id) {
    var elem;
    elem = d.createElement('canvas');
    elem.id = id;
    elem.width = this.width;
    elem.height = this.height;
    d.body.insertBefore(elem, d.body.firstChild);
    return elem;
  };

  Cabbage.prototype.drawImage = function(sx, sy) {
    this.ctx.drawImage(this._img, sx || 0, sy || 0);
    this.origImg.imgData = this.getCurrentImg();
    this.refreshCurrImageData();
  };

  Cabbage.prototype.setImg = function(imgData) {
    this.ctx.putImageData(imgData, 0, 0);
  };

  /*
  // Delete image data; leave canvas blank
  Cabbage.prototype.deleteImg = function() {
  };

  // Reset to original data
  Cabbage.prototype.resetImg = function() {
  };
  */

  // returns the actual current image data
  Cabbage.prototype.getCurrentImg = function() {
    return this.ctx.getImageData(0, 0, this.width, this.height);
  };

  // returns a copy of original image data
  Cabbage.prototype.originalImg = function() {
    return this.ctx.createImageData(this.origImg.imgData);
  };

  Cabbage.prototype.map = function(fn) {
    var x, y, cvsIndex, pixelIndex;
    for (y = 0; y < this.height; y++) {
      for (x = 0; x < this.width; x++) {
        pixelIndex = (y * this.width) + x;
        cvsIndex = x * 4 + y * this.width * 4;
        fn(x, y, pixelIndex, cvsIndex);
      }
    }
  };

  Cabbage.prototype.convolve = function(fn, size) {
    var x, y, cvsIndex, pixelIndex, matrix;
    size = size || 3;
    for (y = 0; y < this.height; y++) {
      for (x = 0; x < this.width; x++) {
        pixelIndex = (y * this.width) + x;
        cvsIndex = x * 4 + y * this.width * 4;
        matrix = this._buildMatrix(x, y, size);
        fn(matrix, x, y, pixelIndex, cvsIndex);
      }
    }
  };

  // returns the pixel object if it exists
  // otherwise throws an error
  Cabbage.prototype.getPixel = function(loc) {
    var index, coords;

    if (typeof loc === 'number') {
      index = loc;
      coords = this._convertIDIndexToCoords(loc);
    } else {
      index =  this._convertCoordsToIDIndex(loc);
      coords = loc;
    }

    return new Pixel(coords.x, coords.y, this.currImg.data.slice(index, index + 4));
  };

  Cabbage.prototype.setPixel = function(pixel, val) {
    var i = this._convertCoordsToIDIndex(pixel),
        r, g, b, a;

    if (typeof val === 'number') {
      r = g = b = val;
      a = this.getCurrentImg().data[i + 3];
    } else {
      r = val.r;
      g = val.g;
      b = val.b;
      a = val.a;
    }
    this._drawPixel(pixel, r, g, b, a);
  };

  Cabbage.prototype._drawPixel = function(pixel, r, g, b, a){
    this.ctx.fillStyle = 'rgba(' + [r, g, b, a].join(', ') + ')';
    this.ctx.fillRect(pixel.x, pixel.y, 1, 1);
  };

  Cabbage.prototype.isBorder = function(coords) {
    return ((coords.x === 0 && coords.y < this.height && coords.y >= 0) ||
            (coords.y === 0 && coords.x < this.width && coords.x >= 0) ||
            (coords.x === this.width - 1 && coords.y < this.height && coords.y >= 0) ||
            (coords.y === this.height - 1 && coords.x < this.width && coords.x >= 0));
  };

  Cabbage.prototype.isOutOfBounds = function(coords) {
    return coords.x < 0 ||
           coords.x > this.width - 1 ||
           coords.y < 0 ||
           coords.y > this.height - 1;
  };

  // Every putImageData done via object
  // stores current image for faster access later
  Cabbage.prototype.putImageData = function(imgData, x, y) {
    this.ctx.putImageData(id, pixel.x, pixel.y);
    this.refreshCurrImageData();
  };

  Cabbage.prototype.refreshCurrImageData = function() {
    this.currImg = this.getCurrentImg();
  };

  Cabbage.prototype._buildMatrix = function(cx, cy, size) {
    var matrix = [], nx, ny;
    var min = 3, max = Math.max(this.width, this.height); // temp max value
    size = size || 3;
    size = (size % 2 === 0) ? size + 1 : size;
    // TODO make it so that max size is dictated by the dimensions of the image
    if (size < min || size > max) size = min;

    for (var i = 0, y = -(size-1)/2; i < size; i++, y++) {
      matrix[i] = [];
      for (var j = 0, x = -(size-1)/2; j < size; j++, x++) {
        nx = cx + x;
        ny = cy + y;
        if (nx < 0 || nx >= this.width || ny < 0 || ny >= this.height) {
          matrix[i][j] = undefined;
        } else {
          matrix[i][j] = this._convertCoordsToIDIndex({x: nx, y: ny});
        }
      }
    }
    return matrix;
  };

  Cabbage.prototype._convertCoordsToIDIndex = function(coords) {
    if (!this._checkValidCoords(coords)) {
      this._throwValidationError(COORDS, IDIDX);
    }
    var m = 4;
    return (coords.y * this.width + coords.x) * m;
  };

  Cabbage.prototype._convertCoordsToPixIndex = function(coords) {
    if (!this._checkValidCoords(coords)) {
      this._throwValidationError(COORDS, PIXIDX);
    }
    return (coords.y * this.width) + coords.x;
  };

  Cabbage.prototype._checkValidCoords = function(coords, msg) {
    return (!!coords &&
            (coords.x === parseInt(coords.x, 10)) &&
            (coords.y === parseInt(coords.y, 10)) &&
            coords.x >= 0 && coords.x < this.width &&
            coords.y >= 0 && coords.y < this.height);
  };

  Cabbage.prototype._checkValidPIndex = function(pIdx, msg) {
    return ((pIdx === parseInt(pIdx, 10)) &&
            pIdx >= 0 &&
            pIdx < (this.width * this.height));
  };

  Cabbage.prototype._checkValidIDIndex = function(pIdx, msg) {
    return ((pIdx === parseInt(pIdx, 10)) &&
            pIdx >= 0 &&
            pIdx < (this.width * this.height * 4));
  };

  Cabbage.prototype._convertIDIndexToCoords = function(idIdx) {
    if (!this._checkValidIDIndex(idIdx)) {
      this._throwValidationError(IDIDX, COORDS);
    }
    var m = 4;
    if (idIdx % 4 > 0) idIdx -= idIdx % 4;
    return {
            x : (idIdx % (this.width * m)) / m,
            y : Math.floor(idIdx / (this.width * m))
           };
  };

  Cabbage.prototype._convertIDIndexToPixIndex = function(idIdx) {
    if (!this._checkValidIDIndex(idIdx)) {
      this._throwValidationError(IDIDX, PIXIDX);
    }
    var m = 4;
    return Math.floor(idIdx/m);
  };

  Cabbage.prototype._convertPixIndexToCoords = function(pIdx) {
    if (!this._checkValidPIndex(pIdx)) {
      this._throwValidationError(PIXIDX, COORDS);
    }
    return { x: pIdx%this.width, y: Math.floor(pIdx/this.width) };
  };

  Cabbage.prototype._convertPixIndexToIDIndex = function(pIdx) {
    if (!this._checkValidPIndex(pIdx)) {
      this._throwValidationError(PIXIDX, IDIDX);
    }
    return pIdx * 4;
  };

  Cabbage.prototype._throwValidationError = function(from, to) {
    var msg = 'Invalid ' + from + '. Unable to convert to ' + to;
    throw new Error(msg);
  };

  exports.Cabbage = Cabbage;
}(this));
