var canvas;
var stage;
var bounds;
var c1;
var c2;


function init()
{	
	if(!(!!document.createElement('canvas').getContext))
	{
		var d = document.getElementById("canvasContainer");
		d.innerHTML = "This example requires a browser that supports the HTML5 Canvas element."
		return;
	}	

	canvas = document.getElementById("canvas");
	bounds = new Rectangle(0,0, canvas.width, canvas.height);
	
	stage = new Stage(canvas);
	stage.onMouseMove = onMouseMove;
	
	c1 = new Circle(bounds, 25);
	c2 = new Circle(bounds, 25);
	
	c1.x = 400;
	c1.y = bounds.height / 2;
	
	stage.addChild(c1, c2);
	
	stage.update();	
	
	Ticker.setFPS(24);
	//Ticker.addListener(stage);
	Ticker.addListener(window);
}

function onMouseMove(e)
{
	c1.x = e.stageX - c1.height / 2;
	c1.y = e.stageY - c2.width / 2;
}

function tick()
{
	var dx = c1.x - c2.x;
	var dy = c1.y - c2.y;
	var radii = c1.radius + c2.radius;		
	
	var highlight = ( ( dx * dx )  + ( dy * dy ) < radii * radii );	

	c1.setIsColliding(highlight);
	c2.setIsColliding(highlight);
	
	c2.update();	
	
	stage.update();
}

window.onload = init;