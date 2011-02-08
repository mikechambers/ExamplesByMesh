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

//listen for when the window finishes loaded.
x$(window).load(init);

var stage;
var canvasWrapper;
var canvasOffset = {};

var drone;
var bounds;

var maxRadius = 5;
var minRadius = 50;
var strokeAlpha = .2;
var spread = 0.5;

//viewport dimensions for container / browser
var viewport = {height:0, width:0};

function init()
{
	//get a reference to the canvas element
	canvasWrapper = x$("#mainCanvas");
	
	if(!Modernizr.canvas)
	{
		canvasWrapper.outer("<div>It appears you are using a " +
			"browser which does not support the HTML5 Canvas element</div>");
		return;
	}	
	
	//update the dimensions of the canvas
	updateCanvasDimensions();
	
	bounds = new Rectangle();
	bounds.w = viewport.width;
	bounds.h = viewport.height;
	
	stage = new Stage(canvasWrapper[0]);
	stage.autoClear = false;
	
	//listen for when the window resizes
	x$(window).on("resize", onWindowResize);
	x$(window).on("blur", onWindowBlur);
	
	canvasWrapper.on("click", onMouseClick);
	
	//this block of code gets the params from the URL	
	var params = parseGetParams();
	
	var maxRadiusParam = params.maxradius;
	if(maxRadiusParam)
	{
		maxRadius = parseInt(maxRadiusParam);
	}
	
	var minRadiusParam = params.minradius;
	if(minRadiusParam)
	{
		minRadius = parseInt(minRadiusParam);
	}	
	
	var strokeAlphaParam = params.strokealpha;
	if(strokeAlphaParam)
	{
		strokeAlpha = parseFloat(strokeAlphaParam);
	}
	
	var spreadParam = params.spread;
	if(spreadParam)
	{
		spread = spreadParam;
	}
	
	drone = new Drone(minRadius, maxRadius, strokeAlpha, spread);
	drone.x = bounds.w / 2;
	drone.y = bounds.h / 2;
	
	stage.addChild(drone);
	
	stage.update();
	
	Ticker.setFPS(30);
	Ticker.addListener(window, true);
	Ticker.setPaused(true);
}

function onMouseClick(e)
{
	Ticker.setPaused(!Ticker.getPaused());
}

function onWindowBlur(e)
{
	Ticker.setPaused(true);
}

function tick()
{
	//render the stage
	stage.update();
}

//called when the browser window is resized
function onWindowResize(e)
{
	//update the canvas dimensions
	updateCanvasDimensions();
	
	//re-render the stage, since updating canvas size
	//clears the canvas
	stage.update();
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
	
	//set the new canvas dimensions
	//note that changing the canvas dimensions clears the canvas.
	canvasWrapper.attr("height", viewport.height);
	canvasWrapper.attr("width", viewport.width);
	
	//save the canvas offset
	canvasOffset.left = canvasWrapper.attr("offsetLeft");
	canvasOffset.top = canvasWrapper.attr("offsetTop");
}

function parseGetParams()
{
	var getData = new Array();
	var sGet = window.location.search;
	if (sGet)
	{
	    sGet = sGet.substr(1);

	    var sNVPairs = sGet.split("&");

	    for (var i = 0; i < sNVPairs.length; i++)
	    {

	        var sNV = sNVPairs[i].split("=");
	        
	        var sName = sNV[0];
	        var sValue = sNV[1];
	        getData[sName] = sValue;
	    }
	}
	
	return getData;
}