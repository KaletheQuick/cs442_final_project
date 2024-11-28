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

	constructor(name) {
		// node transform data
		this.name = name;
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
		return component;
	}

	// create a new child, add it, and return it
	create_child(name) {
		let child = new Node(name);
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
	rotate_yaw(a) 	{this.rotation.y += a}
	rotate_roll(a) 	{this.rotation.z += a}

	look_at(x, y, z, upX = 0, upY = 1, upZ = 0) {
		// Target position as a vector
		let target = new Vec4(x, y, z);
	
		// Direction vector from the camera to the target (negative forward)
		let forward = target.sub(this.position).norm();
	
		// Up vector
		let up = new Vec4(upX, -upY, upZ).norm();
	
		// Calculate the right vector (orthogonal to forward and up)
		let right = up.cross(forward).norm();
	
		// Recalculate the up vector to ensure orthogonality (corrects the input up vector)
		up = forward.cross(right).norm();
	
		// Calculate rotations
		// Yaw (rotation around Y-axis): atan2(right.z, forward.z)
		let angle_to_target_y = Math.atan2(forward.x, forward.z);
	
		// Pitch (rotation around X-axis): arcsin(forward.y)
		let angle_to_target_x = Math.asin(forward.y);
	
		// Roll (rotation around Z-axis): atan2(up.y, right.y)
		let angle_to_target_z = Math.atan2(right.y, up.y);
	
		// Convert radians to portions of Tau
		angle_to_target_y /= (2 * Math.PI);
		angle_to_target_x /= (2 * Math.PI);
		angle_to_target_z /= (2 * Math.PI);
	
		// Apply rotations to the node
		this.rotation.x = angle_to_target_x; // Up/down (pitch)
		this.rotation.y = angle_to_target_y; // Left/right (yaw)
		this.rotation.z = angle_to_target_z; // Roll
	}
	

//	look_at(x,y,z) {
//		// Rotation using tau, or 'whole rotations'
//		let target = new Vec4(x, y, z);
//		let dir = target.sub(this.node.position).norm();
//		
//		this.node.rotation.x = Math.asin(dir.y) / (2 * Math.PI);
//		this.node.rotation.y = Math.atan2(dir.x, dir.z) / (2 * Math.PI);
//		this.node.rotation.z = 0; // roll should not be needed in this case
//	}

	// scale methods
	scale_fac(x, y, z)  {
		this.scale = this.scale.add(new Vec4(x, y, z, 1));
	}
	scale_x(factor) {this.scale.x += factor}
	scale_y(factor) {this.scale.y += factor}
	scale_z(factor) {this.scale.z += factor}

	// !SECTION

	// Compute the node's local model matrix
	compute_local_matrix() {
		let translate_mat = Mat4.translation(this.position.x, this.position.y, this.position.z);

		let rotate_mat = Mat4.rotation_xz(this.rotation.y)
					 .mul(Mat4.rotation_yz(this.rotation.x))
					 .mul(Mat4.rotation_xy(this.rotation.z));

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

	// SECTION UI helper methods
	ui_hierachy_rep() {
		let myNode = document.createElement("li");
		let myInspectButton = document.createElement("span");
		myInspectButton.className = "butt";
		myInspectButton.onclick = () => inspect_node(this);
		myInspectButton.innerText = this.name;
		myNode.appendChild(myInspectButton);
		if(this.children.length > 0) {
			let sublist = document.createElement("ul");
			this.children.forEach(kid => {
				sublist.appendChild(kid.ui_hierachy_rep());
			});
			myNode.appendChild(sublist);
		}
		return myNode;
	}


	// !SECTION
}