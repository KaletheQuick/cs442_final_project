class ParticleSystem extends Component {
	static all = [];
	static typestring = "ParticleSystem"; // for inspector
	// TODO Impliment constructor
	constructor(parent_node) {
		super(parent_node);
		ParticleSystem.all.push(this);
		this.type = ParticleSystem;

        this.subbies = [];
		this.count = 8;
        for (let index = 0; index < this.count; index++) {
            const element = this.node.create_child(`particle_${index}`);
            element.add_component(new MeshRenderer(element, "meshes/flame.obj"));    
            this.subbies.push(element);        
        }
		this.emission_factor = 1;
	}

	// TODO Impliment _process(delta) function
	_process(delta) {
        let particle = this.subbies[Math.floor(Math.random() * this.subbies.length)];
        this.subbies.forEach(part => {
            part.scale_fac(-delta,-delta,delta * this.emission_factor);
        });

        particle.scale.x = 0.2 + (Math.random() * 0.8);
        particle.scale.y = 0.2 + (Math.random() * 0.8);
        particle.scale.z = 0.2 + (Math.random() * 0.1);
        particle.rotation.z = Math.random();
    }


}