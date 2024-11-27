// Rotates node it is on constantly. Pair with child/
class CameraMotor extends Component {
	static all = []

	constructor(parent_node) {
		super(parent_node);
		CameraMotor.all.push(this);
		this.enabled = false; 
		this.lerpFactor = 0.9;
		/** @type {Node} */
		this.followTarget = null;
	}

	// TODO Impliment _process(delta) function
	_process(delta) {
		if(!this.enabled || this.followTarget == null) {return;}
		
		let start = this.node.model.position();
		let destination = this.followTarget.model.position();
		let difference_scaled = new Vec4(destination.x-start.x,destination.y-start.y,destination.z-start.z).scaled(this.lerpFactor * delta);
		// move
		this.node.translate(difference_scaled.x, difference_scaled.y, difference_scaled.z);		
	}
}