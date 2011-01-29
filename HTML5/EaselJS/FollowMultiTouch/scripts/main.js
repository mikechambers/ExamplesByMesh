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

x$(window).load(init);

var stage;
var canvas;

var canvasWrapper;
var canvasOffset = {top:0, left:0};

var drones = {length:0};
var lastDrone;

var image;

var PC = new PixelCanvas();

//viewport dimensions for container / browser
var viewport = {height:0, width:0};

//called once the page has loaded
function init()
{

	canvasWrapper = x$("#mainCanvas");

	//check for canvas support
	if(!Modernizr.canvas)
	{
		//todo : display hidden div
		////document.createElement("article");
		canvasWrapper.outer("<div>" +
			"It appears you are using a browser that does not support "+
			"the HTML5 Canvas Element</div>");
			
			//canvas isnt support, so dont continue
			return;
	}
	
	//todo: check for data- access
	
	/*	
	if(!Modernizr.touch)
	{
		canvasWrapper.outer("<div>" +
			"It appears you are using a browser that does not support "+
			"touch input.</div>");
			
			//touch isnt support, so dont continue
			return;
	}
	*/	
	
	x$(".imageButton").on("mousedown", onImageMouseDown);
}

function initCanvas()
{	
	//get a reference to the actual canvas element
	//todo: make sure this is the canvas element
	canvas = canvasWrapper[0];		
		
	//we are on a touch device
	//listen for touch events
	canvasWrapper.on("touchstart", onTouchStart);
	canvasWrapper.on("touchend", onTouchEnd);
	
	tempData = {};
	
	//listen for when the window looses focus
	x$(window).on("blur", onWindowBlur);
			
	//initialize the Stage instance with the Canvas. Note, 
	//canvasWrapper is a JQuery object, but stage expects
	//the actual Canvas element.
	stage = new Stage(canvas);
	
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

function onImageMouseDown(e)
{	
	x$(".imageButton").un("mousedown", onImageMouseDown);
	
	var t = e.target;
	x$(".imageButton").each(function(element, index, xui)
	{
	    if(element != t)
		{
			x$(element).setStyle("opacity", .5);
		}
	});

	image = e.target;
	
	initCanvas();
	updateCanvasDimensions();
		
	x$("#imageSelect").css({
			position:"absolute", 
			top:"0", 
			webkitTransform:"translate(0px,"+ -viewport.height+ "px)",
			opacity:0});
	
	
	x$("#imageSelect").on("webkitTransitionEnd", onIntroTransitionEnd);
}

function onIntroTransitionEnd(e)
{
	x$("#imageSelect").un("webkitTransitionEnd", onIntroTransitionEnd);
	x$("#imageSelect").remove();
	
	//listen for when the window resizes
	x$(window).on("resize", onWindowResize);
}

function scaleImageData()
{
	var h = image.height;
	var w = image.width;
	
	//resizing code from:
	//http://stackoverflow.com/questions/3448347/how-to-scale-an-imagedata-in-html-canvas/3449416#3449416
	//http://jsfiddle.net/Hm2xq/2/
	var srcCanvas = x$('<canvas>');
		srcCanvas.attr("height", h);
		srcCanvas.attr("width", w);

		//todo: make sure this is the element
	var context = srcCanvas[0].getContext("2d");
		context.drawImage(image, 0, 0);
	
	var tempData = context.getImageData(0, 0, w, h);
	
	var newCanvas = x$('<canvas>')
		.attr("width", tempData.width)
	    .attr("height", tempData.height)[0];
	
	newCanvas.getContext("2d").putImageData(tempData, 0, 0);
	
	var destCanvasWrapper = x$('<canvas>');
	var destCanvas = destCanvasWrapper[0];
	
	var dContext = destCanvas.getContext("2d");
	destCanvasWrapper.attr("height", viewport.height);
	destCanvasWrapper.attr("width", viewport.width);
	
	dContext.scale(
			viewport.height / h,
			viewport.width / w
		);
		
	dContext.drawImage(newCanvas, 0,0);
	
	var imageData = dContext.getImageData(0, 0, 
			destCanvas.width, 
			destCanvas.height
			);

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
		
		canvasWrapper.on("touchmove", onTouchMove);
		
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
		canvasWrapper.un("touchmove", onTouchMove);
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
	//only run if height / width has changed
	if(viewport.height == window.innerHeight &&
		viewport.width == window.innerWidth)
	{
			return
	}
	
	viewport.height = window.innerHeight;
	viewport.width = window.innerWidth;
	
	//note that changing the canvas dimensions clears the canvas.
	canvasWrapper.attr("height", viewport.height);
	canvasWrapper.attr("width", viewport.width);
	
	//keep for debugging on android
	//console.log([document.body.clientHeight, window.innerHeight, screen.availHeight]);// 618,613,748
	
	//save the canvas offset
	canvasOffset.left = canvasWrapper.attr("offsetLeft");
	canvasOffset.top = canvasWrapper.attr("offsetTop");
	
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
	var context = canvasWrapper[0].getContext("2d");
	
	//copy the image data from the current canvas
	var data = context.getImageData(0, 0,
			canvas.width,
			canvas.height);
	
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

