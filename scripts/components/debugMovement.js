class DebugMovement extends Component {
	static all = [];
	static typestring = "DebugMovement"; // for inspector
	// TODO Impliment constructor
	constructor(parent_node) {
		super(parent_node);
		DebugMovement.all.push(this);
		this.type = DebugMovement;
	}

	// TODO Impliment _process(delta) function
	_process(delta) {
		// SECTION Camera 
		let multiplier = 1;
		if(Input.is_key_down("ShiftLeft")) {
			multiplier = multiplier*3;
		} else if(Input.is_key_down("KeyZ")) {
			multiplier = multiplier*0.5;
		}
		let velioChango = new Vec4((Input.is_key_down("KeyA") ? -1 : 0) + (Input.is_key_down("KeyD") ? 1 : 0),(Input.is_key_down("KeyC") ? -1 : 0) + (Input.is_key_down("Space") ? 1 : 0), (Input.is_key_down("KeyS") ? -1 : 0) + (Input.is_key_down("KeyW") ? 1 : 0));
		let rolioChango = new Vec4((Input.is_key_down("ArrowUp") ? -1 : 0) + (Input.is_key_down("ArrowDown") ? 1 : 0), (Input.is_key_down("ArrowLeft") ? -1 : 0) + (Input.is_key_down("ArrowRight") ? 1 : 0), (Input.is_key_down("KeyQ") ? -1 : 0) + (Input.is_key_down("KeyE") ? 1 : 0));
	
		let x = this.node.model.basis_x().scaled(velioChango.x);
		let y = this.node.model.basis_y().scaled(velioChango.y);
		let z = this.node.model.basis_z().scaled(velioChango.z);
		let msum = x.add(y.add(z)).scaled(delta);
		this.node.translate(msum.x,msum.y,msum.z);

		rolioChango = rolioChango.scaled(delta * 0.5);
		this.node.rotate_pitch(rolioChango.x);
		this.node.rotate_yaw(rolioChango.y);
		this.node.rotate_roll(rolioChango.z);

		if(Input.is_key_down("Home")) {
			this.node.position.x = 0;
			this.node.position.y = 0;
			this.node.position.z = 5;
			this.node.rotation.x = 0;
			this.node.rotation.y = 0;
			this.node.rotation.z = 0.5;
		}
	}
}