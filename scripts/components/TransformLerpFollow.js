// Rotates node it is on constantly. Pair with child/
class TransformLerpFollow extends Component {
	static all = []
	static typestring = "TransformLerpFollow"; // for inspector

	constructor(parent_node, target) {
		super(parent_node);
		TransformLerpFollow.all.push(this);
		this.type = TransformLerpFollow;
		this.target = target;
	}

	_ready() {

	}

	// NOTE - Does not acutally lerp the transform.
	_process(delta) {
		// Global pos n shit 
		this.node.position = this.target.position;
		this.node.rotation.y = this.target.rotation.y;
	}
}