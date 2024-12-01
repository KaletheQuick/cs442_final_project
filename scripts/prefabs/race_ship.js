/* File to create prefabs, groups of nodes 

parent
├─ graphic
│  ├─ ship
│  ├─ particles

*/

function prefab_ship(shipName) {
	// make nodes
	let parent = new Node(shipName);
	let graphic = parent.create_child("graphic");
	let ship = graphic.create_child("ship");
	let particles = graphic.create_child("particles");

	// Add components 
	parent.add_component(new ShipMotor(parent, graphic))
	// NOTE: collision detection for player ship can not be limited to only asteroids without a reference to every asteroid.
	parent.add_component(new Collider(parent, null));

	ship.add_component(new MeshRenderer(ship, "ship.obj"));
	particles.add_component(new ParticleSystem(particles));
	
	// Final tweaks
	particles.position.z = -0.8;
	return parent;
}