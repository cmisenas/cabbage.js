;(function (exports) {
  var d = exports.document;

  function Cabbage(id, w, h, document) {
    d = d || document;
    this.elem = d.getElementById(id) || this._createCanvas(id, w, h);
    this.width = w || 600;
    this.height = h || 400;
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
        self.drawImage(img, sx, sy);
      });
    } else if (/HTMLImageElement/.test(img.constructor)){
      this._img = img;
      this.drawImage(img, sx, sy);
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

  Cabbage.prototype._createCanvas = function(id, w, h) {
    var elem;
    elem = d.createElement('canvas');
    elem.id = id;
    elem.width = w;
    elem.height = h;
    d.body.insertBefore(elem, d.body.firstChild);
    return elem;
  };

  Cabbage.prototype.drawImage = function(img, sx, sy) {
    this.ctx.drawImage(img, sx || 0, sy || 0);
    this.origImg.imgData = this.ctx.getImageData(0, 0, this.width, this.height);
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
    return this.ctx.createImageData(this.origImg.imgData)
  };

  Cabbage.prototype.map = function(fn) {
    var x, y, cvsIndex, pixelIndex;
    for (var y = 0; y < this.height; y++) {
      for (var x = 0; x < this.width; x++) {
        pixelIndex = (y * this.width) + x;
        cvsIndex = x * 4 + y * this.width * 4;
        fn(x, y, pixelIndex, cvsIndex);
      }
    }
  };

  Cabbage.prototype.convolve = function(fn, size) {
    var cvsIndex, pixelIndex, matrix, size = size || 3;
    for (var y = 0; y < this.height; y++) {
      for (var x = 0; x < this.width; x++) {
        pixelIndex = (y * this.width) + x;
        cvsIndex = x * 4 + y * this.width * 4;
        matrix = this._getMatrix(x, y, size);
        fn(matrix, x, y, pixelIndex, cvsIndex);
      }
    }
  };

  // returns the default value (if defined, otherwise null)
  // or a pixel object
  Cabbage.prototype.getPixel = function(loc, defVal) {
    var index, coords;

    if (typeof loc === 'number') {
      index = loc;
      coords = this._convertToCoords(loc);
    } else {
      index =  this._convertToIndex(loc);
      coords = loc;
    }

    if (index < 0 || index > (this.currImg.data.length - 1)) {
      return defVal;
    } else {
      return new Pixel(coords.x, coords.y, this.currImg.data.slice(index, index + 4));
    }
  };

  Cabbage.prototype.setPixel = function(pixel, val) {
    var i = this._convertToIndex(pixel),
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
  }

  Cabbage.prototype.isOutOfBounds = function(coords) {
    return coords.x < 0 ||
           coords.x > this.width - 1 ||
           coords.y < 0 ||
           coords.y > this.height - 1;
  }

  Cabbage.prototype._convertToIndex = function(coords) {
    var m = 4;
    return (coords.x * m) + (coords.y * this.width * m);
  };

  Cabbage.prototype._convertToCoords = function(index) {
    var m = 4;
    return {
            x : (index % (this.width * m)) / m,
            y : Math.floor(index / (this.width * m))
           };
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

  Cabbage.prototype._getMatrix = function(cx, cy, size) {
    var matrix = [];
    for (var i = 0, y = -(size-1)/2; i < size; i++, y++) {
      matrix[i] = [];
      for (var j = 0, x = -(size-1)/2; j < size; j++, x++) {
        matrix[i][j] = (cx + x) * 4 + (cy + y) * that.width * 4;
      }
    }
    return matrix;
  };

  exports.Cabbage = Cabbage;
}(this));
