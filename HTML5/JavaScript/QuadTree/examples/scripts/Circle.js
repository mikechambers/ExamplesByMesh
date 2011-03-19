function Circle(bounds, radius)
{
	Shape.call(this);
	
	this.snapToPixel = true;
	
	this._bounds = bounds;
	this.radius = radius;
	this.height = this.width = this.radius * 2;
	
	
	this._vx = Circle.MAX_SPEED * Math.random() + 1;
	
	//y velocity and direction
	this._vy = Circle.MAX_SPEED * Math.random() + 1;				
	
	//pick a random direction on x axis
	if(Math.random() > .5)
	{
		this._vx *= -1;
	}
	
	//pick a random direction on y axis
	if(Math.random() > .5)
	{
		this._vy *= -1;
	}
	
	this._draw();
}

Circle.prototype = new Shape();

Circle.prototype._bounds = null;
Circle.prototype._vx = 0;
Circle.prototype._vy = 0;
Circle.MAX_SPEED = 4;

Circle.prototype.height = 0;
Circle.prototype.width = 0;
Circle.prototype.radius = 0;
Circle.prototype.isColliding = false;

Circle.prototype.update = function()
{
	this.isColliding = false;
	
	this.x += this._vx;
	this.y += this._vy;
	
	if(this.x + this.width > this._bounds.width)
	{
		this.x = this._bounds.width - this.width - 1;
		this._vx *= -1;
	}
	else if(this.x < this._bounds.x)
	{
		this.x = this._bounds.x + 1;
		this._vx *= -1;
	}
	
	if(this.y + this.height > this._bounds.height)
	{
		this.y = this._bounds.height - this.height - 1;
		this._vy *= - 1;
	}
	else if(this.y < this._bounds.y)
	{
		this.y = this._bounds.y + 1;
		this._vy *= -1;
	}
}

Circle.prototype.setIsColliding = function(isColliding)
{
	this.isColliding = isColliding;
	this._draw();
}

Circle.prototype._collidingCacheCanvas = null;
Circle.prototype._normalCacheCanvas = null;
Circle.prototype._draw = function()
{
	if(this.isColliding)
	{
		if(this._collidingCacheCanvas)
		{
			this.cacheCanvas = this._collidingCacheCanvas;
			return;
		}
	}
	else
	{
		if(this._normalCacheCanvas)
		{
			this.cacheCanvas = this._normalCacheCanvas;
			return;
		}
	}
	
	var g = this.graphics;
	
	g.clear();
	g.setStrokeStyle(1);
	g.beginStroke("#000000");
	
	if(this.isColliding)
	{
		g.beginFill("FF0000");
	}
	else
	{
		g.beginFill("FFFFFF");
	}
	
	g.drawCircle(this.radius, this.radius, this.radius);
	
	this.uncache();
	this.cache(-1,-1, this.width + 2, this.height + 2);

	if(this.isColliding)
	{
		this._collidingCacheCanvas = this.cacheCanvas;
	}
	else
	{
		this._normalCacheCanvas = this.cacheCanvas;
	}
}

