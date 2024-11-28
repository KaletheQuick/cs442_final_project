
var Input = InputSystem.start_listening();
var scene = new Node("root"); // root node


// SECTION Debug manual scene setup 
// Should have the same look and layout 
// as the screenshots on discord.

var diamond = scene.create_child("diamond");
diamond.add_component(new MeshRenderer(diamond, "meshes/diamond.obj"));
diamond.position = new Vec4(0,0,0);
//diamond.rotation = new Vec4(-0.1,0,0.2);
diamond.add_component(new DebugRotator(diamond, 0, 0.1, 0));

var die4_01 = diamond.create_child("die4_01");
die4_01.add_component(new MeshRenderer(die4_01, "meshes/d4.obj"));
die4_01.position = new Vec4(3,0,0);
die4_01.rotation = new Vec4(-0.4,0,0.2);
die4_01.add_component(new DebugRotator(die4_01, 0, 0.1 ,0));

var racecar = scene.create_child("racecar");
racecar.add_component(new MeshRenderer(racecar, "meshes/d4.obj"));
racecar.position = new Vec4(0,0,5);
racecar.add_component(new DebugMovement(racecar));
//die4_02.add_component(new DebugRotator(die4_02, 0,0,0.1));
var cam_gimbal = racecar.create_child("cam_gimbal");
cam_gimbal.position = new Vec4(0,1,5);
var cam_target = racecar.create_child("cam_target");
cam_target.position = new Vec4(0,1,-30);


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
    load_text_resource("meshes/d4.obj");
    load_text_resource("meshes/diamond.obj");
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
// let root = new Node();
// let child = root.create_child("");

// // move the root
// root.translate(20, 0, 0);
// // move the child relative to the root
// child.translate(2, 10, 0);
// // rotate the root (will change the child's position)
// root.rotate_roll(Math.PI);

// root._process(0);
// console.log("PARENT: " + root.model.toString() + "\nCHILD: " + child.model.toString());

// !SECTION