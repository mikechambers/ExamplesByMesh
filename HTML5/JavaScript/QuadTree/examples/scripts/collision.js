var stage;
var circles;
var tree;

var CIRCLE_COUNT = 500;
var bounds;
var shape;
var fps;

function init()
{
	circles = [];
	
	canvas = document.getElementById("canvas");
	
	bounds = new Rectangle(0,0, canvas.width, canvas.height);
	
	stage = new Stage(canvas);
	shape = new Shape();
	tree = new QuadTree(bounds);
	
	fps = new Text();
	fps.x = 10;
	fps.y = 10;
	
	stage.addChild(fps);
	
	stage.addChild(shape);
	
	initCircles();
	
	stage.onMouseDown = function(e){
		tick();
	};
	
	stage.update();	
	
	Ticker.setFPS(24);
	Ticker.setPaused(true);
	Ticker.addListener(stage);
	Ticker.addListener(window);
}

function initCircles()
{
	var c;
	var g;
	var radius = 5;
	var x, y;
	
	//note, we are sharing the same graphics instance between all shape instances
	//this saves CPU and memory, but could lead to some weird bugs, so keep that in mind
	
	
	for(var i = 0; i < CIRCLE_COUNT; i++)
	{
		c = new Circle(bounds, radius);
		
		x = Math.random() * bounds.width;
		y = Math.random() * bounds.height;
		
		if(x + c.width > bounds.width)
		{
			x = bounds.width - c.width - 1;
		}
		
		if(y + c.height > bounds.height)
		{
			y = bounds.height - c.height - 1;
		}
		
		c.x = x;
		c.y = y;
		
		stage.addChild(c);
		circles.push(c);
		tree.insert(c);
	}
}

function updateTree()
{
	//todo: call clear
	tree = new QuadTree(bounds);
	
	for(var i = 0; i < CIRCLE_COUNT; i++)
	{
		tree.insert(circles[i]);
	}
}

function tick()
{	
	fps.text = Math.round(Ticker.getMeasuredFPS());
	for(var k = 0; k < CIRCLE_COUNT; k++)
	{
		circles[k].update();	
	}
	updateTree();
	
	
	renderQuad();
	var items;
	var c;
	var len;
	var item;
	var dx, dy, radii;
	var colliding = false;
	

	for(var i = 0; i < CIRCLE_COUNT; i++)
	{
		c = circles[i];

		items = tree.retrieve(c);
		len = items.length;
		for(var j = 0; j < len; j++)
		{
			item = items[j];
			
			if(c == item)
			{
				continue;
			}
			
			if(c.isColliding && item.isColliding)
			{
				continue;
			}
			
			dx = c.x - item.x;
			dy = c.y - item.y;
			radii = c.radius + item.radius;		
			
			colliding = (( dx * dx )  + ( dy * dy )) < (radii * radii);
			
			if(!c.isColliding)
			{
				c.setIsColliding(colliding);
			}
			
			if(!item.isColliding)
			{
				item.setIsColliding(colliding);
			}
		}
	}
	stage.update();
}

function renderQuad()
{
	var g = shape.graphics;
	g.clear();
	g.setStrokeStyle(1);
	g.beginStroke("#000000");
	
	drawNode(tree.root);
}

function drawNode(node)
{
	var bounds = node._bounds;
	var g = shape.graphics;

	g.drawRect(bounds.x, bounds.y, bounds.width, bounds.height);
	
	//console.log(node);
	/*
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
	*/
	var len = node.nodes.length;
	
	for(var i = 0; i < len; i++)
	{
		drawNode(node.nodes[i]);
	}
	
}

window.onload = init;