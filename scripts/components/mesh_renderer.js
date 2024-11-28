class MeshRenderer extends Component{
	static all = [];
	static typestring = "MeshRenderer";

	constructor(parent_node, mesh_path) {
		// do metadata stuff, and add this renderer to the list of instances
		super(parent_node);
		this.type = MeshRenderer;
		MeshRenderer.all.push(this);

		// load the mesh data. Mesh will be null until loaded
		this.mesh_path = mesh_path;
		this.mesh = null;
		Mesh.load_from_file(this.mesh_path, (loaded_mesh) => {
			this.mesh = loaded_mesh;
		});
	}

	_process(delta) {
		// what to do in here??
	}

	// combine all the mesh vertex data of each MeshRenderer into a single array
	static compile_mesh_array() {
		let zuper_mesh = [];

		for(let index = 0; index < this.all.length; index++) {
			let renderer = this.all[index];
			zuper_mesh = zuper_mesh.concat(renderer.mesh.to_indexed_render_array(index));
		}
		return zuper_mesh;
	}

	// combine all the model matrices of each node together into a single array of matrix data to be used by the renderer
	static compile_matrix_array() {
		let matrices = [];

		for(let renderer of this.all)
			matrices = matrices.concat(renderer.node.model.data);
		return matrices;
	}
}