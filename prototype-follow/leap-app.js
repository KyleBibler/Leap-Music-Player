$(document).ready(function() {

	/* Variable declarations */
	var controller = new Leap.Controller({enableGestures: true, frameEventName: 'animationFrame'}),
		rightNotes = [392, 440, 493.88, 523.25],
		leftNotes = [349.23, 329.63, 293.66, 261.63],
		context = new webkitAudioContext();
		

	
	/* Sets Leap Controller to notify when connected and when Leap Motion is present */
	controller.on('connect', function () {
		console.log("Successfully connected");
	});
	controller.on('deviceStreaming', function() {
		console.log('Device connected!');
	});
	controller.connect();

	/* Adds event listener for the KeyTap gesture. On keytap plays a note of random frequency */
	controller.on("gesture", function(gesture) {
		if(gesture.type === "keyTap") {
			//console.log('GESTURE HAPPENED!');
			var	finger = controller.frame().finger(gesture.pointableIds[0]),
				hand = finger.hand().type,
				fingerType = finger.type;

			if (fingerType > 0) {
				var oscillator = context.createOscillator(),
					notes = (hand === "left") ? leftNotes : rightNotes;
				oscillator.frequency.value = notes[fingerType-1];
				oscillator.type = 'square';
				oscillator.connect(context.destination);	
				oscillator.noteOn(0);
				setTimeout(function(){oscillator.noteOff(0); oscillator.disconnect();}, 400);	
			}		
		}
	});

	/* Variable declarations and set up for the canvas, where we will draw the finger points */
	var map = 0,
		canvas = document.getElementById("canvas"),
    	ctx = canvas.getContext("2d");
    ctx.canvas.width  = window.innerWidth;
  	ctx.canvas.height = window.innerHeight-3;

  	/* Sets the controller to continuously update the canvas with the finger locations as given by the Leap Motion */
	controller.on('frame', function(frame) {		

		ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        frame.pointables.forEach(function(pointable) {
          var position = pointable.tipPosition;
          var normalized = frame.interactionBox.normalizePoint(position, true);

          var x = ctx.canvas.width * normalized[0];
          var y = ctx.canvas.height * (1 - normalized[1]);

          ctx.beginPath();
          ctx.rect(x, y, 20, 20);
          ctx.fill();
        });
	});


});