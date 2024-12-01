// Very basic collider. Checks if any other collider is within its bounding unit sphere.

class Collider extends Component { 
	static all = [];

    constructor(parent_node) {
        super(parent_node, "Collider");
        Collider.all.push(this);

        // NOTE: not used for now, implement later if we need to limit detection to certain nodes.
        // list of nodes to check for collisions with. if node_list is null, collisions with all active colliders will be registered.
        //this.node_list = node_list;

        // list of collision events. an event is an array with a reference
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
                this.collisions.push(this.node);
            }
        }
    }

    in_bounding_sphere(other_node) {
        return this.node.position.sub(other_node.position).lengthSquared() < 1
    }

}