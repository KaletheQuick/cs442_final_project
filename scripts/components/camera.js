class Camera extends Component {	
	static all = [];
	static typestring = "Camera"; // for inspector
	static main;
	constructor(parent_node) {
		super(parent_node);
		Camera.main = this; // NOTE - Currently the most recently made camera is the norm. 
		Camera.all.push(this);
		this.type = Camera;
		Camera.all.forEach(cam => {
			cam.main = false;
		});
		this.main = true;
		// Actual camera values 

		this.fov_rad = 80 * (Math.PI / 180);
		this.clip_near = 0.1;
		this.clip_far = 150;
	}
	// TODO Impliment constructor

	// TODO Impliment _process(delta)
	_process(delta) {
	}

}

/* 	look_at(x,y,z) {
		let neg_eye = this.node.position.sub(new Vec4(x,y,z));
		//console.log(neg_eye);
		let change_of_base = new Mat4();
		let br = this.node.model.basis_x();
		let bu = this.node.model.basis_y();
		let bb = this.node.model.basis_z();
		change_of_base.data = [
			br.x,	br.y,	br.z,	br.dot(neg_eye),
			bu.x,	bu.y,	bu.z,	bu.dot(neg_eye),
			bb.x,	bb.y,	bb.z,	bb.dot(neg_eye),
			0,	0,	0,	1
		]
//		change_of_base.data = [
//			br.x,	bu.x,	bb.x,	0,
//			br.y,	bu.y,	bb.y,	0,
//			br.z,	bu.z,	bb.z,	0,
//			br.dot(neg_eye),	bu.dot(neg_eye),	bb.dot(neg_eye),	1
//		]
		console.log(change_of_base.data);
		this.node.model = change_of_base;
	}*/