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

var quad;
var canvas;
var stage;
var shape;
var drawColor;

function init()
{
	canvas = document.getElementById("canvas");
	
	//prevent doublclicking on canvas from selecting text on the
	//page
	canvas.onselectstart = function () { return false; }
	
	stage = new Stage(canvas);
	shape = new Shape();
	stage.addChild(shape);

	drawColor = Graphics.getRGB(0,0,0);

	stage.onMouseUp = onMouseUp;
	
	quad = new QuadTree({
		x:0,
		y:0,
		width:canvas.width,
		height:canvas.height
	});
	
	//Ticker.addListener(window);
}

function tick()
{
	quad.insert({x:Math.random() * canvas.width, y:Math.random() * canvas.height});
	renderQuad();
}

function onMouseUp(e)
{
	quad.insert({x:e.stageX, y:e.stageY});
	renderQuad();
}

function renderQuad()
{
	var g = shape.graphics;
	g.clear();
	g.setStrokeStyle(1);
	g.beginStroke(drawColor);
	
	drawNode(quad.root);
	
	stage.update();
}

function drawNode(node)
{
	var bounds = node._bounds;
	var g = shape.graphics;

	g.drawRect(bounds.x, bounds.y, bounds.width, bounds.height);
	var cLen = node._children.length;
	if(cLen)
	{
		for(var j = 0; j < cLen; j++)
		{
			g.beginStroke(drawColor);
			g.drawCircle(node._children[j].x, node._children[j].y,3);
		}
	}
	
	
	if(!node._nodes)
	{
		return;
	}
	
	var len = node._nodes.length;
	
	for(var i = 0; i < len; i++)
	{
		drawNode(node._nodes[i]);
	}
	
}



window.onload = init;