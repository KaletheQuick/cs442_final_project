class InputSystem {
	constructor() { 
		this.keys_pressed = {};
		this.keys_down = {} ;
		this.keys_released = {};
		this.ongoingTouches = [];
	}

	_process() {
		// Move everything from pressed, to down.
		for (const [key, value] of Object.entries(this.keys_pressed)) {
			this.keys_pressed[key] = false;
		}
		// Clear things from released
		for (const [key, value] of Object.entries(this.keys_released)) {
			this.keys_released[key] = false;
		}
	}

    is_key_down( code ) {return !!this.keys_down[ code ];}
    is_key_up( code ) {return !this.keys_down[ code ];}
    is_key_pressed( code ) {return !!this.keys_pressed[ code ];}
    is_key_released( code ) {return !!this.keys_released[ code ];}

    keys_down_list() {
        return Object.entries(this.keys_down)
            .filter( kv => kv[1] /* the value */ )
            .map( kv => kv[0] /* the key */ )
    }

    static start_listening() {
        let input = new InputSystem();
    
        addEventListener( "keydown", function( ev ) { 
            if( typeof ev.code === "string" ) {
				if(input.keys_down[ev.code] == false){
					input.keys_pressed[ ev.code ] = true;
				}
				input.keys_down[ ev.code ] = true;
            }
        })
    
        addEventListener( "keyup", function( ev ) { 
            if( typeof ev.code === "string" ) {
                input.keys_down[ ev.code ] = false;
                input.keys_released[ ev.code ] = true;
            }
        })


        addEventListener( "mousedown", function( ev ) { 
			input.keys_pressed["mouse_" + ev.button ] = true;
            input.keys_down[ "mouse_" + ev.button ] = true;
        })
    
		addEventListener( "mouseup", function( ev ) { 
            input.keys_down["mouse_" + ev.button ] = false;  
			input.keys_released["mouse_" + ev.button ] = true;          
        })


        addEventListener( "mousemove", function( ev ) { 
            input.keys_down["mouse_" + ev.button ] = false;  
			input.keys_released["mouse_" + ev.button ] = true;          
        })


		// SECTION TOUCH EVENTS
		addEventListener( "touchstart", function( ev ) {   
			//ev.preventDefault();
			//AudMgr.play_sfx("audio/pluck.ogg", die4_01);
			console.log("touchstart.");
			//const el = document.getElementById("canvas");
			//const ctx = el.getContext("2d");
			const touches = ev.changedTouches;

			for (let i = 0; i < touches.length; i++) {
				console.log(`touchstart: ${i}.`);
				//input.ongoingTouches.push(copyTouch(touches[i]));
				//const color = colorForTouch(touches[i]);
				//console.log(`color of touch with id ${touches[i].identifier} = ${color}`);
				//ctx.beginPath();
				//ctx.arc(touches[i].pageX, touches[i].pageY, 4, 0, 2 * Math.PI, false); // a circle at the start
				//ctx.fillStyle = color;
				//ctx.fill();
				console.log(`POSX: ${touches[i].pageX}`);
				if(touches[i].pageX < window.screen.width/2) {
					AudMgr.play_sfx("audio/pluck.ogg", die4_01);
				}
			}       
        })
		addEventListener( "touchend", function( ev ) { 
			//ev.preventDefault();
			console.log("touchend");
			const el = document.getElementById("canvas");
			const ctx = el.getContext("2d");
			const touches = ev.changedTouches;
		  
			for (let i = 0; i < touches.length; i++) {
			  const color = colorForTouch(touches[i]);
			  let idx = ongoingTouchIndexById(touches[i].identifier);
		  
			  if (idx >= 0) {
				ctx.lineWidth = 4;
				ctx.fillStyle = color;
				ctx.beginPath();
				ctx.moveTo(ongoingTouches[idx].pageX, ongoingTouches[idx].pageY);
				ctx.lineTo(touches[i].pageX, touches[i].pageY);
				ctx.fillRect(touches[i].pageX - 4, touches[i].pageY - 4, 8, 8); // and a square at the end
				ongoingTouches.splice(idx, 1); // remove it; we're done
			  } else {
				console.log("can't figure out which touch to end");
			  }
			}         
        })
		addEventListener( "touchcancel", function( ev ) {   
			//ev.preventDefault();
			console.log("touchcancel.");
			const touches = ev.changedTouches;
		  
			for (let i = 0; i < touches.length; i++) {
			  let idx = ongoingTouchIndexById(touches[i].identifier);
			  ongoingTouches.splice(idx, 1); // remove it; we're done
			}       
        })
		addEventListener( "touchmove", function( ev ) {   
			//ev.preventDefault();
			const el = document.getElementById("canvas");
			const ctx = el.getContext("2d");
			const touches = ev.changedTouches;
		  
			for (let i = 0; i < touches.length; i++) {
			  const color = colorForTouch(touches[i]);
			  const idx = ongoingTouchIndexById(touches[i].identifier);
		  
			  if (idx >= 0) {
				console.log(`continuing touch ${idx}`);
				ctx.beginPath();
				console.log(
				  `ctx.moveTo( ${ongoingTouches[idx].pageX}, ${ongoingTouches[idx].pageY} );`,
				);
				ctx.moveTo(ongoingTouches[idx].pageX, ongoingTouches[idx].pageY);
				console.log(`ctx.lineTo( ${touches[i].pageX}, ${touches[i].pageY} );`);
				ctx.lineTo(touches[i].pageX, touches[i].pageY);
				ctx.lineWidth = 4;
				ctx.strokeStyle = color;
				ctx.stroke();
		  
				ongoingTouches.splice(idx, 1, copyTouch(touches[i])); // swap in the new touch record
			  } else {
				console.log("can't figure out which touch to continue");
			  }
			}       
        })

		// !SECTION
    
        return input;
    }
}