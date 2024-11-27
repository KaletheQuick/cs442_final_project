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
	}
	// TODO Impliment constructor

	// TODO Impliment _process(delta)
	_process(delta) {
	}

	// TODO Impliment helper functions
}