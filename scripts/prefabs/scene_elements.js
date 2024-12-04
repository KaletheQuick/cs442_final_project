/* File to create prefabs, groups of nodes 
parent
├─ rings
│  ├─ finish_line
│  ├─ r_1
│  ├─ r_x
├─ asteroids
│  ├─ a_0
│  ├─ a_x
*/
function prefab_racetrack(player_node) {
	// make nodes
	let parent = new Node("racetrack");
	let rings = parent.create_child("rings");

	// Finish Line
	let finish_line = rings.create_child("finish_line");
	finish_line.add_component(new MeshRenderer(finish_line, "ring.obj"));
	finish_line.add_component(new DebugRotator(finish_line, 0, 0, 0.01));
	finish_line.add_component(new RaceManager(finish_line));
	finish_line.position.z = 600;
	finish_line.scale = new Vec4(3,3,3);
	// create asteroids
	let asteroids = parent.create_child("asteroids");
	for (let index = 0; index < 0; index++) {
		let MY_BOI = asteroids.create_child(`asteroid_${index}`);
		MY_BOI.position.z = index * 10 + 3;
		MY_BOI.position.x = (Math.random() - 0.5) * 5 * 3;
		MY_BOI.add_component(new MeshRenderer(MY_BOI, "asteroid.obj"));

		// NOTE: limit collision detection for asteroids to only the player node. Asteroids can not collide with themselves.
		MY_BOI.add_component(new Collider(MY_BOI, [
			player_node
		]));
	}
	return parent;
}
