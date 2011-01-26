/*
	The MIT License

	Copyright (c) 2011 Mike Chambers

	Permission is hereby granted, free of charge, to any person obtaining a copy
	of this software and associated documentation files (the "Software"), to deal
	in the Software without restriction, including without limitation the rights
	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the Software is
	furnished to do so, subject to the following conditions:

	The above copyright notice and this permission notice shall be included in
	all copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
	THE SOFTWARE.
*/

//when an item is removed, tween it down to its min size before removing


$(document).ready(init);

var stage;
var overlayStage;

var mainCanvas;

var canvasWrapper;
var canvasOffset;

var defaultDrone;

var targetShape;
var lineShape;

var targetColor;
var lineGraphics;

var drones = {length:0};
var lastDrone;

var image;

//called once the page has loaded
function init()
{
	//get a reference to the canvas element
	canvasWrapper = $("#mainCanvas");
	
	//check for canvas support
	if(!Modernizr.canvas)
	{
		////document.createElement("article");
		canvasWrapper.html("<div>" +
			"It appears you are using a browser that does not support "+
			"the HTML5 Canvas Element</div>");
			
			//canvas isnt support, so dont continue
			return;
	}
	
	/*		
	if(!Modernizr.touch)
	{
		canvasWrapper.replaceWith("<div>" +
			"It appears you are using a browser that does not support "+
			"touch input.</div>");
			
			//touch isnt support, so dont continue
			return;
	}		
	*/
	
	//get a reference to the actual canvas element
	mainCanvas = canvasWrapper.get(0);		
	
	image = new Image();
	image.onload = onImageLoad;
	//image.onerror = onImageError;
	image.src = "images/test_small.jpg";
	
	//we are on a touch device
	//listen for touch events
	mainCanvas.ontouchstart = onTouchStart;
	mainCanvas.ontouchend = onTouchEnd;
	
	tempData = {};

	//listen for when the window resizes
	$(window).resize(onWindowResize);
	
	//listen for when the window looses focus
	$(window).blur(onWindowBlur);	
		
	//update the dimensions of the canvas
	updateCanvasDimensions();
	
	//initialize the Stage instance with the Canvas. Note, 
	//canvasWrapper is a JQuery object, but stage expects
	//the actual Canvas element.
	stage = new Stage(mainCanvas);
	
	//set autoClear to false, so the stage is not
	//cleared between renders (when stage.tick()) is called
	stage.autoClear = false;	

	//set the tick interval to 24 frames per second.
	Tick.setInterval(1000/24);
	
	//listen for the tick event (time event)
	//note, the secound argument allows this listener
	//to be paused
	Tick.addListener(window, true);
	
	//pause the Tick instance, so it doesnt broadcast
	//the tick event. (We will unpause when the user clicks
	//the canvas)
	Tick.setPaused(true);
}

var PC = new PixelCanvas();

function onImageLoad(e)
{
	scaleImageData();
}

function scaleImageData2()
{
	//scale the image to fit the entire window
	image.style.width = $(window).width(true);
	image.style.height = $(window).height(true);
	
	var srcCanvas = $('<canvas>');
		srcCanvas.attr("height", $(window).height(true));
		srcCanvas.attr("width", $(window).width(true));

	var context = srcCanvas.get(0).getContext("2d");
		context.drawImage(image, 0, 0);
	
	var imageData = context.getImageData(0, 0, srcCanvas.attr("width"), srcCanvas.attr("height"));
	
	if(!PC)
	{
		PC = new PixelCanvas();
	}
	
	PC.imageData = imageData;
}

function scaleImageData()
{
	//resizing code from:
	//http://stackoverflow.com/questions/3448347/how-to-scale-an-imagedata-in-html-canvas/3449416#3449416
	//http://jsfiddle.net/Hm2xq/2/
	var srcCanvas = $('<canvas>');
		srcCanvas.attr("height", image.height);
		srcCanvas.attr("width", image.width);

	var context = srcCanvas.get(0).getContext("2d");
		context.drawImage(image, 0, 0);
	
	var tempData = context.getImageData(0, 0, image.width, image.height);
	
	var newCanvas = $('<canvas>')
		.attr("width", tempData.width)
	    .attr("height", tempData.height)[0];
	
	newCanvas.getContext("2d").putImageData(tempData, 0, 0);
	
	var destCanvas = $('<canvas>');
	
	var dContext = destCanvas.get(0).getContext("2d");
	destCanvas.attr("width", $(window).width(true));
	destCanvas.attr("height", $(window).height(true));
	
	dContext.scale(
			$(window).height(true) / image.height,
			$(window).width(true) / image.width
		);

	dContext.drawImage(newCanvas, 0,0);
	
	var imageData = dContext.getImageData(0, 0, destCanvas.attr("width"), destCanvas.attr("height"));

	if(!PC)
	{
		PC = new PixelCanvas();
	}
	
	PC.imageData = imageData;
}


