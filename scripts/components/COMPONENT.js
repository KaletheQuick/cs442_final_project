class Component {
	static all = []; // list of all instances
	static type_string; // type identifier for the component, for inspector

	constructor(parent_node, type_string) {
		this.node = parent_node;
		this.type_string = type_string;
	}

	
	_ready() {

	}

	_process(delta) {
	}

	// NOTE this will not work. A child class calling this would just add it to a list of all Components
	static _registerComponent(component) {
		this.all.push(component);
	}

	static _unregisterComponent(component) {
		
		const index = this.all.indexOf(component);
		if (index > -1) { // only splice array when item is found
		array.splice(index, 1); // 2nd parameter means remove one item only
		}
	}
}