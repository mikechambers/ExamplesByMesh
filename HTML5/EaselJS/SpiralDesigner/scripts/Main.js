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

var bounds = {x:0,y:0, height:0, width:0};

var radius = 20;
var spread = 0.1;

var spirals;

function init()
{
	var params = parseGetParams();
	
	var radiusParam = params.radius;
	if(radiusParam)
	{
		radius = radiusParam;
	}
	
	var spreadParam = params.spread;
	if(spreadParam)
	{
		spread = spreadParam;
	}

	spirals = [];

	//get a reference to the canvas element
	canvasWrapper = $("#mainCanvas");
	canvasWrapper.click(onCanvasClick);
	
	//update the dimensions of the canvas
	updateCanvasDimensions();
	
	stage = new Stage(canvasWrapper.get(0));
	stage.autoClear = false;
	
	//listen for when the window resizes
	$(window).resize(onWindowResize);
	$(window).blur(onWindowBlur);
	$(window).focus(onWindowFocus);
		
	//24 frames a second
	Tick.setInterval(1000/24);
	Tick.addListener(window, true);
}

function onCanvasClick(e)
{
	var spiral = new Spiral(bounds, radius, spread);
	
	spiral.x = (e.pageX - canvasOffset.left);
	spiral.y = (e.pageY - canvasOffset.top);

	spirals.push(spiral);

	stage.addChild(spiral);
}

function onWindowBlur(e)
{
	Tick.setPaused(true);
}

function onWindowFocus(e)
{
	Tick.setPaused(false);
}

function tick()
{
	stage.tick();
}

//called when the browser window is resized
function onWindowResize(e)
{
	//update the canvas dimensions
	updateCanvasDimensions();
}

function updateCanvasDimensions()
{
	canvasWrapper.attr("height", $(window).height(true) - 5);
	canvasWrapper.attr("width", $(window).width(true));
	
	bounds.width = canvasWrapper.attr("width");
	bounds.height = canvasWrapper.attr("height");
	
	canvasOffset = canvasWrapper.offset();
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