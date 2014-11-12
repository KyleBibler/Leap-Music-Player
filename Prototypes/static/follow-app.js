$(document).ready(function() {
    var html = "",
        every3 = 1;
    for (var key in midiMap) {
        if(midiMap.hasOwnProperty(key)) {
            html += "<input type='radio' name='instrument' value='" + key + "'>" + midiMap[key].name
//            if (every3 === 3) {
//                html += "<br>";
//                every3 = 0;
//            }
//            every3++;
        }
    };
    $('#container').append(html);



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

    MIDI.loadPlugin({
        soundfontUrl: "../static/FluidR3_GM/",
        instrument: "acoustic_grand_piano"
    });


	/* Variable declarations */
	var controller = new Leap.Controller({enableGestures: true, frameEventName: 'animationFrame'}),
		rightNotes = [55, 57, 59, 60],
		leftNotes = [53, 52, 50, 48];

	
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
//
			if (fingerType > 0) {
//				var oscillator = context.createOscillator(),
                notes = (hand === "left") ? leftNotes : rightNotes;
//				oscillator.frequency.value = notes[fingerType-1];
//				oscillator.type = 'square';
//				oscillator.connect(context.destination);
//				oscillator.noteOn(0);
//				setTimeout(function(){oscillator.noteOff(0); oscillator.disconnect();}, 400);
                note = notes[fingerType-1];
                MIDI.noteOn(0, note, 127, 0);
                MIDI.noteOff(0, note, 0.75);
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

        var position,
            normalized,
            x,
            y,
            iBox = frame.interactionBox;
//
//        frame.hands.forEach(function(hand){
//            position = hand.palmPosition;
//            normalized = iBox.normalizePoint(position, true);
//            x = ctx.canvas.width * normalized[0];
//            y = ctx.canvas.height * (1 - normalized[1]);
//            ctx.beginPath();
//            x = (hand.type === 'right') ? x - 500 : x - 350;
//            ctx.rect(x, y, 800, 10);
//            ctx.fill();
//        });

        frame.pointables.forEach(function(pointable) {
            if (frame.finger(pointable.id).type > 0) {
                position = pointable.tipPosition;
                normalized = iBox.normalizePoint(position, true);

                x = ctx.canvas.width * normalized[0];
                y = ctx.canvas.height * (1 - normalized[1]);

                ctx.beginPath();
                ctx.rect(x, y, 20, 20);
                ctx.fill();
            }
        });
	});


});