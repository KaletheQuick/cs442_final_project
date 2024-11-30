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
function prefab_racetrack() {
	// make nodes
	let parent = new Node("racetrack");
	let rings = parent.create_child("rings");

	// Finish Line
	let finish_line = rings.create_child("finish_line");
	finish_line.add_component(new MeshRenderer(finish_line, "ring.obj"));
	finish_line.add_component(new DebugRotator(finish_line, 0, 0, 0.01));
	finish_line.position.z = 600;
	finish_line.scale = new Vec4(3,3,3);
	// Extra rings
	for (let index = 1; index < 6; index++) {
		let MY_RING = rings.create_child(`asteroid_${index}`);
		MY_RING.position.z = index * 100;
		MY_RING.position.x = (Math.random() - 0.5) * 50;
		MY_RING.position.y = (Math.random() - 0.5) * 30;
		MY_RING.add_component(new MeshRenderer(MY_RING, "ring.obj"));
		MY_RING.add_component(new DebugRotator(MY_RING, 0, 0, 0.05));
		MY_RING.rotation.z = index * 0.13;
	}

	let asteroids = parent.create_child("asteroids");
	for (let index = 0; index < 10; index++) {
		let MY_BOI = asteroids.create_child(`asteroid_${index}`);
		MY_BOI.position.z = index * 10 + 3;
		MY_BOI.position.x = (Math.random() - 0.5) * 5 * 3;
		MY_BOI.add_component(new MeshRenderer(MY_BOI, "asteroid.obj"));
	}
	// add components 
	// Final tweaks
	return parent;
}
