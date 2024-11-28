
var Input = InputSystem.start_listening();
var scene = new Node("root"); // root node


// SECTION Debug manual scene setup 
// Should have the same look and layout 
// as the screenshots on discord.



var diamond = scene.create_child("diamond");
diamond.add_component(new MeshRenderer(diamond, "meshes/ring.obj"));
diamond.position = new Vec4(0,0,0);
//diamond.rotation = new Vec4(-0.1,0,0.2);
diamond.add_component(new DebugRotator(diamond, 0, 0, 0.1));

var die4_01 = scene.create_child("die4_01");
die4_01.add_component(new MeshRenderer(die4_01, "meshes/asteroid.obj"));
die4_01.position = new Vec4(3,0,0);
die4_01.rotation = new Vec4(-0.4,0,0.2);
die4_01.add_component(new DebugRotator(die4_01, 0.2, 0.1 ,0));

var p_ship = scene.create_child("p_ship");
p_ship.add_component(new MeshRenderer(p_ship, "meshes/ship.obj"));
p_ship.position = new Vec4(0,0,5);
p_ship.rotation.y = 0.5
p_ship.add_component(new DebugMovement(p_ship));
//die4_02.add_component(new DebugRotator(die4_02, 0,0,0.1));
var cam_gimbal = p_ship.create_child("cam_gimbal");
cam_gimbal.position = new Vec4(0,1,-5);
var cam_target = p_ship.create_child("cam_target");
cam_target.position = new Vec4(0,1,3);
let engine_particles = p_ship.create_child("engine_particles");
engine_particles.add_component(new ParticleSystem(engine_particles));
engine_particles.position.z = -0.8;


var cam = scene.create_child("cam");
cam.position = new Vec4(0,0,5);
cam.rotation = new Vec4(0,0,0.5);
cam.add_component(new Camera(cam));
let cam_motor = cam.add_component(new CameraMotor(cam));
cam_motor.followTarget = cam_gimbal;
cam_motor.lookTarget = cam_target;
cam_motor.enabled = true;

// !SECTION

// SECTION Construct the test scene
//Node.construct_scene_from_file("./scripts/test_scene.json");

// let diamond = scene.create_child("");
// // add mesh renderer
// diamond.add_component(new MeshRenderer(
//     Mesh.primitive_sphere_uv(1,1,16,16)
// ));
// diamond.translate(0, 0, 0);

// let triangle = diamond.create_child("");
// // add mesh renderer
// triangle.add_component(new MeshRenderer(
//     Mesh.primitive_sphere_uv(1,1,16,16)
// ));
// triangle.translate(5, 2, 0);

// !SECTION 

function game_loop_fixed_update() {
	// Start recursive scene step
	scene._process(1/60);
    if(Input.is_key_pressed("Backquote")) {toggle_debout();}
	// Input management: Clear momentary key states - other input happens here, so I guess this is fine
	Input._process();
}

 /** 
  * Because her hair has two loops.
  * Starts the render and game loop
 */
function kataras_hair() {
    // load meshes
    load_text_resource("meshes/d4.obj");
    load_text_resource("meshes/diamond.obj");
    load_text_resource("meshes/ship.obj");
    load_text_resource("meshes/asteroid.obj");
    load_text_resource("meshes/flame.obj");
    load_text_resource("meshes/ring.obj");
    window.requestAnimationFrame(renderLoop);
    setInterval(game_loop_fixed_update, 1000/60);
}


// SECTION Output console and utilities
let debout = document.getElementById("debout");
let debout_show = false;
function dout (message) {
    let nthing = document.createElement('p');
    nthing.innerText = message;
    debout.appendChild(nthing);
}
function toggle_debout() {
    debout_show = !debout_show;
    document.getElementById("console").style.display = debout_show ? "block" : "none";
}
// !SECTION

// SECTION scene graph matrix test code
let root = new Node();
let child = root.create_child("");

// move the root
root.translate(20, 0, 0);
// move the child relative to the root
child.translate(2, 10, 0);
// rotate the root (will change the child's position)
root.rotate_roll(Math.PI);

root._process(0);
console.log("PARENT: " + root.model.toString() + "\nCHILD: " + child.model.toString());

// !SECTION