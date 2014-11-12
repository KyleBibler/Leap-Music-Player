$(document).ready(function() {

	function between(x, min, max) {
	  return x > min && x < max;
	}

	/* Variable declarations */
	var controller = new Leap.Controller({enableGestures: true, frameEventName: 'animationFrame'}),
		context = new webkitAudioContext(),
		chords = ["C Major", "E Major", "F Major", "G Minor", "B Minor"],
		stringPositions = [500, 620, 740, 860, 980, 1100],
		notes = [['C3','E3','G3','C4','E4','G4'],
				['E3','G#3','B4','E4','G#4','B5'],
				['F2','A3','C3','F3','A4','C4'],
				['G2','Bb3','D3','G3','Bb4','D4'],
				['B3','D3','F#3','B4','D4','F#4']],
				chordNotes = [];
		notes.forEach(function(chord) {
			chordNotes.push(chord.map(function(note) {
				return Note.fromLatin(note);
			}));
		});

	var getLeftIndexPos = function(frame) {
		var leftIndexPos = [0, 0],
			normalized,
			leftIndex;
		frame.fingers.forEach(function(finger) {
			if(finger.type === 1 && finger.hand().type === "left") {
				leftIndex = finger;
			}
		});
		if(leftIndex) {
			normalized = frame.interactionBox.normalizePoint(leftIndex.tipPosition, true);
			leftIndexPos[0] = ctx.canvas.width * normalized[0];
          	leftIndexPos[1] = ctx.canvas.height * (1 - normalized[1]);
		}
		return leftIndexPos;	
	};

	var getChord = function(leftIndexPos) {
		var chord = 0;
		if (!between(leftIndexPos[0], 50, 260)) {
			return chord;
		}

		if (between(leftIndexPos[1], 40, 120)) {
			chord = 0;
		}
		else if (between(leftIndexPos[1], 140, 220)) {
			chord = 1;
		}
		else if (between(leftIndexPos[1], 240, 320)) {
			chord = 2;
		}
		else if (between(leftIndexPos[1], 340, 420)) {
			chord = 3;
		}
		else if (between(leftIndexPos[1], 440, 520)) {
			chord = 4;
		}
		return chord;		
	};
	
	var stringsPlayed = function(start, end) {
		var strings = [0, 0, 0, 0, 0, 0];
		//stringPositions.forEach(function())
	};	

	
	/* Sets Leap Controller to notify when connected and when Leap Motion is present */
	controller.on('connect', function () {
		console.log("Successfully connected");
	});
	controller.on('deviceStreaming', function() {
		console.log('Device connected!');
	});
	controller.connect();

    MIDI.loadPlugin({
        soundfontUrl: "../static/FluidR3_GM/",
        instrument: "acoustic_guitar_nylon",
        callback: function (fingerType) {
            MIDI.programChange(0, 24);
            var delay = 0; // play one note every quarter second
            var note = notes[fingerType-1]; // the MIDI note
            var velocity = 127; // how hard the note hits
            // play the note
            MIDI.setVolume(0, 127);
        }
    });

	/* Adds event listener for the KeyTap gesture. On keytap plays a note of random frequency */
	controller.on("gesture", function(gesture) {
		if(gesture.type === "swipe" && controller.frame().hand(gesture.handIds[0]).type === "right") {
			
			console.log('GESTURE HAPPENED!');
			var frame = controller.frame(),
				normalSwipeStart = frame.interactionBox.normalizePoint(gesture.startPosition, true)[0] * ctx.canvas.width,
				normalSwipeEnd = frame.interactionBox.normalizePoint(gesture.position, true)[0] * ctx.canvas.width,
				leftIndexPos = getLeftIndexPos(frame),
				chord = getChord(leftIndexPos);
			
			MIDI.noteOn(0, 48, 100, 0);
            MIDI.noteOn(0, 52, 100, 0);
            MIDI.noteOn(0, 55, 100, 0);
            MIDI.noteOff(0, 48, 0.5);
            MIDI.noteOff(0, 52, 0.5);
            MIDI.noteOff(0, 55, 0.5);
			
			console.log(normalSwipeStart);
			console.log(normalSwipeEnd);

			// var	finger = controller.frame().finger(gesture.pointableIds[0]),
			// 	hand = finger.hand().type,
			// 	fingerType = finger.type;

			// if (fingerType > 0) {
					
			// }		
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

		var leftIndexPos = getLeftIndexPos(frame),
			leftX = leftIndexPos[0],
			leftY = leftIndexPos[1];
			

		ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
		ctx.font = "20pt sans-serif";
		for(var i = 40; i <= 100*4+40; i+=100) {
			ctx.beginPath();
			ctx.rect(60, i, 200, 80);			
			ctx.fillStyle = (leftX > 50 && leftX < 260 && leftY > i && leftY < i+80) ? 'green' : 'yellow';			
			ctx.fill();
			ctx.lineWidth = 7;
			ctx.strokeStyle = 'black';
			ctx.fillStyle = 'black';
			ctx.fillText(chords[(i-40)/100] + " Chord", 80, i+50);
			ctx.stroke();
		}

		ctx.fillStyle = 'black';
		/* String drawing */
		for(var i = 500; i < 6*120+500; i+=120) {
			ctx.beginPath();
			ctx.rect(i, 20, 10, 600);
			ctx.fill();
		}
		
		/* Finger drawing */
        frame.pointables.forEach(function(pointable) {
        	var finger = frame.finger(pointable.id);
	        if (!(finger.type != 1 && finger.hand().type === "left")) {
	          	var position = pointable.tipPosition,
      				normalized = frame.interactionBox.normalizePoint(position, true),
	          		x = ctx.canvas.width * normalized[0],
	          		y = ctx.canvas.height * (1 - normalized[1]);
	          ctx.beginPath();
	          ctx.rect(x, y, 20, 20);
	          ctx.fill();
	      }
        });
	});


});