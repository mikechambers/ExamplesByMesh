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

//simple class that exposes an api to make it easy to get
//data about individual pixels in an ImageData instance
function PixelData(imageData)
{
	this.imageData = imageData;
}

PixelData.prototype.imageData = null;

//returns an object with r,g,b,a properties with values
//with color information about the pixel as the specified coordinate.
PixelData.prototype.getRBGA = function(xPos, yPos)
{
	//copy imageData to a local variable to speed up access
	var imageData = this.imageData;
	
	if(!imageData)
	{
		//if there is no image data specified, just return an empty
		//object (black with 0 transparency)
		return {r:0,g:0,b:0,a:0};
	}

	//figure out the starting offset for the specified pixel
	var offset = (yPos * (imageData.width * 4)) + (xPos * 4);
	
	//red:0, green:1, blue:2, alhpa:3
	
	//copy the data into an object
	var out = {
				r:imageData.data[(offset)],
				g:imageData.data[(offset + 1)],
				b:imageData.data[(offset + 2)],
				a:imageData.data[(offset + 3)]
	};
				
	return out;
}

