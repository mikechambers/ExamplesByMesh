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

var mousePos = {x:0, y:0};
var intervalId = 0;
function init()
{
	var info = document.getElementById("info");
	
	//check for support for CSS Transitions
	if(!Modernizr.csstransitions)
	{
		info.innerHTML = "<strong>The page requires support for CSS Transitions in order to run correctly. "+
			"Unfortunately, it appears that your browser does not support this features</strong>";
			
		return;
		
	}
		
	//figure out if we are on a touch device
	if(Modernizr.touch)
	{
		//touch so use touch events
		document.ontouchstart = onTouchStart;
		document.ontouchend = onTouchEnd;
		
		info.innerHTML = "Touch screen and move finger.";
	}
	else
	{
		//not touch, so use mouse events
		document.onmousedown = onMouseDown;
		document.onmouseup = onMouseUp;
	}
}

//timer for creating new divs. Probably should use requestAnimationFrame here
function onTick()
{
	var box = createBox();
	
	//note, if we try to animate the box right after we create it, it wont animate
	//that is why we have to wait 1 ms to try to animate it.
	setTimeout(animatePosition, 20, box, mousePos.x, mousePos.y);
}

//called when a touch point moves
function onTouchMove(e)
{
	//prevent default so we dont move / scroll the screen
	e.preventDefault();
	
	//we only support single touch. Get the touch point
	var touch = e.changedTouches[0];
	
	//update the mouse / point position
	updateMousePos(touch.pageX, touch.pageY);
}

//called when a touch point starts
function onTouchStart(e)
{
	//prevent default so page doesnt move / scroll
	e.preventDefault();
	
	//we only support single touch. Get the touch point
	var touch = e.changedTouches[0];
	
	//update the mouse position
	updateMousePos(touch.pageX, touch.pageY);
	
	//start listening for touch move events
	document.ontouchmove = onTouchMove;
	
	//start the timer to create new boxes
	startTimer();
}

//called when a touch point ends
function onTouchEnd(e)
{
	//prevent default so page doesnt move / scroll
	e.preventDefault();
	
	//stop listening for touch move events
	document.onTouchMove = null;
	
	//stop the timer / creating divs
	stopTimer();
}


//called when the mouse button is pressed
function onMouseDown(e)
{
	//update mouse position
	updateMousePos(e.pageX, e.pageY);
	
	//listen for mouse move event
	document.onmousemove = onMouseMove;
	
	//start the timer to create the dics
	startTimer();
}

//called when the mouse moves
function onMouseMove(e)
{
	//update mouse position
	updateMousePos(e.pageX, e.pageY);
}

//starts the timer (to create divs)
function startTimer()
{
	intervalId = setInterval(onTick, 10);
}

//stop the timer
function stopTimer()
{
	clearInterval(intervalId);
}

//called when the mouse button is released
function onMouseUp(e)
{
	//stop listening for mousemove event
	document.onmousemove = null;
	
	//stop timer / creating divs
	stopTimer();
}

//updates / stores mouse position
function updateMousePos(x, y)
{
	mousePos.x = x;
	mousePos.y = y;
}

//animates the specified div
function animatePosition(box, x, y)
{
	//make sure the mouse has moved from starting coords
	if(mousePos.x == 0 && mousePos.y == 0)
	{
		return;
	}
	
	
	//these are the properties the div will animate to
	box.style.opacity = "0.1";
	box.style.left = x + "px";
	box.style.top = y + "px";
	
	//The actual animation is controlled by the CSS
	//-webkit-transition: all 0.7s ease;
}

//creates a div (actually a circle)
function createBox()
{
	var box = document.createElement("div");
	box.className = "box";
	document.body.appendChild(box);
	
	//position in middle of screen
	box.style.left = (window.innerWidth / 2) + "px";
	box.style.top = (window.innerHeight / 2) + "px";
	
	return box;
}

window.onload = init;