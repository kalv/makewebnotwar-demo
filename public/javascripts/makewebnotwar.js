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
      Stream.sendLinesDrawnToServer();
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
  ajaxifyForm: function(element) {
    element.submit(function() {
      $.post("/answers", {answer: $("input[type='text']", this).val()});
      return false;
    });
  }
}