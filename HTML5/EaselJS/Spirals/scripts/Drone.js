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

/*
	Draws the graphics for the spiral
*/
function Drone(minRadius, maxRadius, strokeAlpha, spread)
{
	this.maxRadius = maxRadius;
	this.minRadius = minRadius;
	this.strokeAlpha = strokeAlpha;
	this.spread = spread;

	this.radius = this.minRadius;
	this.$draw();
}

Drone.prototype = new Shape();

Drone.prototype.reverse = false;
Drone.prototype.maxRadius = 50;
Drone.prototype.minRadius = 5;
Drone.prototype.radius = 5;
Drone.prototype.strokeAlpha = .2;
Drone.prototype.angle = 0;
Drone.prototype.spread = 0.5;

Drone.prototype.$draw = function()
{
	if(this.maxRadius != this.minRadius)
	{
		if(this.radius > this.maxRadius || this.radius < this.minRadius)
		{
			this.reverse = !this.reverse;
		}	
	
		var mod = (this.reverse)?-1:1;
	
		this.radius += mod;
	}
	
	var g = new Graphics();
	g.setStrokeStyle(1);
	//g.beginFill(Graphics.getRGB(0,0,0, 0.1));
	g.beginStroke(Graphics.getRGB(0, 0, 0, this.strokeAlpha));

	
	g.drawCircle(0,0,this.radius);
	
	//g.moveTo(0,0);
	//g.drawCircle(0,0,2);
	g.endFill();		
	
	this.graphics = g;
}

Drone.prototype.tick = function()
{
	this.update();
}

Drone.prototype.update = function()
{
	this.angle += .1;
	
	this.x += this.spread * this.angle * Math.cos(this.angle);
	this.y += this.spread * this.angle * Math.sin(this.angle);	
	
	this.$draw();
}