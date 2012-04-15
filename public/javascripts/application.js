var Mwnw = {
  // Flag to know when being painted
  isPainting: false,
  // To be used by addClick to record the click position
  clickX: new Array(),
  clickY: new Array(),
  clickDrag: new Array(),
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
    console.log("Canvas added");
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
    }
  },
  // Have broken out this drawing so that data can be retrieved via websocket
  drawOnCanvas: function(moveToX,moveToY, closeX, closeY) {
    var canvas = $("canvas");

    context.strokeStyle = "#333";
    context.lineJoin = "round";
    context.lineWidth = 2;

    context.beginPath();
    context.moveTo(moveToX, moveToY);
    context.lineTo(closeX, closeY);
    context.closePath();
    context.stroke();
  },
  connectToStream: function() {
    var source = new EventSource('/sse_endpoint');

    source.addEventListener('answer', function(e) {
      console.log(e.data);
    }, false);

    source.addEventListener('drawline', function(e) {
      console.log(e.data);
    }, false);

    source.addEventListener('open', function(e) {
      // Connection was opened.
      console.log("connection opened");
    }, false);

    source.addEventListener('error', function(e) {
      console.log(e);
      if (e.eventPhase == EventSource.CLOSED) {
        // Connection was closed.
        console.log("connection closed")
      }
    }, false);
  }
}

window.onload = function(){
  Mwnw.addCanvas();
  Mwnw.captureMouseEvents();
  Mwnw.connectToStream();
}