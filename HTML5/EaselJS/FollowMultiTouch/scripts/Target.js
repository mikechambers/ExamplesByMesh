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

function Target(color)
{
	this.color = color;
	this.$draw();
}

Target.prototype = new Shape();
Target.prototype.color = null;
Target.RADIUS = 4;

Target.prototype.$draw = function()
{
	var radius = Target.RADIUS;
	var g = new Graphics();
		g.setStrokeStyle(1);
		g.beginFill(this.color);
		g.beginStroke(this.color);
		
		//make sure circle is drawn within the Shapes bounds
		g.drawCircle(0, 0, radius);
		
	this.graphics = g;
	
	//since the graphic wont change any, cache it so it wont
	//have to be redrawn each time the canvas is rendered.
	this.cache(-radius, -radius, radius * 2, radius * 2);
}

Target.prototype.tick = function()
{
	this.x = Mouse.x;
	this.y = Mouse.y;
}