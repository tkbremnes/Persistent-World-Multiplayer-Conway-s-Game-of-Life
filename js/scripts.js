window.onload = init;

var canvas;
var ctx;
var canvasWidth;
var canvasHeight;
var cellSize;
var board;
var noOfCellsHorizontal;
var noOfCellsVertical;
var tickLength = 0.5;
var targetFramerate = 60;
var ticker;
var running;
var mousePosition;
var view;

function init(){
	canvas = document.querySelector('canvas');
	canvasWidth = canvas.width;
	canvasHeight = canvas.height;

	cellSize = 16;
	noOfCellsHorizontal = Math.floor(canvasWidth/cellSize);
	noOfCellsVertical = Math.floor(canvasHeight/cellSize);
	mousePosition = [];
	
	//initialize the empty board
	board = new Array(noOfCellsHorizontal);
	resetBoard();

	ctx = canvas.getContext('2d');

	canvas.addEventListener('mouseup', registerInput, false);
	canvas.addEventListener('mousemove', mouseOverInput, false);

	view = window.setInterval('drawBoard()', Math.round(60/targetFramerate));
	start();
	pause();
}

function resetBoard()
{
	for(var i=0; i<=noOfCellsHorizontal-1; i++)
	{
		board[i] = new Array(noOfCellsVertical);

		for(var j=0; j<=noOfCellsVertical-1; j++)
		{
			board[i][j] = 0;
		}
	}
}

function start()
{
	if(!running)
	{
		running = true;
		document.getElementById('status').innerHTML = "Running";
		drawBoard();
		ticker = window.setInterval('gameTick()', tickLength*1000);
	}
}

function pause(){
	if(running)
	{
		running = false;
		document.getElementById('status').innerHTML = "Paused";
		window.clearInterval(ticker);
	}
}

function drawGrid()
{
	ctx.strokeStyle = 'rgb(205,201,201)';
	ctx.lineWidth = 1;

	for(var i=0; i<=canvasWidth; i=i+cellSize){
		ctx.beginPath();
		ctx.moveTo(i,0);
		ctx.lineTo(i,canvasHeight);
		ctx.stroke();
	}

	for(var i=0; i<=canvasHeight; i=i+cellSize){
		ctx.beginPath();
		ctx.moveTo(0,i);
		ctx.lineTo(canvasWidth,i);
		ctx.stroke();
	}
}

function mouseOverInput(ev)
{
	var x, y;
	if(ev.offsetX || ev.offsetY == 0)
	{
		x = ev.offsetX;
		y = ev.offsetY;
	}
	mousePosition = [Math.floor(x/cellSize), Math.floor(y/cellSize)];
}

function registerInput(ev)
{
	var x, y;
  	if (ev.offsetX || ev.offsetX == 0)
  	{
   		x = ev.offsetX;
    	y = ev.offsetY;
  	}

  	doSomething(Math.floor(x/16), Math.floor(y/16));
}

function doSomething(x, y)
{
  	console.log("x: " + x + ", y: " + y);
	board[x][y] = 1;
}

function drawBoard()
{
	// redraw the frame
	ctx.fillStyle = 'rgb(255,255,255)';
	ctx.fillRect(0,0,canvasWidth, canvasHeight);

	// draw the helper grid
	drawGrid();

	// Draws the board
	ctx.fillStyle = 'rgb(0,0,0)';
	for(var i=0; i<=noOfCellsHorizontal-1; i++)
	{
		for(var j=0; j<=noOfCellsVertical-1; j++)
		{
			if(board[i][j] == 1){
				ctx.fillRect(i*cellSize,j*cellSize,cellSize,cellSize);
			}
		}
	}

	// paint the mouse position
	ctx.fillStyle = 'rgb(255,0,0)';
	ctx.fillRect(mousePosition[0]*cellSize, mousePosition[1]*cellSize, cellSize, cellSize);
}

function gameTick()
{
	var calc = [];
	for(var i=0; i<=noOfCellsHorizontal-1; i++)
	{
		for(var j=0; j<=noOfCellsVertical-1; j++)
		{
			numberOfNeighbours = getNumberOfNeighbours(i,j);
			if(board[i][j] == 1){
				if(numberOfNeighbours<2)
				{
					calc.push([i, j, 0]);

				}
				else if(numberOfNeighbours>=4){
					calc.push([i, j, 0]);
				}
			}
			else
			{
				if(numberOfNeighbours == 3)
				{
					calc.push([i, j, 1]);
				}
			}
		}
	}

	for(var i=0; i<calc.length; i++){
		board[calc[i][0]][calc[i][1]] = calc[i][2];
	}
}

function getNumberOfNeighbours(x,y)
{
	var result = 0;
	for(var i=-1; i<=1; i++)
	{
		for(var j=-1; j<=1; j++)
		{
			if((x+i>=0 && y+j>=0) && (x+i<=noOfCellsHorizontal-1 && y+j<=noOfCellsVertical-1))
			{
				if(board[x+i][y+j] == 1)
				{
					var xi = x+i;
					var yj = y+j;
//					console.log("(" + x + ", " + y + ") has a neighbour at (" + xi + ", " + yj + ")");
					result += 1;
				}
			}
		}
	}
	if(board[x][y]==1){
		result--;
	}
//	console.log("(" + x + ", " + y + ") has a total of " + result + " neighbours");
	return result;
}