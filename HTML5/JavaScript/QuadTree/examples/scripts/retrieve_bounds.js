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
var pointShape;

function init()
{
	if(!(!!document.createElement('canvas').getContext))
	{
		var d = document.getElementById("canvasContainer");
		d.innerHTML = "This example requires a browser that supports the HTML5 Canvas element."
		return;
	}	
	
	canvas = document.getElementById("canvas");
	
	//prevent doublclicking on canvas from selecting text on the
	//page
	canvas.onselectstart = function () { return false; }
	
	stage = new Stage(canvas);
	shape = new Shape();
	pointShape = new Shape();
	stage.addChild(shape);
	stage.addChild(pointShape);

	drawColor = Graphics.getRGB(0,0,0);

	stage.onMouseUp = onMouseUp;
	
	quad = new QuadTree({
		x:0,
		y:0,
		width:canvas.width,
		height:canvas.height
	});
	
	initPoints();
	renderQuad();
}

function initPoints()
{
	var x,y;
	var w = 20;
	var h = 10;
	for(var i = 0; i < 250; i++)
	{
		x = Math.random() * canvas.width;
		y = Math.random() * canvas.height;
		
		//make sure our items dont outside of the top bounds
		//or else we have to end up doing extra checks
		if(x + w > canvas.width)
		{
			x = canvas.width - w - 2;
		}

		if(y + h > canvas.height)
		{
			y = canvas.height - h - 2;
		}

		quad.insert({
			x:x, 
			y:y,
			width:w,
			height:h});
	}
}

function onMouseUp(e)
{
	var points = quad.retrieve({
								x:e.stageX, 
								y:e.stageY, 
								width:50,
								height:25
	});
	
	renderPoints(points);
	//renderQuad();
}

function renderPoints(points)
{
	var len = points.length;
	var g = pointShape.graphics;
	g.clear();
	var point;
	for(var i = 0; i < len; i++)
	{
		point = points[i];
		g.beginStroke(drawColor);
		g.beginFill("#FF0000");
		g.drawRect(point.x, point.y, point.width, point.height);
		//g.drawCircle(point.x, point.y,3);
	}
	
	stage.update();
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
	
	//console.log(node);
	var children = node.getChildren();
	var cLen = children.length;
	var childNode;
	if(cLen)
	{
		for(var j = 0; j < cLen; j++)
		{
			childNode = children[j];
			g.beginStroke(drawColor);
			
			//draw rect
			g.drawRect(childNode.x, childNode.y, childNode.width, childNode.height);
			//g.drawCircle(childNode.x, childNode.y,3);
		}
	}
	
	var len = node.nodes.length;
	
	for(var i = 0; i < len; i++)
	{
		drawNode(node.nodes[i]);
	}
	
}



window.onload = init;