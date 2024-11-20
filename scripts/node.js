class Node {
	// NOTE: what is the purpose of having a list of all nodes statically defined within node?
	static all = []; // list of all instances

	constructor() {
		// the model matrix of the node
		this.model = Mat4.identity();

		this.components = [];
		this.children = [];
	}

	add_component(component) {
		this.components.push(component);
	}

	// create a new child, add it, and return it
	add_child(node) {
		let child = new Node();
		this.children.push(child);
		return child;
	}

	// SECTION: Node movement methods
	// translate the node in space, dir is a Vec4
	translate(dir) {
		this.model.transform(dir.x, dir.y, dir.z, dir.w);
	}

	rotate_pitch() {}
	rotate_roll() {}
	rotate_yaw() {}

	_process(delta) {
		// TODO Implement _process(delta) function, 
		// calls _process on each child, then calls for each component
		console.log("Process Time: ", delta);
	}

	// TODO Implement helper functions
}