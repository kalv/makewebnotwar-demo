var Mwnw = {
  // Flag to know when being painted
  isPainting: false,
  // To be used by addClick to record the click position
  clickX: new Array(),
  clickY: new Array(),
  clickDrag: new Array(),
  // Buffer for sending out to other viewers
  linesDrawn: new Array(),
  // Will draw the canvas on to the application
  addCanvas: function() {
    var canvasDiv = document.getElementById('canvasContainer');
    canvas = document.createElement('canvas');
    canvas.setAttribute('id', 'theCanvas');
    canvas.setAttribute('width', 400);
    canvas.setAttribute('height', 300);
    canvas.setAttribute('id', 'canvas');
    canvasDiv.appendChild(canvas);
    if(typeof G_vmlCanvasManager != 'undefined') {
      canvas = G_vmlCanvasManager.initElement(canvas);
    }
    context = canvas.getContext("2d");
  },
  // used to record click information
  addClick: function(x, y, dragging) {
    Mwnw.clickX.push(x);
    Mwnw.clickY.push(y);
    Mwnw.clickDrag.push(dragging);
  },
  // Set up required mouse events
  captureMouseEvents: function() {

    // Capture the mouse down and call redraw to update the canvas
    $('#canvas').mousedown(function(e){
      var mouseX = e.pageX - this.offsetLeft;
      var mouseY = e.pageY - this.offsetTop;

      Mwnw.isPainting = true;
      Mwnw.addClick(e.pageX - this.offsetLeft, e.pageY - this.offsetTop);
      Mwnw.redraw();
    });

    // As the mouse moves and if paintin update the canvas
    $('#canvas').mousemove(function(e){
      if(Mwnw.isPainting){
        Mwnw.addClick(e.pageX - this.offsetLeft, e.pageY - this.offsetTop, true);
        Mwnw.redraw();
      }
    });

    // stop painting when mouse up
    $('#canvas').mouseup(function(e){
      Mwnw.isPainting = false;
      Mwnw.sendLinesDrawnToServer();
    });
  },
  redraw: function() {
    for(var i=0; i < Mwnw.clickX.length; i++)
    {
      var moveToX, moveToY;
      if(Mwnw.clickDrag[i] && i){
        moveToX = Mwnw.clickX[i-1];
        moveToY = Mwnw.clickY[i-1];
      } else {
       moveToX = Mwnw.clickX[i]-1;
       moveToY = Mwnw.clickY[i];
      }
      Mwnw.drawOnCanvas(moveToX, moveToY, Mwnw.clickX[i], Mwnw.clickY[i]);

      //
      Mwnw.linesDrawn.push({moveToX: moveToX, moveToY: moveToY, closeX: Mwnw.clickX[i], closeY:Mwnw.clickY[i]});
    }
  },
  // Have broken out this drawing so that data can be retrieved via websocket
  drawOnCanvas: function(moveToX, moveToY, closeX, closeY) {
    context.strokeStyle = "#333";
    context.lineJoin = "round";
    context.lineWidth = 2;

    context.beginPath();
    context.moveTo(moveToX, moveToY);
    context.lineTo(closeX, closeY);
    context.closePath();
    context.stroke();
  },
  // Connect to the Event source & Handle generic events
  connectToStream: function() {
    eventSource = new EventSource('/sse_endpoint');

    eventSource.addEventListener('open', function(e) {
      console.log("connection opened");
    }, false);

    eventSource.addEventListener('error', function(e) {
      if (e.eventPhase == EventSource.CLOSED) {
        // Connection was closed.
      }
    }, false);
  },
  // Only listen to answers from Server sent events
  listenForAnswers: function() {
    eventSource.addEventListener('answer', function(e) {
      console.log(e.data);
    }, false);
  },
  listenForNewLines: function() {
    eventSource.addEventListener('drawlines', function(e) {
      var lines = JSON.parse(e.data);
      for (var a = 0; a < lines.length; a++) {
        var line = lines[a];
        Mwnw.drawOnCanvas(line.moveToX, line.moveToY, line.closeX, line.closeY);
      };
    }, false);
  },
  sendLinesDrawnToServer: function() {
    $.post("/drawlines", {lines: JSON.stringify(Mwnw.linesDrawn)});
    Mwnw.linesDrawn = new Array(); // clear out old lines
  }
}

$(document).ready(function() {
  $("#draw").click(function() {
    Mwnw.addCanvas();
    Mwnw.captureMouseEvents();
    Mwnw.connectToStream();
    Mwnw.listenForAnswers();
    $("#playOptions").hide();
  });
  $("#guess").click(function() {
    Mwnw.addCanvas();
    Mwnw.connectToStream();
    Mwnw.listenForNewLines();
    $("#playOptions").hide();
  });
});