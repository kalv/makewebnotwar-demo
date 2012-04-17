var Stream = {
  // Connect to the Event source & Handle generic events
  connect: function() {
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
      $("#answers").append("<p>"+e.data+"</p>");
    }, false);
  },
  // Listen and handle new lines drawn
  listenForNewLines: function() {
    eventSource.addEventListener('drawlines', function(e) {
      var lines = JSON.parse(e.data);
      for (var a = 0; a < lines.length; a++) {
        var line = lines[a];
        Mwnw.drawOnCanvas(line.moveToX, line.moveToY, line.closeX, line.closeY);
      };
    }, false);
  },
  // Send lines to server
  sendLinesDrawnToServer: function() {
    $.post("/drawlines", {lines: JSON.stringify(Mwnw.linesDrawn)});
    Mwnw.linesDrawn = new Array(); // clear out old lines
  }
}