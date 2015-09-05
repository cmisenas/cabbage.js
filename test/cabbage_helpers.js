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

  // methods not meant to be called directly
  describe('private helpers', function() {
    var w, h;
    w = h = 5;
    var rgba = [0, 0, 0, 255];
    var defVal = 42;
    var bigImg, cabbage;

    setup(function(){
      var mockIDArr = [],
          size = w * h * 4;
      while (size--) mockIDArr.push(defVal);
      bigImg = new Cabbage('foo', w, h, document);
      bigImg.currImg = {};
      bigImg.currImg.data = mockIDArr;
      cabbage = new Cabbage('foo', 3, 3, document);
    });

    describe('_convertCoordsToIDIndex', function() {
      it('converts coordinates to image data array index (returns r value)', function() {
        // first pixel
        expect(cabbage._convertCoordsToIDIndex({x: 0, y: 0})).to.equal(0);
        // middle pixel in 3x3 (5th pixel from the first or 4 as it is base 0)
        expect(cabbage._convertCoordsToIDIndex({x: 1, y: 1})).to.equal(4*4);
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
    });

    describe('_convertIDIndexToCoords', function() {
      describe('given a multiple of 4', function() {
        it('converts image data index to coordinates', function() {
          expect(cabbage._convertIDIndexToCoords(32)).to.deep.equal({x: 2, y: 2});
          expect(cabbage._convertIDIndexToCoords(16)).to.deep.equal({x: 1, y: 1});
        });
      });

      describe('given an i % 4 > 0 and 0 < i < image data length (i.e. not an r but a g, b, or a value)', function() {
        it('converts image data index to coordinates', function() {
          expect(cabbage._convertIDIndexToCoords(29)).to.deep.equal({x: 1, y: 2});
          expect(cabbage._convertIDIndexToCoords(17)).to.deep.equal({x: 1, y: 1});
        });
      });
    });

    describe('_convertPixIndexToCoords', function() {
      it('converts pixel index to coordinates', function() {
        expect(cabbage._convertPixIndexToCoords(2)).to.deep.equal({x: 2, y: 0});
        expect(cabbage._convertPixIndexToCoords(5)).to.deep.equal({x: 2, y: 1});
      });
    });

    describe('_convertIDIndexToPixIndex', function() {
      describe('given a multiple of 4', function() {
        it('converts image data index to pixel index', function() {
          expect(cabbage._convertIDIndexToPixIndex(32)).to.deep.equal(8);
          expect(cabbage._convertIDIndexToPixIndex(16)).to.deep.equal(4);
        });
      });

      describe('given an i % 4 > 0 and 0 < i < image data length (i.e. not an r but a g, b, or a value)', function() {
        it('converts image data index to pixel index', function() {
          expect(cabbage._convertIDIndexToPixIndex(2)).to.deep.equal(0);
          expect(cabbage._convertIDIndexToPixIndex(17)).to.deep.equal(4);
          expect(cabbage._convertIDIndexToPixIndex(27)).to.deep.equal(6);
        });
      });
    });

    describe('_convertPixIndexToIDIndex', function() {
      it('converts pixel index to image data index (starting with r value)', function() {
        expect(cabbage._convertPixIndexToIDIndex(0)).to.equal(0);
        expect(cabbage._convertPixIndexToIDIndex(5)).to.equal(20);
      });
    });

    describe('_buildMatrix', function() {
      describe('when the matrix fits within the image', function() {
        it('returns a complete matrix of default 3x3 array', function() {
          var matrix = cabbage._buildMatrix(1, 1);
          var expected = [[0, 4, 8],
                          [12, 16, 20],
                          [24, 28, 32]];
          expect(matrix).to.deep.equal(expected);
        });

        it('returns a complete matrix of size 3 if given is too small or too big (max is 9)', function() {
          var expected1 = [[0, 4, 8],
                           [12, 16, 20],
                           [24, 28, 32]];
          var expected2 = [[0, 4, 8],
                           [12, 16, 20],
                           [24, 28, 32]];
          expect(cabbage._buildMatrix(1, 1, 13)).to.deep.equal(expected1);
          expect(cabbage._buildMatrix(1, 1, 1)).to.deep.equal(expected2);
        });

        it('returns a complete matrix of size n+1 if n%2 > 0 or max if n+1 > max or min if n+1 < min', function() {
          var expected1 = [[0, 4, 8],
                           [12, 16, 20],
                           [24, 28, 32]];
          /*
           _____________
           |   |   |   |
           |___|___|___|
           |   | n | n |
           |___|___|___|
           |   | n | * |
           |___|___|___|
           */
          var expected2 = [[16, 20, undefined],
                           [28, 32, undefined],
                           [undefined, undefined, undefined]]
          expect(cabbage._buildMatrix(1, 1, 2)).to.deep.equal(expected1);
          expect(cabbage._buildMatrix(2, 2, 4)).to.deep.equal(expected2);
        });

        it('returns a matrix of size n given 3 <= n <= 9 and n % 2 == 1', function() {
          var expected = [[0, 4, 8, 12, 16],
                          [20, 24, 28, 32, 36],
                          [40, 44, 48, 52, 56],
                          [60, 64, 68, 72, 76],
                          [80, 84, 88, 92, 96]];
          expect(bigImg._buildMatrix(2, 2, 5)).to.deep.equal(expected);
        });
      });

      it('ignores parts that are out of bounds', function() {
      /*
       _____________
       | n | n |   |
       |___|___|___|
       | * | n |   |
       |___|___|___|
       | n | n |   |
       |___|___|___|
       */
        var matrix = cabbage._buildMatrix(0, 1);
        var expected = [[undefined, 0, 4],
                        [undefined, 12, 16],
                        [undefined, 24, 28]];
        expect(matrix).to.deep.equal(expected);
      });
    });
  });
});
