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
var canvasWrapper;
var canvasOffset;

var drone;

//Simple object to store Mouse coordinates. Used to make
//it easy for other classes to access the data
var Mouse = {x:0,y:0};


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
			
			return;
	}
		
	//update the dimensions of the canvas
	updateCanvasDimensions();
	
	//initialize the Stage instance with the Canvas. Note, 
	//canvasWrapper is a JQuery object, but stage expects
	//the actual Canvas element.
	stage = new Stage(canvasWrapper.get(0));
	
	//set autoClear to false, so the stage is not
	//cleared between renders (when stage.tick()) is called
	stage.autoClear = false;
	
	//listen for when the window resizes
	$(window).resize(onWindowResize);
	
	//listen for when the window looses focus
	$(window).blur(onWindowBlur);
			
	if(	(navigator.userAgent.match(/iPad/i) != null) ||
		(navigator.userAgent.match(/iPhone/i)) || 
		(navigator.userAgent.match(/iPod/i)) ||
		(navigator.userAgent.match(/Android/i))
		)
	{	
		var c = canvasWrapper.get(0);
			c.ontouchmove = onTouchMove;
			c.ontouchstart = onTouchStart;
			c.ontouchend = onTouchEnd;
	}
	else
	{
		//listen for when the mouse moves
		canvasWrapper.mousemove(onMouseMove);
		
		//listen for a click event
		canvasWrapper.click(onMouseClick);
	}
	
	
	//create our Drone instance, that will
	//follow our mouse
	drone = new Drone();

	//position it just off the screen on the left
	drone.y = canvasWrapper.attr("height") / 2;
	drone.x = canvasWrapper.attr("width") / 2;
	
	//add the drone to the stage
	stage.addChild(drone);
	
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

var touchID = -1;
function onTouchStart(e)
{
	e.preventDefault();

	if(touchID == -1)
	{
		var touch = e.changedTouches[0];
		
		touchID = touch.identifier;
		Tick.setPaused(false);
	}
}

function onTouchEnd(e)
{
	e.preventDefault();
		
	var changedTouches = e.changedTouches;
	var len = changedTouches.length;
	
	for(var i = 0; i < len; i++)
	{
		if(changedTouches[i].identifier == touchID)
		{
			Tick.setPaused(true);
			touchID = -1;
			return;
		}
	}
}

function onTouchMove(e)
{
	e.preventDefault();
	
	var changedTouches = e.changedTouches;
	var len = changedTouches.length;
	
	var touch;
	var found = false;
	for(var i = 0; i < len; i++)
	{
		touch = changedTouches[i];
		if(touch.identifier == touchID)
		{
			found = true
			break;
		}
	}
	
	if(!found)
	{
		return;
	}
	
	var data = {pageX:touch.pageX, 
				pageY:touch.pageY};
	
	updateMouseCoordinates(data);
}

//called when the user clicks the mouse on the canvas
function onMouseClick(e)
{
	//toggle the Tick / Time paused state.
	Tick.setPaused(!Tick.getPaused());
}

//called when the window looses focus
function onWindowBlur(e)
{
	//pause the Tick / time manager
	//this is so it doesnt keep drawing / using CPU
	//when the user switches away
	Tick.setPaused(true);
}

//called at each time inteval. This is essentially the listener
//for Tick.addListener
function tick()
{
	//check if we are paused
	if(!Tick.getPaused())
	{
		//if not, render the stage
		stage.tick();
	}
}

//called when the mouse is moved over the canvas
function onMouseMove(e)
{
	//update the Mouse position coordinates
	updateMouseCoordinates(touch);
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
		stage.tick();
	}
}

//function that updates the size of the canvas based on the window size
function updateCanvasDimensions()
{
	//note that changing the canvas dimensions clears the canvas.
	canvasWrapper.attr("height", $(window).height(true));
	canvasWrapper.attr("width", $(window).width(true));
	
	//save the canvas offset
	canvasOffset = canvasWrapper.offset();
}

//update the mouse coordinates
function updateMouseCoordinates(e)
{
	//we store these in a global object so they can be easily acccessed
	//from anywhere (other classes)
	Mouse.x = e.pageX - canvasOffset.left;
	Mouse.y = e.pageY - canvasOffset.top;
}