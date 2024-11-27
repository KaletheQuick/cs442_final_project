class Camera extends Component {	
	static all = [];
	static main;
	constructor(parent_node) {
		super(parent_node);
		Camera.main = this; // NOTE - Currently the most recently made camera is the norm. 
		Camera.all.push(this);
	}
	// TODO Impliment constructor

	// TODO Impliment _process(delta)
	_process(delta) {
	}

	// TODO Impliment helper functions
}