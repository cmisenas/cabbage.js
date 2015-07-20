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

