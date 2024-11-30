class ShipMotor extends Component {
	static all = [];
	static typestring = "ShipMotor"; // for inspector
	// TODO Impliment constructor
	constructor(parent_node, graphic_node) {
		super(parent_node);
		ShipMotor.all.push(this);
		this.type = ShipMotor;
		this.speed_max = 20;
		this.speed_current = 0;
		this.throttle = 0;
		this.graphic = graphic_node;
		this.boost = false;
	}

	_ready() {
		this.engine_sound = AudMgr.play_sfx("audio/engine_loop.wav");
		this.engine_sound.pause();
		//this.engine_sound.volume = 0; // pausing it requeues it, gotta fix
		this.engine_sound.playbackRate = 1.5;
		this.engine_sound.preservesPitch = false;
		this.engine_sound.loop = true;
		this.engine_sound.play();
		this.particles = this.node.children[0].children[1].components[0];
	}

	// TODO Impliment _process(delta) function
	_process(delta) {

		// SECTION Debug controls 
		let velioChango = new Vec4((Input.is_key_down("KeyA") ? -1 : 0) + (Input.is_key_down("KeyD") ? 1 : 0),(Input.is_key_down("KeyC") ? -1 : 0) + (Input.is_key_down("Space") ? 1 : 0), (Input.is_key_down("KeyS") ? -1 : 0) + (Input.is_key_down("KeyW") ? 1 : 0));
		let rolioChango = new Vec4((Input.is_key_down("ArrowUp") ? -1 : 0) + (Input.is_key_down("ArrowDown") ? 1 : 0), (Input.is_key_down("ArrowLeft") ? -1 : 0) + (Input.is_key_down("ArrowRight") ? 1 : 0), (Input.is_key_down("KeyQ") ? -1 : 0) + (Input.is_key_down("KeyE") ? 1 : 0));
		if(Input.is_key_down("Space")) {
			this.boost = true;
		} else {
			this.boost = false;
		}

		// !SECTION

		let lerp_x = 0.97;
		let lerp_z = 0.95;
		let cur_throttle = this.throttle;
		if(this.boost == true) {
			lerp_x = 0.99;
			lerp_z = 0.99;
			cur_throttle = this.throttle * 3;
		}
		let desired_movement = [-velioChango.z,velioChango.x];
		this.node.rotation.x = (desired_movement[0]*0.2) - ((desired_movement[0]*0.2 - this.node.rotation.x) * lerp_x);
		//this.node.rotation.y = (desired_movement[1]*0.2) - ((desired_movement[1]*0.2 - this.node.rotation.y) * 0.94);
		this.node.rotation.z = (desired_movement[1]*0.2) - ((desired_movement[1]*0.2 - this.node.rotation.z) * lerp_z);
		this.node.rotate_yaw(this.node.rotation.z*delta * 2);
		this.throttle += -rolioChango.x * delta;
		if(this.throttle > 1) {this.throttle = 1;} else if(this.throttle < 0) {this.throttle = 0;}
		// dospeed 
		let f = this.node.model.basis_z().scaled(cur_throttle * this.speed_max * delta);
		this.node.translate(f.x,f.y,f.z);

		if(Input.is_key_pressed("KeyT")) {
			AudMgr.play_sfx("audio/pluck.ogg", die4_01);
		}
		// Motor sound
		//this.engine_sound.preservePitch = false;
		this.engine_sound.playbackRate = 0.3 + cur_throttle * 0.5;
		this.particles.emission_factor = 1 + (cur_throttle * 2);
		//this.engine_sound.play()

    }
}