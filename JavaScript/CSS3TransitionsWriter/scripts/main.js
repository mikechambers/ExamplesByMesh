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

var drawingSurface;
var mousePos = {x:0, y:0};
var intervalId = 0;

var points = [];

function init()
{
	drawingSurface = document.getElementById("drawingSurface");
	
	
	if(Modernizr.touch)
	{
		document.ontouchstart = onTouchStart;
		document.ontouchend = onTouchEnd;
	}
	else
	{
		document.onmousedown = onMouseDown;
		document.onmouseup = onMouseUp;
	}
	
	
	document.onkeydown = onKeyDown;
}

function onTick()
{
	var box = createBox();

	setTimeout(animatePosition, 1, box, mousePos.x, mousePos.y);
}

function onTouchMove(e)
{
	e.preventDefault();
	
	var touch = e.changedTouches[0];
	updateMousePos(touch.pageX, touch.pageY);
}

function onTouchStart(e)
{
	e.preventDefault();
	
	var touch = e.changedTouches[0];
	updateMousePos(touch.pageX, touch.pageY);
	
	document.ontouchmove = onTouchMove;
	startTimer();
}

function onTouchEnd(e)
{
	e.preventDefault();
	document.onTouchMove = null;
	stopTimer();
}

function onMouseDown(e)
{
	updateMousePos(e.pageX, e.pageY);
	document.onmousemove = onMouseMove;
	startTimer();
}

function onMouseMove(e)
{
	updateMousePos(e.pageX, e.pageY);
}

function startTimer()
{
	intervalId = setInterval(onTick, 10);
}

function stopTimer()
{
	clearInterval(intervalId);
}

function onMouseUp(e)
{
	document.onmousemove = null;
	stopTimer();
}

function updateMousePos(x, y)
{
	mousePos.x = x;
	mousePos.y = y;
}

function animatePosition(box, x, y)
{
	
	if(x == 0 && y == 0)
	{
		return;
	}
	
	points.push({x:x, y:y});
	
	box.style.opacity = "0.1";
	box.style.left = x + "px";
	box.style.top = y + "px";
}

function onKeyDown(e)
{
	outputPoints();
	
	intervalId = setInterval(drawingTimer, 10);
}

var dataIndex = 0;
function drawingTimer()
{
	if(dataIndex >= data.length)
	{
		clearInterval(intervalId);
		return;
	}
	
	var point = data[dataIndex++];
	var box = createBox();
	
	setTimeout(animatePosition, 1, box, point.x, point.y);
	
	//clearInterval(intervalId);
}

function outputPoints()
{
	console.log(JSON.stringify(points));
}

function createBox()
{
	var box = document.createElement("div");
	box.className = "box";
	document.body.appendChild(box);
	
	box.style.left = (window.innerWidth / 2) + "px";
	box.style.top = window.innerHeight + "px";
	
	return box;
}

window.onload = init;