/*
	Ported by to JavaScript / EaselJS by Mike Chambers
	http://www.mikechambers.com
	
	Original ActionScript 1 code by
	Mario Klingemann
	http://www.quasimondo.com/archives/000110.php
*/

var stage;
var dots = [];
var PI = Math.PI;
var PI2 = 2 * PI;
var NUM_MAX = Number.MAX_VALUE;
var maxSpeed = 5;
var dotNum = 0;
var distance = [];
var sx = [];
var sy = [];
var ex = [];
var ey = [];
var INITIAL_DOT_COUNT = 20;
var fpsText;
var storageSize;

var drawColor = Graphics.getRGB(0,0,0,.7);
var dotRadius = 2;

function init()
{	
	canvas = document.getElementById("canvas");
	
	//so text on page isnt selected when canvas is doubleclicked
	canvas.onmousedown = function(e){
		e.preventDefault();
	};
	
	stage = new Stage(canvas);
	
	appW = canvas.width - 1;
	appH = canvas.height - 1;

	gOff = new Shape();
	stage.addChild(gOff);
	
	stage.onMouseUp = onMouseUp;
	
	fpsText = new Text();
	fpsText.color = drawColor;
	fpsText.x = 5;
	fpsText.y = 12;
	stage.addChild(fpsText);
	
	initDots();
	
	Ticker.setFPS(24);
	Ticker.addListener(window);
}

function tick() {
	movedot();
	setVoronoi();
	drawVoronoi();

	fpsText.text = (Math.round(Ticker.getMeasuredFPS())) + " fps";
	stage.update();	
}

function onMouseUp(e)
{
	addDot(e.stageX, e.stageY);
	storageSize++;
}

function initDots() {
	
	storageSize = INITIAL_DOT_COUNT + 4;
		
	for (var i=0; i<INITIAL_DOT_COUNT; i++) {
		addDot(Math.random()*appW, Math.random()*appH);
	}
}

function addDot(x, y) {
	
	var g = new Graphics();
	g.beginFill(drawColor);
	g.drawCircle(0,0,dotRadius);
	
	dots[dotNum] = {};
	dots[dotNum].x = x;
	dots[dotNum].y = y;
	dots[dotNum].angle = Math.random()*PI2;
	dots[dotNum].v = Math.random()*maxSpeed;
	
	var s = new Shape(g);
	s.cache(-dotRadius, -dotRadius, dotRadius * 2, dotRadius * 2);
	s.snapToPixel = true;
	
	dots[dotNum].m = s;
	stage.addChild(s);

	storage = dotNum+4;
	dotNum++;
}

