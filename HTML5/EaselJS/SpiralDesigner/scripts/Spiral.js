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

function Spiral(bounds, radius, a)
{
	this.bounds = bounds;

	if(radius)
	{
		this.radius = radius;
	}
	
	if(a)
	{
		this.a = a;
	}
	
	this.color = Graphics.getRGB(255, 255, 255, .1);
	
	this.$draw();
}

Spiral.prototype = new Shape();

Spiral.prototype.angle = 0;
Spiral.prototype.bounds = null;
Spiral.prototype.radius = 20;
Spiral.prototype.a = 0.1;

Spiral.prototype.$draw = function()
{


	var g = new Graphics();
		g.setStrokeStyle(1);
		g.beginStroke(this.color)
		g.drawCircle(0,0, this.radius);
	
	this.graphics = g;
}

Spiral.prototype.tick = function()
{
	this.update();
}

Spiral.prototype.update = function()
{			
	var padding = this.radius * 2;
	
	if(this.x  < -padding ||
		this.y < -padding ||
		this.x > this.bounds.width + padding ||
		this.y > this.bounds.height + padding)
	{
		this.tick = undefined;
		return;
	}
	
	this.angle += .1;
	
	//algorithm based on:
	//http://stackoverflow.com/questions/344672/what-is-the-algorithm-for-storing-the-pixels-in-a-spiral-in-js
	
	this.x += this.a * this.angle * Math.cos(this.angle);
	this.y += this.a * this.angle * Math.sin(this.angle);	
	
	this.$draw();
}