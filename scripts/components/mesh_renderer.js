class MeshRenderer {
	static all = []; // list of all instances
	// Intended to hold mesh data, and as static array, all MeshRenderers in the game.
	// Master render function would then grab that list for it's dark work.

	// TODO Impliment constructor
	constructor() {
		
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
}