function movedot() {
	var i, t;
	var a, s, x, y, cx, cy, vx, vy;
	var d;
	for (i=0; i<dotNum; i++) {
		d = dots[i];
		x = d.x;
		y = d.y;
		a = d.angle;
		s = d.v;
		vx = Math.cos(a)*s;
		vy = Math.sin(a)*s;
		x += vx;
		y += vy;
		if (x<3 || x>=appW-3 || y<3 || y>=appH-3) {
			if (x<3) {
				x = 3;
				vx *= -1;
			}
			if (x>appW-4) {
				x = appW-4;
				vx *= -1;
			}
			if (y<3) {
				y = 3;
				vy *= -1;
			}
			if (y>appH-4) {
				y = appH-4;
				vy *= -1;
			}
			d.angle = Math.atan2(vy, vx);
		}
		d.m.x = d.x=x;
		d.m.y = d.y=y;
		if (Math.random()<.1) {
			d.angle += Math.random()-.5;
		}
		if (Math.random()<.1) {
			d.v += Math.random()-.5;
			d.v = Math.max(0, Math.min(maxSpeed, Math.abs(d.v)));
		}
	}
}
function setVoronoi() {
	var i, j, k, m, n;
	var a, b, a0, b0, a1, b1, x, y, x0, y0, x1, y1;

	var dot;
	
	for (i=0; i<dotNum; i++) {
		dot = dots[i];
		x0 = dot.x;
		y0 = dot.y;
		n = i*storage+i+1;
		for (j=i+1; j<dotNum; j++) {
			x1 = dots[j].x;
			y1 = dots[j].y;
			if (x1 == x0) {
				a = 0;
			} else if (y1 == y0) {
				a = 10000;
			} else {
				a = -1/((y1-y0)/(x1-x0));
			}
			b = (y0+y1)/2-a*(x0+x1)/2;
			if (a>-1 && a<=1) {
				sx[n] = 0;
				sy[n] = a*sx[n]+b;
				ex[n] = appW-1;
				ey[n] = a*ex[n]+b;
			} else {
				sy[n] = 0;
				sx[n] = (sy[n]-b)/a;
				ey[n] = appH-1;
				ex[n] = (ey[n]-b)/a;
			}
			n++;
		}
		sx[n] = 0;
		sy[n] = 0;
		ex[n] = appW;
		ey[n] = 0;
		n++;
		sx[n] = .1;
		sy[n] = 0;
		ex[n] = 0;
		ey[n] = appH;
		n++;
		sx[n] = appW;
		sy[n] = 0;
		ex[n] = appW-.1;
		ey[n] = appH;
		n++;
		sx[n] = 0;
		sy[n] = appH;
		ex[n] = appW;
		ey[n] = appH;
	}
	
	var sxn, sxm, sym, exm, eym;
	
	for (i=0; i<dotNum; i++) {
		dot = dots[i];
		x0 = dot.x;
		y0 = dot.y;
		
		for (j=0; j<storageSize; j++) {
			if (j != i) {
				if (j>i) {
					n = i*storage+j;
				} else {
					n = j*storage+i;
				}
				
				sxn = sx[n];
				if (sxn>-NUM_MAX) {
					a0 = (ey[n]-sy[n])/(ex[n]-sxn);
					b0 = sy[n]-a0*sxn;
					for (k=i+1; k<storageSize; k++) {
						if (k != j) {
							m = i*storage+k;
							
							sxm = sx[m];
							sym = sy[m];
							exm = ex[m];
							eym = ey[m];
							
							if (sxm>-NUM_MAX) {
								a1 = (eym-sym)/(exm-sxm);
								b1 = sym-a1*sxm;
								x = -(b1-b0)/(a1-a0);
								y = a0*x+b0;
								if ((a0*x0+b0-y0)*(a0*sxm+b0-sym)<0) {
									sx[m] = x;
									sy[m] = y;
								}
								if ((a0*x0+b0-y0)*(a0*exm+b0-eym)<0) {
									if (sx[m] == x) {
										sx[m] = -NUM_MAX;
									} else {
										ex[m] = x;
										ey[m] = y;
									}
								}
							}
						}
					}
				}
			}
		}
	}
}
function drawVoronoi2(c) {
	var i, j, n;
	
	var g = gOff.graphics;
	g.clear();
	g.beginStroke(drawColor);
	var sxn;
	
	for (i=0; i<dotNum; i++) {
		n = i*storage+i+1;
		
		for (j=i+1; j<storage; j++) {
			sxn = sx[n];
			if (sxn > -NUM_MAX) {
				g.moveTo(sxn, sy[n]);
				g.lineTo(ex[n], ey[n]);
			}
			n++;
		}
	}
}

function drawVoronoi(c) {
	var i, j, n;
	
	var g = gOff.graphics;
	g.clear();
	g.beginStroke(drawColor);
	
	var sxn;
	
	for (i=0; i<dotNum; i++) {
		n = i*storage+i+1;
		for (j=i+1; j<storageSize; j++) {
			sxn = sx[n];
			
			if (sxn>-NUM_MAX) {
				g.moveTo(sxn, sy[n]);
				g.lineTo(ex[n], ey[n]);
			}
			n++;
		}
	}
}

window.onload = init;
