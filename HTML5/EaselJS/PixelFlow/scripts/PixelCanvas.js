function PixelCanvas(imageData)
{
	this.imageData = imageData;
}

PixelCanvas.prototype.imageData = null;

PixelCanvas.prototype.getPixelRBG = function(xPos, yPos)
{
	var imageData = this.imageData;
	if(!imageData)
	{
		return Graphics.getRGB(0,0,0);
	}

	var offset = (yPos * (imageData.width * 4)) + (xPos*4);
	
	//red:0, green:1, blue:2, alhpa:3
	
	var out = {
				r:imageData.data[(offset)],
				g:imageData.data[(offset + 1)],
				b:imageData.data[(offset + 2)],
				a:imageData.data[(offset + 3)]
	};
				
	return out;
}

