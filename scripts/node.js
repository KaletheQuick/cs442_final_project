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
		this.rotation = new Vec4(0, 0, 0, 1); // NOTE: euler rotation vector is as follows: (x=pitch, y=roll, z=yaw)
		this.scale    = new Vec4(1, 1, 1, 1);
		
		this.cached_model = null;
		this.model = Mat4.identity(); // the world model matrix of the node

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

	// Load a scene graph defined by the JSON file at path.
	static construct_scene_from_file(path) {
		// create a http request, taken from Tom's mesh loading code
		let request = new XMLHttpRequest();
		
        request.onreadystatechange = function() {
            if(request.readyState != 4)
				return;
            if(request.status != 200) {
                console.log("Scene graph load failed. Err: " + request.statusText);
                return;
            }
			
			// We have the file, parse it
			let current_node = JSON.parse(request.responseText);
			console.log(json_obj);

			// TODO: traverse the tree and do the parsing. Adding children and components as necessary.
        }

		// send the request to the server
        request.open('GET', path);
        request.send();
	}

	// SECTION: Node transform methods
	// Translate the node by a given xyz offset
	translate(x, y, z) {
		this.position = this.position.add(new Vec4(x, y, z, 1));
	}

	// rotation methods. a is the angle in radians
	rotate_pitch(a) {this.rotation.x += a}
	rotate_roll(a) 	{this.rotation.y += a}
	rotate_yaw(a) 	{this.rotation.z += a}

	// scale methods
	scale(x, y, z)  {
		this.scale = this.scale.add(new Vec4(x, y, z, 1));
	}
	scale_x(factor) {this.scale.x += factor}
	scale_y(factor) {this.scale.y += factor}
	scale_z(factor) {this.scale.z += factor}

	// !SECTION

	// Compute the node's local model matrix
	compute_local_matrix() {
		let translate_mat = Mat4.translation(this.position.x, this.position.y, this.position.z);

		let rotate_mat = Mat4.rotation_xz(this.rotation.z)
					 .mul(Mat4.rotation_yz(this.rotation.x))
					 .mul(Mat4.rotation_xy(this.rotation.y));

		let scale_mat = Mat4.scale(this.scale.x, this.scale.y, this.scale.z);

		// model = translation * rotation * scale
		return translate_mat.mul(rotate_mat).mul(scale_mat);
	}

	// Compute the node's world matrix, using the parent's transform (just multiply it)
	compute_world_matrix(parent_model) {
		return parent_model.mul(this.model);
	}

	_process(delta) {
		// precompute the local matrix of the node, will be applied to all children
		this.model = this.compute_local_matrix();

		// apply the parent's matrix to the child, if it exists.
		// TODO: don't do this if nothing has changed
		if(this.parent !== null)
			this.model = this.compute_world_matrix(this.parent.model);

		// update the children
		for(let child of this.children) {
			if(typeof(child._process) === "function")
				child._process(delta);
		}
		// update the components
		for(let component of this.components) {
			if(typeof(component._process) === "function")
				component._process(delta);
		}
	}
}