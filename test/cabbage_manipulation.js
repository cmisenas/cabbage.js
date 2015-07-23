var chai = require('chai'),
    sinon = require('sinon'),
    sinonChai = require('sinon-chai'),
    expect = chai.expect,
    jsdom = require('jsdom').jsdom,
    document = jsdom('<html></html>', {}),
    window = document.defaultView;

var Cabbage = require('../js/cabbage').Cabbage,
    Pixel = require('../js/pixel').Pixel;

global.Cabbage = Cabbage;
global.Pixel = Pixel;

chai.use(sinonChai);

describe('Cabbage', function(){
  setup(function() {
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
  });

  describe('manipulation', function() {
    var w, h;
    w = h = 3;
    var cabbage;
    var rgba = [0, 0, 0, 255];
    var defVal = 42;
    var coords = [{x: 0, y: 0}, {x: 1, y: 0}, {x: 2, y: 0},
                  {x: 0, y: 1}, {x: 1, y: 1}, {x: 2, y: 1},
                  {x: 0, y: 2}, {x: 1, y: 2}, {x: 2, y: 2}];

    setup(function(){
      var mockIDArr = [],
          size = w * h * 4;
      while (size--) mockIDArr.push(defVal);
      cabbage = new Cabbage('foo', w, h, document);
      cabbage.currImg = {};
      cabbage.currImg.data = mockIDArr;
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
        sinon.stub(cabbage, '_buildMatrix', function(x, y, size) {
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
      describe('given a coordinate', function() {
        it('returns a pixel object', function() {
          var pixel = cabbage.getPixel({x: 0, y: 2});
          expect(pixel).to.be.an.instanceOf(Pixel);
        });

        it('throws an error for invalid coordinate values', function() {
          var message = 'Invalid coordinate. Unable to convert to image data index';
          expect(function() { cabbage.getPixel({x: -123, y: 2}); }).to.throw(message);
        });
      });

      describe('given a number assumed to represent image data array index', function() {
        it('returns a pixel object', function() {
          var pixel = cabbage.getPixel(32);
          expect(pixel).to.be.an.instanceOf(Pixel);
        });

        it('throws an error if an invalid image data index is given', function() {
          var message = 'Invalid image data index. Unable to convert to coordinate';
          expect(function() { cabbage.getPixel(-512); }).to.throw(message);
        });
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
          expect(cabbage.ctx.fillStyle).to.equal('rgba(144, 144, 144, ' + defVal + ')');
          expect(cabbage.ctx.fillRect).to.have.been.calledWith(0, 0, 1, 1);
        });
      });
    });

    describe('isBorder', function() {
      it('returns true if pixel coordinate lies on top, bottom, left or right border', function() {
        var nwPixel = new Pixel(0, 0, rgba);
        var swPixel = new Pixel(0, 2, rgba);
        var nPixel = new Pixel(1, 0, rgba);
        var sPixel = new Pixel(1, 2, rgba);
        expect(cabbage.isBorder(nwPixel)).to.be.true;
        expect(cabbage.isBorder(swPixel)).to.be.true;
        expect(cabbage.isBorder(nPixel)).to.be.true;
        expect(cabbage.isBorder(sPixel)).to.be.true;
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
        var sePixel = new Pixel(2, 2, rgba);
        var sPixel = new Pixel(1, 2, rgba);
        var ePixel = new Pixel(2, 1, rgba);
        expect(cabbage.isOutOfBounds(nwPixel)).to.be.false;
        expect(cabbage.isOutOfBounds(sePixel)).to.be.false;
        expect(cabbage.isOutOfBounds(sPixel)).to.be.false;
        expect(cabbage.isOutOfBounds(ePixel)).to.be.false;
      });

      it('returns false if pixel lies in the middle of image', function() {
        var midPixel = new Pixel(1, 1, rgba);
        expect(cabbage.isOutOfBounds(midPixel)).to.be.false;
      });
    });
  });
});
