// Rotates node it is on constantly. Pair with child/
class CameraMotor extends Component {
	static all = []
	static typestring = "CameraMotor"; // for inspector

	constructor(parent_node) {
		super(parent_node);
		this.type = CameraMotor;
		CameraMotor.all.push(this);
		this.enabled = false; 
		this.lerpFactor = 0.2;
		/** @type {Node} */
		this.followTarget = null;
		this.lookTarget = null;
	}

	// TODO Impliment _process(delta) function
	_process(delta) {
		if(!this.enabled || this.followTarget == null) {return;}
		
		let start = this.node.model.position();
		let destination = this.followTarget.model.position();
		let difference_scaled = new Vec4(destination.x-start.x,destination.y-start.y,destination.z-start.z).scaled(this.lerpFactor);
		// move
		this.node.translate(difference_scaled.x, difference_scaled.y, difference_scaled.z);		
		if(this.lookTarget != null) {
			let lp = this.lookTarget.model.position();
			let upVec = this.followTarget.model.basis_y();
			this.node.look_at(lp.x, lp.y, lp.z);//, upVec.x, upVec.y, upVec.z);			
		}
	}
}