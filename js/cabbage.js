;(function (exports) {
  var d = exports.document;
  var createCanvas = function(id, w, h) {
    // if the element was not found
    // the default behavior is to create a canvas
    // and make it the html body's first child
    var elem;
    elem = d.createElement('canvas');
    elem.id = id;
    elem.width = w;
    elem.height = h;
    d.body.insertBefore(elem, d.body.firstChild);
    return elem;
  }

  function Canvas(id, w, h, document) {
    d = d || document;
    this.elem = d.getElementById(id) || createCanvas(id, w, h);
    this.width = w || 600;
    this.height = h || 400;
    this.ctx = this.elem.getContext('2d');
    this.origImg = {};
  }

  Canvas.prototype.loadImg = function(img, sx, sy) {
    var that = this;
    var usrImg = new Image();

    usrImg.onload = function() {
      if (usrImg.width !== that.width || usrImg.height !== that.height) {
        that.width = usrImg.width;
        that.height = usrImg.height;
        that.elem.width = that.width;
        that.elem.height = that.height;
      }
      that.ctx.drawImage(usrImg, sx || 0, sy || 0);
      that.origImg.imgData = that.ctx.getImageData(0, 0, that.width, that.height);
    };
    usrImg.src = img;
  };

  Canvas.prototype.setImg = function(imgData) {
    this.ctx.putImageData(imgData, 0, 0);
  };

  /*
  // Delete image data; leave canvas blank
  Canvas.prototype.deleteImg = function() {
  };

  // Reset to original data
  Canvas.prototype.resetImg = function() {
  };
  */

  // returns the actual current image data
  Canvas.prototype.currentImg = function() {
    return this.ctx.getImageData(0, 0, this.width, this.height);
  };

  // returns a copy of original image data
  Canvas.prototype.originalImg = function() {
    return this.ctx.createImageData(this.origImg.imgData)
  };

  Canvas.prototype.map = function() {
    var i;
    for (var y = 0; y < this.height; y++) {
      for (var x = 0; x < this.width; x++) {
        i = x * 4 + y * this.width * 4;
        fn(i);
      }
    }
  };

  Canvas.prototype.convolve = function() {
    var i, matrix;
    for (var y = 0; y < this.height; y++) {
      for (var x = 0; x < this.width; x++) {
        i = x * 4 + y * this.width * 4;
        matrix = getMatrix(x, y, size);
        fn(i, matrix);
      }
    }
  };

  // returns the default value (if defined, otherwise null)
  // or a pixel object
  Canvas.prototype.getPixel = function(loc, defVal) {
    var index, coords;

    if (typeof loc === 'number') {
      index = loc;
      coords = this._convertToCoords(loc);
    } else {
      index =  this._convertToIndex(loc);
      coords = loc;
    }

    if (index < 0 || index (this.imgData.data.length/4 - 1)) {
      return defVal;
    } else {
      return new Pixel(index, coords.x, coords.y, this.imgData);
    }
  };

  /**
   Example:
   To set red = 200, green = 150, b = 30
   setPixel(5, {r: 200, g: 150, b: 30}, imgData);
   To set red, green and blue = 255 or white (i.e. gray level)
   setPixel(5, 255, imgData);
  **/
  Canvas.prototype.setPixel = function(pixel, val) {
    var id = this.ctx.createImageData(1, 1),
        i = this._convertToIndex(pixel.x, pixel.y);
    id.data[i] = typeof val == 'number'? val: val.r;
    id.data[i+1] = typeof val == 'number'? val: val.g;
    id.data[i+2] = typeof val == 'number'? val: val.b;
    // not sure of an effective way to set the A-value yet
    // but expected behavior when setting a pixel to a single value
    // is to simply set RGB (i.e. a gray value)
    id.data[i+3] = typeof val == 'number'? imgData.data[i+3]: val.a;
    this.ctx.putImageData(id, pixel.x, pixel.y);
  };

  Canvas.prototype.isBorder = function(coords) {
    var index = this._convertToIndex(coords);
    return (index - (this.width * 4)) <   0 ||
           (index % (this.width * 4)) === 0 ||
           (index % (this.width * 4)) === ((this.width * 4) - 4) ||
           (index + (this.width * 4)) >   (this.width * this.height * 4);
  }

  Canvas.prototype._convertToIndex = function(coords) {
    var m = 4;
    return (coords.x * m) + (coords.y * this.width * m);
  };

  Canvas.prototype._convertToCoords = function(index) {
    var m = 4;
    return {
            x : (index % (this.width * m)) / m,
            y : Math.floor(index / (this.width * m))
           };
  };

  Canvas.prototype._getMatrix = function(cx, cy, size) {
    var matrix = [];
    for (var i = 0, y = -(size-1)/2; i < size; i++, y++) {
      matrix[i] = [];
      for (var j = 0, x = -(size-1)/2; j < size; j++, x++) {
        matrix[i][j] = (cx + x) * 4 + (cy + y) * that.width * 4;
      }
    }
    return matrix;
  };

  exports.Canvas = Canvas;
}(this));
