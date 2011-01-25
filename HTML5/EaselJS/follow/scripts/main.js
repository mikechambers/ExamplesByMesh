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

$(document).ready(init);

var stage;
var overlayStage;

var mainCanvas;

var canvasWrapper;
var canvasOverlayWrapper;
var canvasOffset;
var canvasOverlayOffset;

var drone;

var targetShape;
var lineShape;

var targetColor;
var lineGraphics;

//Simple object to store Mouse coordinates. Used to make
//it easy for other classes to access the data
var Mouse = {x:0,y:0};

//current touch id. -1 means there is no touch point currently.
var touchID = -1;

//temp object used to pass data to coordinate api
var tempData;

//called once the page has loaded
function init()
{
	//get a reference to the canvas element
	canvasWrapper = $("#mainCanvas");
	
	//check for canvas support
	if(!(!!document.createElement('canvas').getContext))
	{
		////document.createElement("article");
		canvasWrapper.html("<div>" +
			"It appears you are using a browser that does not support "+
			"the HTML5 Canvas Element</div>");
			
			//canvas isnt support, so dont continue
			return;
	}
			
	//get a reference to the actual canvas element
	mainCanvas = canvasWrapper.get(0);		
					
	//need to branch here, depending on whether we are on an iOS / Android
	// device (with touch), or on a desktop / mouse device
	//There may be a way to check specifically for touch, but right now, the touch
	//apis and support are so varied, it probably wouldnt be too useful.
	if(	(navigator.userAgent.match(/iPad/i) != null) ||
		(navigator.userAgent.match(/iPhone/i)) || 
		(navigator.userAgent.match(/iPod/i)) ||
		(navigator.userAgent.match(/Android/i))
		)
	{	
			//we are on a touch device
			//listen for touch events
			mainCanvas.ontouchstart = onTouchStart;
			mainCanvas.ontouchend = onTouchEnd;
			
			tempData = {};
	}
	else
	{
		//we are on a device with a mouse / pointer
		
		//we have to dynamically add the overlay canvas, because if we do it
		//in HTML, and then remove it for mobile devices, it causes all of
		//the drawing on the mobile devices to no be anti-aliased
		
		//create the overlayCanvas, and add it to the DOM after the main
		//canvas (which is specified in the HTML)
		 canvasWrapper.after(
			'<canvas id="overlayCanvas" width="600" height="400"></canvas>'
			);
			
		//overlay canvas used to draw target and line
		canvasOverlayWrapper = $("#overlayCanvas")	
			
		//color used to draw target and line
		targetColor = Graphics.getRGB(0,0,0,.1);
		
		//stage to manager the overlay canvas. Need to get the actual
		//element from the JQuery object.
		overlayStage = new Stage(canvasOverlayWrapper.get(0));		
		
		//listen for when the mouse moves
		canvasOverlayWrapper.mousemove(onMouseMove);
		
		//listen for a click event
		canvasOverlayWrapper.click(onMouseClick);
		
		//EaselJS Shape that is drawn at mouse point
		targetShape = new Target(targetColor);
		
		//Shape and graphic used to draw a line from the
		//Drone to the touch point
		lineShape = new Shape();
		
		//note: we redraw the graphic a lot, but just resuse the
		//same Graphics instance (by calling clear). This saves a LOT
		//of object creation
		lineGraphics = new Graphics();
		
		lineShape.graphics = lineGraphics;
	}
	
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
	
	//create our Drone instance that will
	//follow this mouse
	drone = new Drone();

	//position it just off the screen on the left
	drone.y = canvasWrapper.attr("height") / 2;
	drone.x = canvasWrapper.attr("width") / 2;
	
	//add the drone to the stage
	stage.addChild(drone);
	
	//render the stage
	stage.tick();

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

/************** touch events for iOS / Android **************/

//called when a user touches the screen.
//on iOS, there is full multitouch support, and this will be called
//for each touch point.
//on Android, there is only support for single touch.
function onTouchStart(e)
{
	//prevent default so iOS doesnt try to scale / move page
	e.preventDefault();

	//check and see if this is the first touch point
	if(touchID == -1)
	{
		//if not, get the touch
		var touch = e.changedTouches[0];
		
		//store the touch id
		touchID = touch.identifier;
		
		//unpause eveything
		Tick.setPaused(false);
		
		//start listening for the touch move event
		mainCanvas.ontouchmove = onTouchMove;
	}
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
		//check and see if any of the ended touch points
		//were the first touch point we began to track
		if(changedTouches[i].identifier == touchID)
		{
			//if so, then pause everything
			Tick.setPaused(true);
			
			//clear touchID
			touchID = -1;
			
			//stop listening for the touch move event
			mainCanvas.ontouchmove = null;
			
			return;
		}
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
	
	var touch;
	
	//whether we found the first touch point that we are tracking
	var found = false;
	
	//loop through all of the changed touch points
	for(var i = 0; i < len; i++)
	{
		touch = changedTouches[i];
		
		//is this the touch point we are tracking?
		if(touch.identifier == touchID)
		{
			//yes
			found = true
			break;
		}
	}
	
	if(!found)
	{
		//if we didnt find it, it means that the first touch point, that
		//we are tracking did not changed / move. Instead, a second touch point
		//which we dont care about moved.
		return;
	}
	
	//copy the coordinates into a temp object
	tempData.pageX = touch.pageX;
	tempData.pageY = touch.pageY;
	
	//update mouse / position coordinates
	updateMouseCoordinates(tempData);
}


/********************* Mouse Events *****************/

//called when the user clicks the mouse on the canvas
function onMouseClick(e)
{
	var pauseState = !Tick.getPaused();
	
	//toggle the Tick / Time paused state.
	Tick.setPaused(pauseState);
	
	//see if we are paused;
	if(pauseState)
	{
		//if so, remove the overlay graphics
		overlayStage.removeChild(targetShape);
		overlayStage.removeChild(lineShape);
	}
	else
	{
		//if not, update the mouse coordinates
		updateMouseCoordinates(e);
		
		//add overlay graphics
		overlayStage.addChild(targetShape);
		overlayStage.addChild(lineShape);
	}
	
	//update the overlay stage / canvas
	overlayStage.tick();
}

//called when the mouse is moved over the canvas
function onMouseMove(e)
{
	//update the Mouse position coordinates
	updateMouseCoordinates(e);
}

/************** general app functions *************/

//called at each time interval. This is essentially the listener
//for Tick.addListener
function tick()
{
	//update the main stage / canvas
	stage.tick();
	
	//check if we have an overlay stage
	if(overlayStage)
	{
		//update the overlay line
		updateLine();
		
		//rerender the overlay stage / canvas
		overlayStage.tick();
	}
}

//redraws the overlay line based on Mouse and Drone position
function updateLine()
{
	//clear previous line
	lineGraphics.clear();
	
	//stroke style
	lineGraphics.setStrokeStyle(1);
	
	//stroke color
	lineGraphics.beginStroke(targetColor);
	
	//draw line from Mouse position to Drone position
	lineGraphics.moveTo(Mouse.x, Mouse.y);
	lineGraphics.lineTo(drone.x, drone.y);
}

//function that updates the size of the canvas based on the window size
function updateCanvasDimensions()
{
	//note that changing the canvas dimensions clears the canvas.
	canvasWrapper.attr("height", $(window).height(true));
	canvasWrapper.attr("width", $(window).width(true));
	
	//save the canvas offset
	canvasOffset = canvasWrapper.offset();	
	
	//if we have an overlay canvas
	if(canvasOverlayWrapper)
	{
		//resize it
		canvasOverlayWrapper.attr("height", $(window).height(true));
		canvasOverlayWrapper.attr("width", $(window).width(true));
		canvasOverlayOffset = canvasOverlayWrapper.offset();
	}	
}

//update the mouse coordinates
function updateMouseCoordinates(e)
{
	//we store these in a global object so they can be easily accessed
	//from anywhere (other classes)
	Mouse.x = e.pageX - canvasOffset.left;
	Mouse.y = e.pageY - canvasOffset.top;
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

