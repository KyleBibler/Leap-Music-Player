$(document).ready(function() {

    /* Change Midi instrument playing
     * Currently, since google chrome doesn't support destroying web audio context
     * objects, you can only do this 6 times before having to refresh the page
     * Google should really get on that...
     */
    var changeInstrument = function(instrument) {
       MIDI.loadPlugin({
        soundfontUrl: "../static/FluidR3_GM/",
        instrument: "" + instrument
        });
        MIDI.programChange(0, midiMap[instrument].program);
    };
    $('input').on("click", function () {
        changeInstrument($(this).val());
    });


    /* Loads the Midi.js plugin
     * Current starting instrument is the grand piano
     */
    MIDI.loadPlugin({
        soundfontUrl: "../static/FluidR3_GM/",
        instrument: "acoustic_grand_piano"
    });


	/* Variable declarations */
	var controller = new Leap.Controller({enableGestures: true, frameEventName: 'animationFrame'}),
        noteNames = ['F', 'E', 'D', 'C', 'G', 'A', 'B', 'C'], //Left Hand is 0 - 3, right hand is 4 - 7
		noteValues = [53, 52, 50, 48, 55, 57, 59, 60],
        notePlaying = [false, false, false, false, false, false, false, false];


    /* Note on/off function */
	var playNote = function(finger) {
        if(!notePlaying[finger]) {
            var note = noteValues[finger-1];
            //console.log("PLAYING " + note + ": " + finger + ", " + hand);
            MIDI.noteOn(0, note, 127, 0);
            notePlaying[finger] = true;
        }
    }

    var stopNote = function(finger) {
        if(notePlaying[finger]) {
            var note = noteValues[finger - 1];
            MIDI.noteOff(0, note, 0);
            notePlaying[finger] = false;
        }
    }

	/* Sets Leap Controller to notify when connected and when Leap Motion is present */
	controller.on('connect', function () {
		console.log("Successfully connected");
	});
	controller.on('deviceStreaming', function() {
		console.log('Device connected!');
	});
	controller.connect();



	/* Adds event listener for the KeyTap gesture. */
//	controller.on("gesture", function(gesture) {
//		if(gesture.type === "keyTap") {
//			var	finger = controller.frame().finger(gesture.pointableIds[0]),
//				hand = finger.hand().type,
//				fingerType = finger.type,
//                notes,
//                note;
//
//			if (fingerType > 0) {
//                notes = (hand === "left") ? leftNotes : rightNotes;
//                note = notes[fingerType-1];
//                MIDI.noteOn(0, note, 127, 0);
//                MIDI.noteOff(0, note, 0.75);
//            }
//        }
//	});


	/* Variable declarations and set up for the canvas, where we will draw the finger points */
	var canvas = document.getElementById("canvas"),
    	ctx = canvas.getContext("2d");
    ctx.canvas.width  = window.innerWidth;
  	ctx.canvas.height = window.innerHeight-3;

  	/* Sets the controller to continuously update the canvas with the finger locations as given by the Leap Motion
     * Where all the magic happens
  	 */
	controller.on('frame', function(frame) {		

		ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.font = "20pt sans-serif";

        //Variable declarations
        var position,
            normalized,
            x,
            y,
            leftHandY,
            rightHandY,
            iBox = frame.interactionBox;
//
        frame.hands.forEach(function(hand){
            position = hand.palmPosition;
            normalized = iBox.normalizePoint(position, true);
            if(hand.type == 'right') {
                rightHandY = ctx.canvas.height * (1-normalized[1]);
            } else {
                leftHandY = ctx.canvas.height * (1-normalized[1]);
            }
        });

        //Gives message if no hands are in the Leap space
        if(frame.pointables.length === 0) {
            ctx.beginPath();
            ctx.lineWidth = 7;
            ctx.strokeStyle = 'black';
            ctx.fillText("No Hands Are Detected", ctx.canvas.width/3, ctx.canvas.height/3);
            ctx.stroke();
        }



        frame.pointables.forEach(function(pointable) {
            var finger = frame.finger(pointable.id);
            if (finger.type > 0) {
                var hand = finger.hand().type,
                    handYPos = (hand == 'right') ? rightHandY : leftHandY,
				    fingerType = (hand === "left") ? finger.type : finger.type + 4;
                position = pointable.tipPosition;
                normalized = iBox.normalizePoint(position, true);

                //gets x and y coords of the finger tip position, normalized
                x = ctx.canvas.width * normalized[0];
                y = ctx.canvas.height * (1 - normalized[1]);


                //Plays note if fingertip is almost below the palm position
                if(y > handYPos - 50) {
                    playNote(fingerType);
                } else if (notePlaying[fingerType]) {
                    stopNote(fingerType);
                }

                ctx.beginPath();
                ctx.lineWidth = 4;
                ctx.rect(x, y, 40, 40);
                ctx.fillStyle = (notePlaying[fingerType]) ? 'green' : 'yellow';
                ctx.fill();
                ctx.strokeStyle = 'black';
                ctx.fillStyle = 'black';
                ctx.fillText(noteNames[fingerType-1], x+10, y+30);
                ctx.stroke();
            }
        });
	});


});