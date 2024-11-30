// Holds the mesh data for a node, and prepares it for the renderer

class MeshRenderer extends Component{
	static all = [];
	static typestring = "MeshRenderer";

	constructor(parent_node, mesh_name) {
		// do metadata stuff, and add this renderer to the list of instances
		super(parent_node);
		this.type = MeshRenderer;
		MeshRenderer.all.push(this);

		// Key for the mesh list dictionary. Mesh object is not directly stored in the mesh renderer.
		this.mesh_name = mesh_name; 

		// NOTE: functionality moved to resource manager
		// load the mesh data. Mesh will be null until loaded
		// this.mesh = null;
		// Mesh.load_from_file(this.mesh_path, (loaded_mesh) => {
		// 	this.mesh = loaded_mesh;
		// 	renderer_init();
		// 	console.log(this.mesh);
		// });
	}

	_process(delta) {
	}

	// combine all the mesh vertex data of each MeshRenderer into a single array
	static compile_mesh_array() {
		let zuper_mesh = [];

		for(let index = 0; index < this.all.length; index++) {
			let renderer = this.all[index];

			// Fetch the mesh associated with the renderer from the resource manager
			let mesh = ResourceManager.meshes[renderer.mesh_name];

			// Do not add the mesh if it hasn't been loaded yet.
			if(mesh !== undefined) {
				zuper_mesh = zuper_mesh.concat(mesh.to_indexed_render_array(index));
			}
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