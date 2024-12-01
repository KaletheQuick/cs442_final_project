// Rotates node it is on constantly. Pair with child/
class DebugRotator extends Component {
	static all = []

	constructor(parent_node, x, y, z) {
		super(parent_node, "DebugRotator");
		
		DebugRotator.all.push(this);
		this.type = DebugRotator;
		this.rotation = new Vec4(x, y, z);
		// this.x = x;
		// this.y = y;
		// this.z = z;

		// begin as null
		this.mesh_renderer = null;
	}

	_ready() {
		// once the component is ready we can grab the component
		// this.mesh_renderer = this.node.get_component("MeshRenderer");
		// console.log("Reference to MeshRenderer inside debugRotator: ");
		// console.log(this.mesh_renderer);
	}

	_process(delta) {
		// NOTE: this might be slower performance-wise, since we're creating a new object instead of just adding to the xyz directly. Idk, looks cleaner though.
		this.node.rotate(this.rotation.scaled(delta));

		// this.node.rotate_pitch(this.x * delta);
		// this.node.rotate_yaw(this.y * delta);
		// this.node.rotate_roll(this.z * delta);
	}
}