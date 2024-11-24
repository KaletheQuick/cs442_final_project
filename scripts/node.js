/* NOTE: Scene graph implementation notes:
 *
 * Basic "hello world" scene to make sure the matrix multiplication is working would be a basic solar system scene (planet is child of sun, sun rotates)
 * "Everything that happens to the parent (meaning, model matrix transformations), happens to its children (and their children, too, recursively)" - grant
 * 
 * https://learnopengl.com/Guest-Articles/2021/Scene/Scene-Graph
 */

/* Scene graph node */
class Node {
	static instances = []; // list of all instances

	constructor() {
		// node transform data
		this.position = new Vec4(0, 0, 0, 1);
		this.rotation = new Vec4(0, 0, 0, 0); // NOTE: euler rotation vector is as follows: (x=pitch, y=roll, z=yaw)
		this.scale    = new Vec4(1, 1, 1, 1);
		
		this.cached_model = null;
		this.model = Mat4.identity(); // the model matrix of the node

		this.components = [];

		this.parent = null;
		this.children = [];
	}

	add_component(component) {
		this.components.push(component);
	}

	// create a new child, add it, and return it
	create_child() {
		let child = new Node();
		this.children.push(child);
		child.parent = this;
		return child;
	}

	// SECTION: Node movement methods

	// Translate the node by a given xyz offset
	translate(x, y, z) {
		this.position = this.position.add(new Vec4(x, y, z, 1));
	}

	// rotation functions. a is the angle in radians
	rotate_pitch(a) {this.rotation.x += a}
	rotate_roll(a) 	{this.rotation.y += a}
	rotate_yaw(a) 	{this.rotation.z += a}
	// !SECTION

	// SECTION: Private methods (not really, just don't use them outside of here pretty please)

	// recursively generate the model matrix for a given node.
	update_model_matrix() {
		let translate_mat = Mat4.translation(this.position.x, this.position.y, this.position.z);

		let rotate_mat = Mat4.rotation_xz(this.rotation.z)
					 .mul(Mat4.rotation_yz(this.rotation.x))
					 .mul(Mat4.rotation_xy(this.rotation.y));

		let scale_mat = Mat4.scale(this.scale.x, this.scale.y, this.scale.z);

		console.log(translate_mat);

		// model = translation * rotation * scale
		this.model = this.model.mul(translate_mat.mul(rotate_mat).mul(scale_mat));
	}

	// !SECTION

	_process(delta) {
		// TODO Implement _process(delta) function, 
		// calls _process on each child, then calls for each component
		//console.log("Process Time: ", delta);
	}

	// combine all the model matrices of each node instance together into a single array of matrix data
	// This will be passed to the vertex shader
	static compile_graph_matrix() {
		for(let node in this.instances) {

		}
	}

}