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


Stage.prototype.toImage = function(mimeType, backgroundColor)
{
	if(!mimeType)
	{
		mimeType = "image/png";
	}
	
	var ctx = this.canvas.getContext('2d');
	var w = this.canvas.width;
	var h = this.canvas.height;

	var data = ctx.getImageData(0, 0, w, h);		

	if(backgroundColor)
	{
		//store the current globalCompositeOperation
		var compositeOperation = ctx.globalCompositeOperation;

		//set to draw behind current content
		ctx.globalCompositeOperation = "destination-over";

		//set background color
		ctx.fillStyle = backgroundColor;

		//draw background on entire canvas
		ctx.fillRect(0,0,w,h);
	}

	//get the image data from the canvas
	var imageData = this.canvas.toDataURL(mimeType);

	if(backgroundColor)
	{
		//clear the canvas
		ctx.clearRect (0,0,w,h);

		//restore it with original settings
		ctx.putImageData(data, 0,0);		

		//reset the globalCompositeOperation to what it was
		ctx.globalCompositeOperation = compositeOperation;
	}
	
	return imageData;
}


x$(window).load(init);

var stage;
var canvas;
var canvasWrapper;
var canvasOffset = {top:0, left:0};
var drones = {length:0};
var lastDrone;
var image;
var hasTouchSupport = false;

var canvasOverlayWrapper;
var canvasOverlayOffset = {top:0, left:0};
var overlayStage;
var targetShape;
var lineShape;
var targetColor;
var lineGraphics;

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

	hasTouchSupport = Modernizr.touch;
	
	if(!hasTouchSupport)
	{
		//overlay canvas used to draw target and line
		canvasWrapper.after('<canvas id="overlayCanvas"></canvas>');
		canvasOverlayWrapper = x$("#overlayCanvas");
	}

	x$(".imageButton").on("mousedown", onImageMouseDown);
}

