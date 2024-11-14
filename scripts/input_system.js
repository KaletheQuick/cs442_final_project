class InputSystem {
	constructor() { 
		this.keys_pressed = {};
		this.keys_down = {} ;
		this.keys_released = {};
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
    
        return input;
    }
}