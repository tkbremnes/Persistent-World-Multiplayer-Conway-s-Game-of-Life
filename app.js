var sys = require("sys"),  
    http = require("http").createServer(handler),  
    url = require("url"),  
    path = require("path"),  
    fs = require("fs"),
    io = require('socket.io').listen(http);  

http.listen(1337, "129.241.127.32");

function handler (request, response) {
  var uri = url.parse(request.url).pathname;
  if(uri=='/'){
    uri = '/index.html'
  }
  var filename = path.join(process.cwd(), uri);
  console.log("requesting " + uri);
  path.exists(filename, function(exists) {  
        if(!exists) {  
            response.writeHead(404, {"Content-Type": "text/plain"});  
            response.end("404 Not Found\n"); 
            return;  
        }  
  
        fs.readFile(filename, "binary", function(err, file) {  
            if(err) {  
                response.writeHead(500, {"Content-Type": "text/plain"});  
                response.end(err + "\n");  
                return;  
            }  
  
            response.writeHead(200);  
            response.end(file, "binary");  
            // response.close();  
        });  
    });
}


initGame();

var sct;
var numberOfConnections = 0;

io.sockets.on('connection', function (socket)
{
  numberOfConnections++;
  sct = socket;
//  socket.emit('news', { hello: 'world' });
  socket.emit('connections', {connections: numberOfConnections});
  socket.broadcast.emit('connections', {connections: numberOfConnections});
  
  socket.on('client_ready', function(data){
    console.log("ready signal received, sending init");
    socket.emit('init', {running: running, board: board, noOfCellsHorizontal: noOfCellsHorizontal, noOfCellsVertical: noOfCellsVertical, cellSize: cellSize});
  });

  socket.on('start', function (data)
  {
    console.log("starting simulation");
    start();
    socket.emit('status', { running: true });
    socket.broadcast.emit('status', { running: true });
  });

  socket.on('stop', function (data)
  {
    console.log("stopping simulation");
    pause();
    socket.emit('status', { running: false });
    socket.broadcast.emit('status', { running: false });
  });

  socket.on('click', function (data)
  {
    console.log("Click received at (" + data.x + ", " + data.y + ")");
    toggleCell(data.x, data.y);
    sct.broadcast.emit('receive_click', {x: data.x, y: data.y});
  });
});

io.sockets.on('disconnect', function(){
  numberOfConnections--;
  socket.broadcast.emit('connections', {connections: numberOfConnections});
  console.log("Disconnection");
});



//-------------
// Game code
//-------------
var cellSize;
var board;
var noOfCellsHorizontal;
var noOfCellsVertical;
var tickLength = 2;
var targetFramerate = 60;
var ticker;
var running;
var view;


function initGame(){
  console.log("Initializing game!");

  cellSize = 16;
  noOfCellsHorizontal = 25;
  noOfCellsVertical = 19;
  
  //initialize the empty board
  board = new Array(noOfCellsHorizontal);
  resetBoard();
//  start();
//  pause();
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
    ticker = setInterval(function(){
      gameTick();
      sct.emit('tick', 'tick');
      sct.broadcast.emit('tick', 'tick');
    }, tickLength*1000);
    
    synch = setInterval(function(){
      sct.emit('sync', {board: board});
    }, 5000);
  }
}

function pause(){
  if(running)
  {
    running = false;
    clearInterval(ticker);
  }
}

function toggleCell(x, y)
{
  if(x!=null && y!=null && x!='null' && y!='null' && (y<noOfCellsVertical && x<noOfCellsHorizontal) && (x>=0 && y>=0)){
    board[x][y] = 1;
    sct.emit('receive_click', {x: x, y: y});
  }
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
          result += 1;
        }
      }
    }
  }
  if(board[x][y]==1){
    result--;
  }
  return result;
}

function helloworld()
{
  console.log("Hello World!");
}