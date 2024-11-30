// Rotates node it is on constantly. Pair with child/
class DebugRotator extends Component {
	static all = []

	constructor(parent_node, x, y, z) {
		super(parent_node, "DebugRotator");
		
		DebugRotator.all.push(this);
		this.type = DebugRotator;
		this.x = x;
		this.y = y;
		this.z = z;
	}

	// TODO Impliment _process(delta) function
	_process(delta) {
		this.node.rotate_pitch(this.x * delta);
		this.node.rotate_yaw(this.y * delta);
		this.node.rotate_roll(this.z * delta);
	}
}