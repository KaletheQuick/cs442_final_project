class MeshRenderer extends Component{
	static all = [];
	// TODO Impliment constructor
	constructor(parent_node) {
		super(parent_node);
		MeshRenderer.all.push(this);
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