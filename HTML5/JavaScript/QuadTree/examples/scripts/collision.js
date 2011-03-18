var stage;
var circles;
var tree;

var CIRCLE_COUNT = 20;
var bounds;

function init()
{
	circles = [];
	
	canvas = document.getElementById("canvas");
	
	bounds = new Rectangle(0,0, canvas.width, canvas.height);
	
	stage = new Stage(canvas);
	tree = new QuadTree(bounds);
	
	initCircles();
	
	stage.update();	
	
	Ticker.addListener(window);
}

function initCircles()
{
	var s;
	var g;
	var radius = 6;
	var x, y;
	
	//note, we are sharing the same graphics instance between all shape instances
	//this saves CPU and memory, but could lead to some weird bugs, so keep that in mind
	var g = new Graphics();
	g.setStrokeStyle(1);
	g.beginStroke("#000000");
	g.drawCircle(0,0, radius);	
	
	for(var i = 0; i < CIRCLE_COUNT; i++)
	{
		s = new Shape(g);

		s.height = radius * 2;
		s.width = radius * 2;
		
		x = Math.random() * bounds.width;
		y = Math.random() * bounds.height;
		
		if(x + s.width > bounds.width)
		{
			x = bounds.width - s.width - 1;
		}
		
		if(y + s.height > bounds.height)
		{
			y = bounds.height - s.height - 1;
		}
		
		s.x = x;
		s.y = y;
		
		stage.addChild(s);
		circles.push(s);
		tree.insert(s);
	}
}

function tick()
{
	var items;
	var c;
	var len;
	var item;
	var dx, dy, dist;
	for(var i = 0; i < CIRCLE_COUNT; i++)
	{
		c = circles[i];
		items = tree.retrieve(c);
		len = items.length;
		for(var j = 0; j < len; j++)
		{
			item = items[j];
			dx = (c.x + c.radius) - (item.x + item.radius);
			dy = (c.y + c.radius) - (item.y + item.radius);
			dist = Math.sqrt(dx * dx + dy * dy);
			
			if(dist < (c.radius + item.radius))
			{
				console.log("hit");
			}
			else
			{
				console.log("not hit");
			}
		}
	}
}

window.onload = init;