function initCanvas()
{	
	//get a reference to the actual canvas element
	//todo: make sure this is the canvas element
	canvas = canvasWrapper[0];		

	//initialize the Stage instance with the Canvas. Note, 
	//canvasWrapper is a JQuery object, but stage expects
	//the actual Canvas element.
	stage = new Stage(canvas);
	
	//set autoClear to false, so the stage is not
	//cleared between renders (when stage.tick()) is called
	stage.autoClear = false;		
		
	if(hasTouchSupport)
	{	
		//we are on a touch device
		//listen for touch events
		canvasWrapper.on("touchstart", onTouchStart);
		canvasWrapper.on("touchend", onTouchEnd);
		
		x$("#saveInstructionsSpan").inner("Touch and Hold to Save");	
	}
	else
	{
		
		x$("#saveInstructionsSpan").inner("Right Click to Save");	
		//listen for a click event
		canvasOverlayWrapper.on("click", onCanvasClick);
		
		//color used to draw target and line
		targetColor = Graphics.getRGB(0,0,0,.1);
		
		//stage to manager the overlay canvas. Need to get the actual
		//element from the JQuery object.
		overlayStage = new Stage(canvasOverlayWrapper[0]);		
		
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
	
	//listen for when the window looses focus
	x$(window).on("blur", onWindowBlur);	

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

function onCanvasClick(e)
{
	var paused = !Tick.getPaused();
	
	Tick.setPaused(paused);
	
	//see if we are paused;
	if(paused)
	{
		canvasOverlayWrapper.un("mousemove", onMouseMove);

		overlayStage.removeChild(targetShape);
		overlayStage.removeChild(lineShape);
	}
	else
	{	
		Tick.setPaused(false);
		
		if(lastDrone)
		{
			stage.removeChild(lastDrone);
		}
		
		var t = {
			x:e.pageX - canvasOffset.left,
			y:e.pageY - canvasOffset.top
		};		
		
		lastDrone = createNewDroneOnPoint(t);
							
		stage.addChild(lastDrone);
		
		overlayStage.addChild(targetShape);
		overlayStage.addChild(lineShape);
		
		targetShape.x = t.x;
		targetShape.y = t.y;
		
		canvasOverlayWrapper.on("mousemove", onMouseMove);
		
		overlayStage.tick();
	}

	overlayStage.tick();
}

function createNewDroneOnPoint(t)
{
	var d = new Drone(t);
	d.x = t.x;
	d.y = t.y;
	return d;
}

//called when the mouse is moved over the canvas
function onMouseMove(e)
{
	targetShape.x = lastDrone.target.x = e.pageX + canvasOffset.left;
	targetShape.y = lastDrone.target.y = e.pageY + canvasOffset.top;
}

function onImageMouseDown(e)
{	
	x$(".imageButton").un("mousedown", onImageMouseDown);

	image = e.target;
	
	x$("#thumbImage").attr("src", image.src);
	
	updateCanvasDimensions();
	initCanvas();	
		
	var divXUI = x$("#imageSelect");
	//console.log(divXUI.getStyle("padding-top"));
	
	//note the 50 constant below is the top-padding style for the div, set in the stylesheet.
	divXUI.css({
			position:"absolute", 
			top:"0",
			webkitTransform:"translate(0px,"+ -(viewport.height + 50) + "px)"});
	
	divXUI.on("webkitTransitionEnd", onIntroTransitionEnd);
}

function onIntroTransitionEnd(e)
{
	x$("#imageSelect").un("webkitTransitionEnd", onIntroTransitionEnd);
	x$("#imageSelect").remove();
	
	var bottomXUI = x$("#bottomBar");
	bottomXUI.css({bottom:"2%"});
	
	var topXUI = x$("#topBar");
	topXUI.css({top:"2%"});	
	
	bottomXUI.on("webkitTransitionEnd", onBottomBarTransitionEnd);
}

function onBottomBarTransitionEnd(e)
{
	//listen for when the window resizes
	x$(window).on("resize", onWindowResize);
	
	
	x$(".bottomButton").on("click", onBottomButtonClick);
}

function onBottomButtonClick(e)
{
	var action = e.target.getAttribute("data-button");
	
	switch(action)
	{
		case "SAVE":
		{
			saveImage();
			break;
		}
		case "BACK":
		{
			break;
		}
		case "CLEAR":
		{
			stage.clear();
			break;
		}
	}
}

function saveImage()
{		
	var imageData = stage.toImage("image/png", "#FFFFFF");
	
	//dont start transition until image has loaded. This is mostly
	//for smart phones, tablets, which might take a second to process the data
	//we dont want to image to tween in before it has loaded.
	x$("#saveImage").on("load", onSaveImageLoad);
	x$("#saveImage").attr("src", imageData);
	
	x$("#modalDiv").setStyle("display","block");
}

function onCloseSavePanelClick(e)
{
	x$("#savePanelCloseLink").un("click", onCloseSavePanelClick);
	
	
	x$("#modalDiv").setStyle("opacity",0.0);
	x$("#modalDiv").on("webkitTransitionEnd", onModalTransitionEnd);
	
	x$("#savePanel").css({
			webkitTransform:"translate("+ 0 +"px,0px)"
			});
			
	x$("#savePanel").on("webkitTransitionEnd", onSaveCloseTransitionEnd);
}

function onModalTransitionEnd(e)
{
	//have to set display to none, or else it will capture mouse click
	x$("#modalDiv").setStyle("display","none");
	x$("#modalDiv").un("webkitTransitionEnd", onModalTransitionEnd);
}

function onSaveCloseTransitionEnd(e)
{
	var saveImage = x$("#saveImage");
	
	saveImage.un("load", onSaveImageLoad);
	x$("#savePanel").un("webkitTransitionEnd", onSaveCloseTransitionEnd);
	saveImage.attr("src", "");
}

function onSaveImageLoad(e)
{
	x$("#saveImage").un("load", onSaveImageLoad);
	x$("#savePanelCloseLink").on("click", onCloseSavePanelClick);
	
	//we cant set this above, when we set the display:box style, as it will go
	//straight to opacity 1.0 without the CSS transition kicking in
	x$("#modalDiv").setStyle("opacity",1.0);
	
	x$("#savePanel").css({
			webkitTransform:"translate("+ -((viewport.width / 2) + 150) +"px,0px)"
			});
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
	
	destCanvasWrapper.attr("height", viewport.height);
	destCanvasWrapper.attr("width", viewport.width);
	
	var dContext = destCanvas.getContext("2d");
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
		
		lastDrone = createNewDroneOnPoint(t);
		
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
	
	if(canvasOverlayWrapper)
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
	
	lineGraphics.moveTo(targetShape.x, targetShape.y);
	lineGraphics.lineTo(lastDrone.x, lastDrone.y);
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
	
	if(canvasOverlayWrapper)
	{
		canvasOverlayWrapper.attr("height", viewport.height);
		canvasOverlayWrapper.attr("width", viewport.width);	
		
		//todo: get direct properties
		canvasOverlayOffset.left = canvasOverlayWrapper.attr("offsetLeft");
		canvasOverlayOffset.top = canvasOverlayWrapper.attr("offsetTop");
	}
	
	
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

