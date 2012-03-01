var images = [];
var slideView;

var leftPos;
var centerPos;
var rightPos;
var currentIndex = 0;


function init()
{
	document.onclick = onClick;
	
	sliderView = document.getElementById("slider-view");
	
	var img = new Image();
	img.src= "images/1.png";
	img.className += " centerPos";
	
	centerPos = img;
	images[0] = img;
	
	var img2 = new Image();
	img2.src= "images/2.png";
	img2.className += " rightPos";
	rightPos = img2;
	images[1] = img2;
	
	var img3 = new Image();
	img3.src= "images/3.png";
	img3.className += " leftPos";
	leftPos = img3;
	images[2] = img3;
	
	var img4 = new Image();
	img4.src= "images/4.png";
	images[3] = img4;	
	
	sliderView.appendChild(images[0]);
	sliderView.appendChild(images[1]);
	sliderView.appendChild(images[2]);
}

function onClick(e)
{	
	centerPos.className = centerPos.className.replace(/(?:^|\s)centerPos(?!\S)/,'');
	centerPos.className += " leftPos";
	
	currentIndex++;
	if(currentIndex == images.length)
	{
		currentIndex = 0;
	}	
	
	rightPos.className = rightPos.className.replace(/(?:^|\s)rightPos(?!\S)/,'');
	
	if(leftPos)
	{
		
		/*
		leftPos.addEventListener("webkitTransitionEnd", function(e)
		{
			var img = e.target;
			//need to make sure this is being removed
			img.removeEventListener("webkitTransitionEnd", arguments.caller);
		});
		*/
		
		
		//should i remove this?
		//or just make it invisible?
		
		//this is what is cuasing the issue
		
		sliderView.removeChild(leftPos);
		
		/*
		leftPos.addEventListener("webkitTransitionEnd", function(e)
		{			
			var img = e.target;
			//need to make sure this is being removed
			img.removeEventListener("webkitTransitionEnd", arguments.caller);
		});
		*/
		
		leftPos.className = leftPos.className.replace(/(?:^|\s)leftPos(?!\S)/,'');
	}
	
	leftPos = centerPos;
	
	/*
	leftPos.addEventListener("webkitTransitionEnd", function(e)
	{
		var img = e.target;
		//need to make sure this is being removed
		img.removeEventListener("webkitTransitionEnd", arguments.caller);
	});
	*/	
	
	centerPos = rightPos;
	centerPos.className += " centerPos";

	var nextIndex = currentIndex + 1;
	if(nextIndex == images.length)
	{
		nextIndex = 0;
	}
	
	//need to check to see if it is on the dom yet
	//need to position it correctly.
	rightPos = images[nextIndex];
	rightPos.className += " rightPos";
	sliderView.appendChild(rightPos);
}


window.onload = init;