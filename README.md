Cabbage.js
==========

Cabbage.js (from canvas + image, getit, gettit, no??) is a lightweight library for manipulating an HTML5 canvas.

HTML5 canvas stores image data as a 1-dimensional array with a pixel being four consecutive array elements (r, g, b and a)

With cabbage, simply pass the canvas element and refer to the pixel using x and y coordinates. You don't have to keep track of which pixel and value type you are on.

## Usage

### Initialization

You can initialize cabbage by passing in the **#id** of a `<canvas>` element

~~~ javascript
/*
 * <html><body><canvas id="canvas"></canvas></body></html>
 */
var cabbage = new Cabbage('canvas');
~~~

Alternatively, you can just pass in a string that is not used as an id by any other element. cabbage will create a `<canvas>` element for you and assign that as its #id.

~~~ javascript
/*
 * Before:
 * <html><body>emptiness</body></html>
 */
var cabbage = new Cabbage('canvas');
/*
 * After:
 * <html><body><canvas id="canvas"></canvas>emptiness</body></html>
 */
~~~

You can also pass in a specific width and height

~~~ javascript
var width = 600;
var height = 400;
var cabbage = new Cabbage('canvas', width, height);
~~~

Once you have an instance, you can now call `loadImg`

~~~ javascript
cabbage.loadImg('foo.jpg');
~~~

You can pass in an `x` and/or `y` where your images top-left corner should be drawn. By default it will be `0, 0`.

~~~ javascript
var x = 0, y = 5;
cabbage.loadImg('foo.jpg', x, y);
~~~


### Manipulation

With cabbage, you get the following `canvas.context` methods already defined:

  * `drawImage`

  * `putImageData`

The difference is that they store image data behind the scenes for easy access later.

cabbage also defines the following:

For iterating through the canvas element:

  * `map`

  * `convolve`

For manipulating at a pixel level:

  * `getPixel`

  * `setPixel`

For checking pixels:

  * `isBorder`

  * `isOutOfBounds`


TODO:

* [ ] Matrix convolution options similar to [gimp](http://docs.gimp.org/en/plug-in-convmatrix.html)

**ABOUT**

If cabbage looks like it has a very specific use case right now, that's probably cause it is. I decided to make this after doing a bunch of image manipulation implementations (search my repos for edge detection, bitmap-SVG conversion and image thresholding) and always ending up with a bunch of spaghetti. But really, what I want is cabbage, where I can run through the `ImageData` to do my calculations and not have to remember to`+=4` or maybe `+=3` or was it 2? I dunno. I also just wanted lightweight and didn't care about drawing lines or shapes. Maybe in the future? But not right now. Anyways, if you see something that should be part of cabbage, please send in a PR or your cabbage ideas. With that, I leave you this ever wonderful gif (it had to be done of course).

![](http://media.giphy.com/media/cAyCdHQ7rxh60/giphy.gif)
