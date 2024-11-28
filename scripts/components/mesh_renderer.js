class MeshRenderer extends Component{
	static all = [];
	static typestring = "MeshRenderer"; // for inspector
	// TODO Impliment constructor
	constructor(parent_node, mesh_path) {
		super(parent_node);
		MeshRenderer.all.push(this);
		this.type = MeshRenderer;
		this.mesh = mesh_path; // Saved as a key in the renderer, use that for now.
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