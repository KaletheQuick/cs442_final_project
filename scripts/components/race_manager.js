class RaceManager extends Component {
	static all = [];
	// TODO Impliment constructor
	constructor(parent_node) {
		super(parent_node, "RaceManager");
		RaceManager.all.push(this);
		this.type = RaceManager;

        this.checkpoints = [];
		this.count = 6;
		this.checkpoint = 5;
		// Extra rings
		for (let index = 0; index < 6; index++) {
			let MY_RING = this.node.create_child(`chkpt_${index}`);
			MY_RING.position.z = -index * 35;
			MY_RING.position.x = (Math.random() - 0.5) * index * 5;
			MY_RING.position.y = (Math.random() - 0.5) * index * 3;
			MY_RING.scale = new Vec4(0.33,0.33,0.33);
			MY_RING.add_component(new MeshRenderer(MY_RING, "ring.obj"));
			MY_RING.add_component(new DebugRotator(MY_RING, 0, 0, 0.05));
			MY_RING.rotation.z = index * 0.13; 
            this.checkpoints.push(MY_RING);        
		}
		this.running_timer = 1;
	}

	_process(delta) {
		this.running_timer += delta
		let thing = 0.33 + Math.max(Math.sin(this.running_timer * 5) * 0.1, 0);
		//console.log(thing);
		this.checkpoints[this.checkpoint].scale = new Vec4(thing,thing,thing);
		this.player_collisionCheck();
    }

	player_collisionCheck() {
		let p_pos_world = ShipMotor.player_ship.node.model.position(); // world position
		let t_pos_world = this.checkpoints[this.checkpoint].model.position(); 
		let x_dif = p_pos_world.x - t_pos_world.x;
		let y_dif = p_pos_world.y - t_pos_world.y;
		let z_dif = p_pos_world.z - t_pos_world.z;
		let sqDis = (x_dif * x_dif) + (y_dif * y_dif);
		//console.log(`DIFFS: z-${z_dif} : sq-${sqDis}`);
		if(z_dif < 0.1 && z_dif > -0.1 && sqDis < 95) {
			console.log(`CHECKPOINT!!`);
			this.checkpoint -= 1;
		}
	}


}