class Component {
	static all = []; // list of all instances
	// Intended to hold mesh data, and as static array, all MeshRenderers in the game.
	// Master render function would then grab that list for it's dark work.

	// TODO Impliment constructor
	constructor(parent_node) {
		this.node = parent_node;
		
	}

	// TODO Impliment _process(delta) function
	_process(delta) {
	}


	// combine all the model matrices of each node instance together into a single array of matrix data
	// This will be passed to the vertex shader
	// static compile_graph_matrix() {
	// 	for(let node in this.instances) {

	// 	}
	// }
	// NOTE this will not work. A child class calling this would just add it to a list of all Components
	static _registerComponent(component) {
		this.all.push(component);
	}

	static _unregisterComponent(component) {
		
		const index = this.all.indexOf(component);
		if (index > -1) { // only splice array when item is found
		array.splice(index, 1); // 2nd parameter means remove one item only
		}
	}
}