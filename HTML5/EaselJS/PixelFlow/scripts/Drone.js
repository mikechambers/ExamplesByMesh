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

//constructor for Drone
function Drone(target)
{
	this.target = (target)?target:{x:0,y:0};
	//set the radius to the default radius
	this.radius = Drone.DEFAULT_RADIUS;
		
	//set stroke color
	this.strokeColor = Graphics.getRGB(0, 0, 0, .3);
}

//extends EaselJS Shape
Drone.prototype = new Shape();

//How fast the drone moves
Drone.prototype.speed = 5;

Drone.prototype.target = null;

Drone.prototype.count = 0;

//temp object we use to pass around point data
//so we can reuse and dont have to keep reinstantiating
Drone.prototype.p2 = new Point(0,0);

//direction the radius tween is moving in
Drone.prototype.reverse = false;

//current radius
Drone.prototype.radius = 5;

//default radius
Drone.DEFAULT_RADIUS = 5;

//max radius
Drone.MAX_RADIUS = 50;

//determines whether radius increases (1) or
//decreases(-1)
Drone.prototype.mod = 1;

//graphics stroke color
Drone.prototype.strokeColor = null;

Drone.prototype._clone = function()
{
	var d = new Drone();
		this.cloneProps(d);
	
		d.target = {x:this.target.x, y:this.target.y};
		d.radius = this.radius;
		d.reverse = this.reverse;
		d.count = this.count;
		d.mod = this.mod;
		
	return d;
}

//draw function
Drone.prototype.$draw = function()
{
	//check to see if radius is over 50, or smaller
	//than the default radius, if it is, change the 
	//direction of the size tween.
	if(this.radius > Drone.MAX_RADIUS || this.radius < Drone.DEFAULT_RADIUS)
	{
		this.reverse = !this.reverse;
		
		//determine whether we should increase or
		//decrease radius size		
		this.mod = (this.reverse)?-1:1;
	}	

	//update the radius
	this.radius += this.mod;
	
	//create a new Graphics to draw our shape
	var g = new Graphics();
	
	//set the stroke to 1 px
	g.setStrokeStyle(1);
	
	//g.beginFill(this.fillColor);
	g.beginStroke(this.strokeColor);
	
	//some code to tween between colors (from Grant Skinner)
	//60 narrows the range, 180 determine where the color is
	/*
	g.beginFill(
		Graphics.getHSL(
			Math.cos((this.count++)*0.1) * 60 + 180, 
			100, 
			50, 
			1.0));
	*/
	
	var rgba = PD.getRBGA(Math.floor(this.x), Math.floor(this.y));
	
	g.beginFill(Graphics.getRGB(rgba.r, rgba.g, rgba.b, .5));
	//draw the circle
	g.drawCircle(0,0,this.radius);

	g.endFill();		
	
	//set the graphics property to our Graphics. This 
	//will be used the the Shape baseclass to render
	//our graphics
	this.graphics = g;
}

//called automatically since we subclass Shape.
//called at each time interval
Drone.prototype.tick = function()
{
	this.update();
}

Drone.prototype.update = function()
{				
	//copy our coordinates into the Point instance
	this.p2.x = this.x;
	this.p2.y = this.y;

	//get angle from enemy to target / ship
	var radians = MathUtil.getAngleBetweenPoints(this.target, this.p2);

	//determine velocity on x and y axis
	var vx = Math.cos(radians) * this.speed;
	var vy = Math.sin(radians) * this.speed;

	//update position
	this.x += vx;
	this.y += vy;

	//redraw
	this.$draw();
}