/************** touch events for iOS / Android **************/

//called when a user touches the screen.
//on iOS, there is full multitouch support, and this will be called
//for each touch point.
//on Android, there is only support for single touch.
function onTouchStart(e)
{
	//prevent default so iOS doesnt try to scale / move page
	e.preventDefault();

	var startIndex = 0;
	var touch;
	var id;
	if(drones.length == 0)
	{
		touch = e.changedTouches[0];
		id = touch.identifier;
		
		mainCanvas.ontouchmove = onTouchMove;
		
		var t = {
			x:touch.pageX - canvasOffset.left,
			y:touch.pageY - canvasOffset.top
		};
		
		lastDrone = new Drone(t);
		lastDrone.x = t.x;
		lastDrone.y = t.y;
		
		addDrone(lastDrone, id);
		
		startIndex++;
	}

	var len = e.changedTouches.length;
	for(var i = startIndex; i < len; i++)
	{
		touch = e.changedTouches[i];
		id = touch.identifier;
		
		var d = lastDrone._clone();
			
		addDrone(d, id);
		
		lastDrone = d;
	}

	
	Tick.setPaused(false);
}

function addDrone(drone, id)
{
	var length = drones.length;
	
	if(drones[id])
	{
		return;
	}
	
	drones.length++;
	drones[id] = drone;
	
	stage.addChild(drone);
}

function removeDrone(id)
{
	if(!drones[id])
	{
		return;
	}
	
	var drone = drones[id];
	stage.removeChild(drone);
	
	delete drones[id];
	drones.length--;
	
	
}

//called when a touch ends on iOS and Android devices. (i.e. user lifts a finger
//from screen)
function onTouchEnd(e)
{
	//prevent default so iOS doesnt try to scale / move page
	e.preventDefault();
		
	//get a list of all the touch points that changed
	var changedTouches = e.changedTouches;
	
	//get the number of changed touch points
	var len = changedTouches.length;
	
	//loop through the changed touch points
	for(var i = 0; i < len; i++)
	{
		removeDrone(changedTouches[i].identifier);
	}
	
	if(drones.length == 0)
	{
		mainCanvas.ontouchmove = null;
		Tick.setPaused(true);
	}
}

//called on when a touch points moves (used on iOS / Android)
//devices.
//Note, Android only supports single touch. If there are multiple touch
//points, touchmove events will not be broadcast.
function onTouchMove(e)
{
	//prevent default so iOS doesnt try to scale / move page
	e.preventDefault();
	
	//get all of the touch points that changed / moved
	var changedTouches = e.changedTouches;
	
	//get the number of changed touch points
	var len = changedTouches.length;

	var target;
	var drone;
	var touch;
	//loop through all of the changed touch points
	for(var i = 0; i < len; i++)
	{		
		touch = changedTouches[i];
		drone = drones[touch.identifier];
		
		if(!drone)
		{
			continue;
		}
		
		drone.target.x = touch.pageX - canvasOffset.left;
		drone.target.y = touch.pageY - canvasOffset.top;
	}
}

/************** general app functions *************/

//called at each time interval. This is essentially the listener
//for Tick.addListener
function tick()
{
	//update the main stage / canvas
	stage.tick();
}

//function that updates the size of the canvas based on the window size
function updateCanvasDimensions()
{
	//note that changing the canvas dimensions clears the canvas.
	canvasWrapper.attr("height", $(window).height(true));
	canvasWrapper.attr("width", $(window).width(true));
	
	//save the canvas offset
	canvasOffset = canvasWrapper.offset();
	
	scaleImageData();	
}

/************** Window Events ************/

//called when the window looses focus
function onWindowBlur(e)
{
	//pause the Tick / time manager
	//this is so it doesnt keep drawing / using CPU
	//when the user switches away
	Tick.setPaused(true);
}

//called when the browser window is resized
function onWindowResize(e)
{
	//right now, the stage instance, doesnt expose the canvas
	//context, so we have to get a reference to it ourselves
	var context = canvasWrapper.get(0).getContext("2d");
	
	//copy the image data from the current canvas
	var data = context.getImageData(0, 0, 
			canvasWrapper.attr("width"), 
			canvasWrapper.attr("height"));
			
	//update the canvas dimensions since the window
	//has resized. Note that changing canvas dimensions, 
	//will cause it to be cleared
	updateCanvasDimensions();
	
	//copy the data back onto the resized canvas. It is possible
	//that if the previous canvas was larger than the newly sized one
	//that we will loose some pixels (as they will be cut off)
	context.putImageData(data, 0,0);
	
	//note, we only have to do this because we have stage.autoClear set
	//to false, otherwise, the stage instance could redraw the entire canvas
	
	//only rerender the stage if the Tick manager is not paused
	if(!Tick.getPaused())
	{
		//render stage
		stage.tick();
	}
}

