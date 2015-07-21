var chai = require('chai'),
    sinon = require('sinon'),
    sinonChai = require('sinon-chai'),
    expect = chai.expect,
    jsdom = require('jsdom').jsdom,
    document = jsdom('<html></html>', {}),
    window = document.defaultView;

var Cabbage = require('../js/cabbage').Cabbage,
    Pixel = require('../js/pixel').Pixel,
    cabbage;

global.Cabbage = Cabbage;
global.Pixel = Pixel;

chai.use(sinonChai);

describe('Cabbage', function(){
  describe('initialization', function() {
    setup(function(){
      document.getElementById = sinon.stub().returns({
        getContext: function(arg){
          return {
            drawImage: sinon.spy(),
            putImageData: sinon.spy(),
            getImageData: sinon.spy(),
            createImageData: sinon.spy(),
            fillRect: sinon.spy()
          };
        }
      });
      cabbage = new Cabbage('foo', 10, 10, document);
      // bypass _creatImage functionality which simply loads image via HTMLImageElement
      sinon.stub(cabbage, '_createImage', function(src, fn) {
        fn(src);
      });
    });

    describe('loadImg', function() {
      it('uses the x and y coordinates if provided', function() {
        var x = 5, y = 20;
        var imgSrc = 'foo.jpg';
        cabbage.loadImg(imgSrc, x, y);
        expect(cabbage.ctx.drawImage).to.have.been.calledWith(imgSrc, x, y);
      });

      it('draws image at the top left corner if no x and y coordinates provided', function() {
        var imgSrc = 'foo.jpg';
        cabbage.loadImg(imgSrc);
        expect(cabbage.ctx.drawImage).to.have.been.calledWith(imgSrc, 0, 0);
      });
    });
  });

  /*
  think of meaningful test
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

  describe('putImageData', function() {
  });
  */

  describe('manipulation', function() {
    var w = h = 3;
    var rgba = [0, 0, 0, 255];
    var defVal = 42;
    var coords = [{x: 0, y: 0}, {x: 1, y: 0}, {x: 2, y: 0},
                  {x: 0, y: 1}, {x: 1, y: 1}, {x: 2, y: 1},
                  {x: 0, y: 2}, {x: 1, y: 2}, {x: 2, y: 2}];

    setup(function(){
      var mockIDArr = [],
          size = w * h * 4;
      while (--size) mockIDArr[size] = defVal;
      cabbage = new Cabbage('foo', w, h, document);
      cabbage.currImg = {};
      cabbage.currImg.data = mockIDArr;
      sinon.stub(cabbage, '_createImage', function(src, fn) {
        fn({ width: w, height: h });
      });
      sinon.stub(cabbage, 'getCurrentImg', function() {
        return cabbage.currImg;
      });
    });

    describe('map', function() {
      it('provides the x and y coordinate as the 1st and 2nd argument to callback respectively', function() {
        cabbage.map(function(x, y, i) {
          expect(coords[i].x).to.equal(x);
          expect(coords[i].y).to.equal(y);
        });
      });

      it('provides the pixel index as the 3rd argument', function() {
        var i = 0;
        cabbage.map(function(x, y, pixelIndex) {
          expect(pixelIndex).to.equal(i);
          i++;
        });
      });

      it('provides the canvas image data array index as the last argument', function() {
        var i = 0;
        cabbage.map(function(x, y, pixelIndex, idIndex) {
          expect(idIndex).to.equal(i);
          i+=4;
        });
      });
    });

    describe('convolve', function() {
      it('provides the matrix as the first argument', function() {
        var mockMatrix = [[5, 5, 5],
                          [5, 0, 5],
                          [5, 5, 5]];
        sinon.stub(cabbage, '_getMatrix', function(x, y, size) {
          return mockMatrix;
        });
        cabbage.convolve(function(matrix) {
          expect(matrix).to.equal(mockMatrix);
        });
      });

      describe('provides the same set of arguments as #map after matrix', function() {
        it('provides x and y as the 2nd and 3rd argument', function() {
          var i = 0;
          cabbage.convolve(function(matrix, x, y) {
            expect(coords[i].x).to.equal(x);
            expect(coords[i].y).to.equal(y);
            i++;
          });
        });

        it('provides pixel index and image data array index as the 4th and 5th argument', function() {
          var i = j = 0;
          cabbage.convolve(function(matrix, x, y, pixelIndex, idIndex) {
            expect(pixelIndex).to.equal(i);
            expect(idIndex).to.equal(j);
            i++;
            j+=4;
          });
        });
      });
    });

    describe('getPixel', function() {
      describe('give no default value', function() {
        describe('given a coordinate', function() {
          it('returns a pixel object', function() {
            var pixel = cabbage.getPixel({x: 0, y: 2});
            expect(pixel).to.be.an.instanceOf(Pixel);
          });

          it('returns undefined if no pixel is found with that coordinate', function() {
            var pixel = cabbage.getPixel({x: -123, y: 2});
            expect(pixel).to.be.an('undefined');
          });
        });

        describe('given a number assumed to represent image data array index', function() {
          it('returns a pixel object', function() {
            var pixel = cabbage.getPixel(32);
            expect(pixel).to.be.an.instanceOf(Pixel);
          });

          it('returns undefined if no pixel is found with that index', function() {
            var pixel = cabbage.getPixel(-512);
            expect(pixel).to.be.an('undefined');
          });
        });
      });

      it('returns the default value if given', function() {
        var pixel = cabbage.getPixel(36, 255);
        expect(pixel).to.equal(255);
      });
    });

    describe('setPixel', function() {
      setup(function() {
        cabbage.ctx.fillRect = sinon.spy();
      });

      describe('given an associative array', function() {
        it('sets rgba value of appropriate image data array elements', function() {
          var pixel = new Pixel(0, 0, [0, 0, 0, 0]);
          cabbage.setPixel(pixel, {r: 123, g: 45, b: 100, a: 255});
          expect(cabbage.ctx.fillStyle).to.equal('rgba(123, 45, 100, 255)');
          expect(cabbage.ctx.fillRect).to.have.been.calledWith(0, 0, 1, 1);
        });
      });

      describe('given a number', function() {
        it('sets only the *rgb value* of image data array using number (for grayscaling) and leaves the alpha channel value unchanged', function() {
          var pixel = new Pixel(0, 0, [0, 0, 0, 0]);
          cabbage.setPixel(pixel, 144);
          expect(cabbage.ctx.fillStyle).to.equal('rgba(144, 144, 144, 42)');
          expect(cabbage.ctx.fillRect).to.have.been.calledWith(0, 0, 1, 1);
        });
      });
    });

    describe('isBorder', function() {
      it('returns true if pixel coordinate lies on top, bottom, left or right border', function() {
        var nwPixel = new Pixel(0, 0, rgba);
        var swPixel = new Pixel(0, 2, rgba);
        var nePixel = new Pixel(2, 0, rgba);
        var sePixel = new Pixel(2, 2, rgba);
        var nPixel = new Pixel(1, 0, rgba);
        var sPixel = new Pixel(1, 2, rgba);
        var ePixel = new Pixel(2, 1, rgba);
        var wPixel = new Pixel(0, 1, rgba);
        expect(cabbage.isBorder(nwPixel)).to.be.true;
        expect(cabbage.isBorder(swPixel)).to.be.true;
        expect(cabbage.isBorder(nePixel)).to.be.true;
        expect(cabbage.isBorder(sePixel)).to.be.true;
        expect(cabbage.isBorder(nPixel)).to.be.true;
        expect(cabbage.isBorder(sPixel)).to.be.true;
        expect(cabbage.isBorder(ePixel)).to.be.true;
        expect(cabbage.isBorder(wPixel)).to.be.true;
      });

      it('returns false if pixel is out of bounds', function() {
        var oobPixel1 = new Pixel(-1, 0, rgba);
        var oobPixel2 = new Pixel(2, 3, rgba);
        expect(cabbage.isBorder(oobPixel1)).to.be.false;
        expect(cabbage.isBorder(oobPixel2)).to.be.false;
      });

      it('returns false if pixel lies in the middle of image', function() {
        var midPixel = new Pixel(1, 1, rgba);
        expect(cabbage.isBorder(midPixel)).to.be.false;
      });
    });

    describe('isOutOfBounds', function() {
      it('returns true if pixel coordinate passed not a border or in the middle of the image', function() {
        var oobPixel1 = new Pixel(-1, 0, rgba);
        var oobPixel2 = new Pixel(2, 3, rgba);
        expect(cabbage.isOutOfBounds(oobPixel1)).to.be.true;
        expect(cabbage.isOutOfBounds(oobPixel2)).to.be.true;
      });

      it('returns false if pixel coordinate lies on the image border', function() {
        var nwPixel = new Pixel(0, 0, rgba);
        var swPixel = new Pixel(0, 2, rgba);
        var nePixel = new Pixel(2, 0, rgba);
        var sePixel = new Pixel(2, 2, rgba);
        var nPixel = new Pixel(1, 0, rgba);
        var sPixel = new Pixel(1, 2, rgba);
        var ePixel = new Pixel(2, 1, rgba);
        var wPixel = new Pixel(0, 1, rgba);
        expect(cabbage.isOutOfBounds(nwPixel)).to.be.false;
        expect(cabbage.isOutOfBounds(swPixel)).to.be.false;
        expect(cabbage.isOutOfBounds(nePixel)).to.be.false;
        expect(cabbage.isOutOfBounds(sePixel)).to.be.false;
        expect(cabbage.isOutOfBounds(nPixel)).to.be.false;
        expect(cabbage.isOutOfBounds(sPixel)).to.be.false;
        expect(cabbage.isOutOfBounds(ePixel)).to.be.false;
        expect(cabbage.isOutOfBounds(wPixel)).to.be.false;
      });

      it('returns false if pixel lies in the middle of image', function() {
        var midPixel = new Pixel(1, 1, rgba);
        expect(cabbage.isOutOfBounds(midPixel)).to.be.false;
      });
    });
  });

  // methods not meant to be called directly
  describe('private helpers', function() {
    var w = h = 5;
    var rgba = [0, 0, 0, 255];
    var defVal = 42;
    var bigImg;
    var expected = [[0, 4, 8, 12, 16],
                    [20, 24, 28, 32, 36],
                    [40, 44, 48, 52, 56],
                    [60, 64, 68, 72, 76],
                    [80, 84, 88, 92, 96]];

    setup(function(){
      var mockIDArr = [],
          size = w * h * 4;
      while (--size) mockIDArr[size] = defVal;
      bigImg = new Cabbage('foo', w, h, document);
      cabbage.currImg = {};
      cabbage.currImg.data = mockIDArr;
    });

    describe('_convertCoordsToIDIndex', function() {
      it('converts coordinates to image data array index (returns r value)', function() {
        // first pixel
        expect(cabbage._convertCoordsToIDIndex({x: 0, y: 0})).to.equal(0);
        // middle pixel in 3x3 (5th pixel from the first or 4 as it is base 0)
        expect(cabbage._convertCoordsToIDIndex({x: 1, y: 1})).to.equal(4*4);
      });

      it('throws an error when an invalid coordinate is given', function() {
        var message = 'Invalid coordinate. Unable to convert to image data index';
        expect(cabbage._convertCoordsToIDIndex({x: -23, y: 0})).to.throw(message);
        expect(cabbage._convertCoordsToIDIndex({x: 3, y: 2})).to.throw(message);
      });
    });

    describe('_convertCoordsToPixIndex', function() {
      /*
       _____________
       | 0 | 1 | 2 |
       |___|___|___|
       | 3 | 4 | 5 |
       |___|___|___|
       | 6 | 7 | 8 |
       |___|___|___|
       */
      it('converts coordinates to pixel index', function() {
        expect(cabbage._convertCoordsToPixIndex({x: 2, y: 2})).to.equal(8);
        expect(cabbage._convertCoordsToPixIndex({x: 0, y: 1})).to.equal(3);
      });

      it('throws an error when an invalid coordinate is given', function() {
        var message = 'Invalid coordinate. Unable to convert to pixel index';
        expect(cabbage._convertCoordsToPixIndex({x: 1000, y: 3})).to.throw(message);
        expect(cabbage._convertCoordsToPixIndex({x: 0, y: -1})).to.throw(message);
      });
    });

    describe('_convertIDIndexToCoords', function() {
      describe('given a multiple of 4', function() {
        it('converts image data index to coordinates', function() {
          expect(cabbage._convertIDIndexToCoords(32)).to.equal({x: 2, y: 2});
          expect(cabbage._convertIDIndexToCoords(16)).to.equal({x: 1, y: 1});
        });
      });

      describe('given an i % 4 > 0 and 0 < i < image data length (i.e. not an r but a g, b, or a value)', function() {
        it('converts image data index to coordinates', function() {
          expect(cabbage._convertIDIndexToCoords(29)).to.equal({x: 2, y: 2});
          expect(cabbage._convertIDIndexToCoords(17)).to.equal({x: 1, y: 1});
        });
      });

      it('throws an error when an invalid image data index is given', function() {
        var message = 'Invalid coordinate. Unable to convert to pixel index';
        expect(cabbage._convertIDIndexToCoords({})).to.throw(message);
        expect(cabbage._convertIDIndexToCoords(4.6)).to.throw(message);
      });
    });

    describe('_convertPixIndexToCoords', function() {
      it('converts pixel index to coordinates', function() {
        expect(cabbage._convertPixIndexToCoords(2)).to.throw({x: 2, y: 0});
        expect(cabbage._convertPixIndexToCoords(5)).to.throw({x: 1, y: 1});
      });

      it('throws an error when an invalid pixel index is given', function() {
        var message = 'Invalid coordinate. Unable to convert to coordinates';
        expect(cabbage._convertPixIndexToCoords(9)).to.throw(message);
        expect(cabbage._convertPixIndexToCoords(-42)).to.throw(message);
      });
    });

    describe('_convertIDIndexToPixIndex', function() {
      describe('given a multiple of 4', function() {
        it('converts image data index to pixel index', function() {
          expect(cabbage._convertIDIndexToPixIndex(32)).to.equal({x: 2, y: 2});
          expect(cabbage._convertIDIndexToPixIndex(16)).to.equal({x: 1, y: 1});
        });
      });

      describe('given an i % 4 > 0 and 0 < i < image data length (i.e. not an r but a g, b, or a value)', function() {
        it('converts image data index to pixel index', function() {
          expect(cabbage._convertIDIndexToPixIndex(29)).to.equal({x: 2, y: 2});
          expect(cabbage._convertIDIndexToPixIndex(17)).to.equal({x: 1, y: 1});
        });
      });

      it('throws an error when an invalid image data index is given', function() {
        var message = 'Invalid coordinate. Unable to convert to pixel index';
        expect(cabbage._convertIDIndexToPixIndex(undefined)).to.throw(message);
        expect(cabbage._convertIDIndexToPixIndex(36)).to.throw(message);
      });
    });

    describe('_convertPixIndexToIDIndex', function() {
      it('converts pixel index to image data index (starting with r value)', function() {
        expect(cabbage._convertPixIndexToIDIndex(0)).to.throw(0);
        expect(cabbage._convertPixIndexToIDIndex(5)).to.throw(16);
      });

      it('throws an error when an invalid pixel index is given', function() {
        var message = 'Invalid coordinate. Unable to convert to image data index';
        expect(cabbage._convertPixIndexToIDIndex('asdf')).to.throw(message);
        expect(cabbage._convertPixIndexToIDIndex(44)).to.throw(message);
      });
    });

    describe('_buildMatrix', function() {
      describe('when the matrix fits within the image', function() {
        it('returns a complete matrix of default 3x3 array', function() {
          var matrix = cabbage._buildMatrix(1, 1);
          expect(matrix).to.equal([[0, 4, 8],
                                   [12, 16, 20],
                                   [24, 28, 32]]);
        });

        it('returns a complete matrix of size 3 if given is too small or too big (max is 9)', function() {
          expect(cabbage._buildMatrix(1, 1, 13)).to.equal([[0, 4, 8],
                                                           [12, 16, 20],
                                                           [24, 28, 32]]);
          expect(cabbage._buildMatrix(1, 1, 1)).to.equal([[0, 4, 8],
                                                           [12, 16, 20],
                                                           [24, 28, 32]]);
        });

        it('returns a complete matrix of size n+1 if n%2 > 0', function() {
          var matrix1 = cabbage._buildMatrix(1, 1, 2);
          expect(matrix1).to.equal([[0, 4, 8],
                                    [12, 16, 20],
                                    [24, 28, 32]]);
          var matrix2 = cabbage._buildMatrix(2, 2, 4);
          expect(matrix2).to.equal(expected);
        });

        it('returns a matrix of size n given 3 <= n <= 9 and n % 2 == 1', function() {
          expect(bigImg._buildMatrix(2, 2, 5)).to.equal(expect);
        });
      });

      it('ignores parts that are out of bounds', function() {
        var matrix = cabbage._buildMatrix(0, 1);
        expect(matrix).to.equal([[undefined, undefined, undefined],
                                 [0, 4, 8],
                                 [12, 16, 20]]);
      });
    });
  });
});
