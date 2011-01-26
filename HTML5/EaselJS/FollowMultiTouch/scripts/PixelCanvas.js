function PixelCanvas(imageData)
{
	this.imageData = imageData;
}

PixelCanvas.prototype.imageData = null;

PixelCanvas.RED = 0;
PixelCanvas.GREEN = 1;
PixelCanvas.BLUE = 2;
PixelCanvas.ALPHA = 3;

PixelCanvas.prototype.getPixelRBG = function(xPos, yPos)
{
	var imageData = this.imageData;
	if(!imageData)
	{
		return Graphics.getRGB(0,0,0);
	}
	
	var w = imageData.width;
	
	var r = imageData.data[(
				(yPos * (w * 4)) + (xPos*4)) + PixelCanvas.RED
				];
				
	var g = imageData.data[(
				(yPos * (w * 4)) + (xPos*4)) + PixelCanvas.GREEN
				];
				
	var b = imageData.data[(
				(yPos * (w * 4)) + (xPos*4)) + PixelCanvas.BLUE
				];
				
	var a = imageData.data[(
				(yPos * (w * 4)) + (xPos*4)) + PixelCanvas.ALPHA
				];
				
	return {r:r,g:g,b:b,a:a};
}

