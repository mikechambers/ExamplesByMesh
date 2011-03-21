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


QuadTree implementation in JavaScript.

Created by Mike Chambers
http://www.mikechambers.com
mikechambers@gmail.com

Currently supports mapping 2d coordinates and items with bounds.

http://www.mikechambers.com/blog/2011/03/21/javascript-quadtree-implementation/

There are a number of examples included which show different parts of using the tree.

examples/collision.html : Shows how to use the QuadTree to optimize collision detection of circles of multiple sizes

examples/insert.html : Shows how to insert points, and visually displays the nodes of the QuadTree.

examples/insert_bounds.html : Shows how to insert items with dimensions / bounds, and visually displays the nodes of the QuadTree.

examples/retrieve.html : Shows how to retrieve points in the same node as a specified point.

examples/retrieve_bounds.html : Shows how to retrieve items in the same node as a specified item with bounds. 



-------------Point QuadTree Example--------------
var pointQuad = true;
var bounds = {
			x:0,
			y:0,
			width:canvas.width,
			height:canvas.height
}
var quad = new QuadTree(bounds, pointQuad);

//insert a random point
quad.insert({x:12, y:25});

var items = quad.retrieve({x:11, y:20});
---------------------------------------------------


-------------Point QuadTree Example--------------
var bounds = {
			x:0,
			y:0,
			width:canvas.width,
			height:canvas.height
}
var quad = new QuadTree(bounds);

//insert a random point
quad.insert({
		x:12, 
		y:25,
		height:10,
		width:25});
		
var items = quad.retrieve({x:11, y:20, height:10, width:20});		
	
---------------------------------------------------
