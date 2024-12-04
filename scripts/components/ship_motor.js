class ShipMotor extends Component {
	static all = [];
	static player_ship;

	// TODO Impliment constructor
	constructor(parent_node, graphic_node, player=false) {
		super(parent_node, "ShipMotor");
		ShipMotor.all.push(this);
		this.type = ShipMotor;
		this.speed_max = 20;
		this.speed_current = 0;
		this.throttle = 0;
		this.graphic = graphic_node;
		this.boost = 0;
		this.boost_timer = 2;
		this.boost_allow = true;

		// animation state
		this.anim_timer = -1;
		this.anim_shake_amt = 0;
		this.player = false;
		if(player) {
			this.player = true;
			ShipMotor.player_ship = this;
		} 

	}

	_ready() {

		this.collider = this.node.get_component("Collider");
		this.ship_node = this.graphic.children[0];
		if(this.player == true) {
			this.engine_sound = AudMgr.play_sfx("audio/engine.wav",this.node);
			//this.engine_sound.pause();
			//this.engine_sound.volume = 0; // pausing it requeues it, gotta fix
			this.engine_sound.playbackRate = 1.5;
			this.engine_sound.preservesPitch = false;
			this.engine_sound.loop = true;
			this.particles = this.node.children[0].children[1].components[0];
			this.engine_sound.play();
		}
	}

	// TODO Impliment _process(delta) function
	_process(delta) {

		// SECTION Debug controls 
		if(this.player != true) {
			return;
		}

		let velioChango = new Vec4((Input.is_key_down("KeyA") ? -1 : 0) + (Input.is_key_down("KeyD") ? 1 : 0),(Input.is_key_down("KeyC") ? -1 : 0) + (Input.is_key_down("Space") ? 1 : 0), (Input.is_key_down("KeyS") ? -1 : 0) + (Input.is_key_down("KeyW") ? 1 : 0));
		let rolioChango = new Vec4((Input.is_key_down("ArrowUp") ? -1 : 0) + (Input.is_key_down("ArrowDown") ? 1 : 0), (Input.is_key_down("ArrowLeft") ? -1 : 0) + (Input.is_key_down("ArrowRight") ? 1 : 0), (Input.is_key_down("KeyQ") ? -1 : 0) + (Input.is_key_down("KeyE") ? 1 : 0));
		if(Input.is_key_down("Space") && this.boost_timer > 0 && this.boost_allow) {
			this.boost = 1 - ((1 - this.boost) * 0.99);
			this.boost_timer -= delta;
			if(this.boost_timer < 0) {
				this.boost_break();
			}
		} else if(this.boost_timer < 0) {
			this.boost = 0 - ((0 - this.boost) * 0.9);
			this.boost_timer += delta;
		} else {
			this.boost = 0 - ((0 - this.boost) * 0.99);
			this.boost_timer += delta;
		}

		if(this.boost_timer > 2) {
			this.boost_allow = true;
			this.boost_timer = 2;
		}
		document.getElementById("boost").innerText = "Boost: " + this.boost_timer.toFixed(2);
		// !SECTION

		// SECTION Collision
		if(this.collider != null) {
			// console.log("Ship collisions: " + this.collider.collisions.length);
			//if(this.collider.collisions[0] != null) console.log(this.collider.collisions[0].name);
			
			// Collision detected
			if(this.collider.collisions.length > 0) {
				this.boost_break();
			}
		}

		// Shake animation on collision
		if(this.anim_timer > 0.01) {
			this.anim_shake_amt += 10 * delta;
			this.ship_node.rotation.z = (Math.sin(this.anim_shake_amt) / 10);
			this.anim_timer -= 0.8 * delta;

			// reset rotation once finished
			if (this.anim_timer < 0.01)
				this.ship_node.rotation.z = 0;
			//console.log(this.anim_timer);
		}
		// !SECTION

		let lerp_x = lerp(0.97,0.99,this.boost);// 0.97;
		let lerp_z = lerp(0.95,0.95,this.boost);// 0.95;
		let cur_throttle = lerp(this.throttle,this.throttle * 2,this.boost);
		let turn_factor = lerp(1,0.5,this.boost);

		//console.log(`BOOST: ${cur_throttle}`)

		let desired_movement = [-velioChango.z,velioChango.x];
		this.node.rotation.x = (desired_movement[0]*0.2) - ((desired_movement[0]*0.2 - this.node.rotation.x) * lerp_x);
		//this.node.rotation.y = (desired_movement[1]*0.2) - ((desired_movement[1]*0.2 - this.node.rotation.y) * 0.94);
		this.node.rotation.z = (desired_movement[1]*0.2) - ((desired_movement[1]*0.2 - this.node.rotation.z) * lerp_z);
		this.node.rotate_yaw(this.node.rotation.z*delta * 2 * turn_factor);
		this.throttle += -rolioChango.x * delta;
		if(this.throttle > 1) {this.throttle = 1;} else if(this.throttle < 0) {this.throttle = 0;}
		// dospeed 
		let f = this.node.model.basis_z().scaled(cur_throttle * this.speed_max * delta);
		this.node.translate(f);

		if(Input.is_key_pressed("KeyT")) {
			AudMgr.play_sfx("audio/pluck.ogg", null);
		}
		// Motor sound
		//this.engine_sound.preservePitch = false;
		this.engine_sound.playbackRate = 0.3 + cur_throttle * 0.5;
		this.particles.emission_factor = 1 + (cur_throttle * 2);
		//this.engine_sound.play()


    }

	net_setValues(pos, rot) { // Please be Vec4s
		this.node.position = pos;
		this.node.rotation = rot;
	}

	boost_break() {
		this.boost_allow = false;
		// TODO play backfiring sound
		AudMgr.play_sfx("audio/collision.wav",this.node);
		this.boost_timer = -1;
		// start animation
		this.anim_timer = 1;
	}
}

function lerp(a,b,f) {
	return a + ((b-a) * f);
}