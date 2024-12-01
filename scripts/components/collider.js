// Very basic collider. Checks if any other collider is within its bounding unit sphere.

class Collider extends Component { 
	static all = [];

    constructor(parent_node, detection_list) {
        super(parent_node, "Collider");
        Collider.all.push(this);
		this.type = Collider; // for serialization
        // list of nodes to check for collisions with. if it is null, collisions with all active colliders will be registered.
        this.detection_list = detection_list;

        // list of collision events. right now, an event is just a reference to the other colliding node.
        this.collisions = [];
    }

    _ready() {
    }

    _process() {
        // // clear the collision events every process tick
        this.collisions = [];

        // check for intersections with the other colliders, update the collision events list accordingly.
        for(let collider of Collider.all) {
            if(collider != this && this.in_bounding_sphere(collider.node)) {
                if(this.detection_list === null || this.detection_list.includes(collider.node)) {
                    this.collisions.push(collider.node);
                }
            }
        }
    }

    in_bounding_sphere(other_node) {
        return this.node.position.sub(other_node.position).lengthSquared() < 1
    }

}