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
var box;
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
		document.ontouchend = onMouseClick;
		
		//replace Click with Touch
		info.innerHTML = info.innerHTML.replace("Click", "Foo");
	}
	else
	{
		//not touch, so use mouse events
		document.onclick = onMouseClick;
	}
}

function onMouseClick()
{
	if(box)
	{
		//remove existing box from dom
		document.body.removeChild(box);
	}
	
	//create the div
	box = document.createElement("div");
	box.className = "box";
	
	//add to dom
	document.body.appendChild(box);
	
	//position in middle / left of screen
	box.style.left = "10px";
	box.style.top = (window.innerHeight / 2) + "px";

	//set position we want div to animate to (using the CSS Transition)
	//NOTE : This will not animate, but will instead just be moved / drawn in the final position
	//need to delay this call by 1 ms
	box.style.left = (window.innerWidth - 100) + "px";
}

window.onload = init;