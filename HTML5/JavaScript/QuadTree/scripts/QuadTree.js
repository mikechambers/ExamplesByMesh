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

(function(window) {

/****************** QuadTree ****************/

function QuadTree(bounds)
{	
	this.root = new Node(bounds)
}


QuadTree.prototype.root = null;

QuadTree.prototype.insert = function(item)
{
	this.root.insert(item);
}

QuadTree.prototype.clear = function()
{
	this.root.clear();
}

/************** Node ********************/


function Node(bounds, depth)
{
	this._bounds = bounds;
	this.children = [];
	this.nodes = [];
	
	if(depth)
	{
		this._depth = depth;
	}
}

//subnodes
Node.prototype.nodes = null;

//children contained directly in the node
Node.prototype.children = null;
Node.prototype._bounds = null;

//read only
Node.prototype._depth = 0;
Node.MAX_CHILDREN = 4;
Node.MAX_DEPTH = 6;

Node.TOP_LEFT = 0;
Node.TOP_RIGHT = 1;
Node.BOTTOM_LEFT = 2;
Node.BOTTOM_RIGHT = 3;


Node.prototype.insert = function(item)
{
	if(this.nodes.length)
	{
		var b = this._bounds;
		var left = (item.x > b.x + b.width / 2)? false : true;
		var top = (item.y > b.y + b.height / 2)? false : true;
		
		//top left
		var index = Node.TOP_LEFT;
		if(left)
		{
			//left side
			if(!top)
			{
				//bottom left
				index = Node.BOTTOM_LEFT;
			}
		}
		else
		{
			//right side
			if(top)
			{
				//top right
				index = Node.TOP_RIGHT;
			}
			else
			{
				//bottom right
				index = Node.BOTTOM_RIGHT;
			}
		}
		
		this.nodes[index].insert(item);
		
		return;
	}

	this.children.push(item);

	var len = this.children.length;
	if(!(this._depth >= Node.MAX_DEPTH) && 
		len > Node.MAX_CHILDREN)
	{
		this.subdivide();
		
		for(var i = 0; i < len; i++)
		{
			this.insert(this.children[i]);
		}
		
		this.children.length = 0;
	}
}

Node.prototype.subdivide = function()
{
	var depth = this._depth + 1;
	
	var bx = this._bounds.x;
	var by = this._bounds.y;
	var b_w_h = this._bounds.width / 2;
	var b_h_h = this._bounds.height / 2;
	var bx_b_w_h = bx + b_w_h;
	var by_b_h_h = by + b_h_h;
	
	//top left
	this.nodes[Node.TOP_LEFT] = new Node({
		x:bx, 
		y:by, 
		width:b_w_h, 
		height:b_h_h
	}, 
	depth);
	
	//top right
	this.nodes[Node.TOP_RIGHT] = new Node({
		x:bx_b_w_h,
		y:by,
		width:b_w_h, 
		height:b_h_h
	},
	depth);
	
	//bottom left
	this.nodes[Node.BOTTOM_LEFT] = new Node({
		x:bx,
		y:by_b_h_h,
		width:b_w_h, 
		height:b_h_h
	},
	depth);
	
	
	//bottom right
	this.nodes[Node.BOTTOM_RIGHT] = new Node({
		x:bx_b_w_h, 
		y:by_b_h_h,
		width:b_w_h, 
		height:b_h_h
	},
	depth);	
}

Node.prototype.clear = function()
{	
	this.children.length = 0;
	
	var len = this.nodes.length;
	for(var i = 0; i < len; i++)
	{
		this.nodes[i].clear();
	}
}

window.QuadTree = QuadTree;

}(window));