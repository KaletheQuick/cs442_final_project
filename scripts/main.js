var Input = InputSystem.start_listening();
var AudMgr = new ManagerAudio(); 
var scene = new Node("root"); // root node

// HUD elements 
var header_message = document.getElementById("head_message");


// SECTION Preload resources
// Load all the meshes we're going to use
ResourceManager.load_mesh_list([
    "diamond.obj",
    "d4.obj",
	  "ship.obj",
	  "ring.obj",
	  "asteroid.obj",
	  "flame.obj",
      "cube.obj",
      "plane.obj",
      "hd_sphere.obj",
      "worldsphere.obj"
]);
// !SECTION

// SECTION Debug manual scene setup 
// Should have the same look and layout 
// as the screenshots on discord.

//var diamond = scene.create_child("diamond");
//diamond.add_component(new MeshRenderer(diamond, "ring.obj"));
//diamond.position = new Vec4(0,0,0);
//diamond.rotation = new Vec4(-0.1,0,0.2);
//diamond.add_component(new DebugRotator(diamond, 0, 0, 0.01));
//var dia_2 = scene.create_child("diamond");
//diamond.add_component(new MeshRenderer(dia_2, "ring.obj"));
//dia_2.scale = new Vec4(10,10,10);
//dia_2.rotation = new Vec4(0.25,0,0);
//dia_2.add_component(new DebugRotator(dia_2, 0, 0, 0.01));

//var die4_01 = diamond.create_child("die4_01");
//die4_01.add_component(new MeshRenderer(die4_01, "asteroid.obj"));
//die4_01.position = new Vec4(10,0,0);
//die4_01.rotation = new Vec4(-0.4,0,0.2);
//die4_01.add_component(new DebugRotator(die4_01, 0.2, 0.1 ,0));


var p_ship = prefab_ship("player", true);
scene.children.push(p_ship);
p_ship.parent = scene;

// NOTE: racetrack prefab needs reference to player ship for collisions
var racetrack = scene.add_child(prefab_racetrack(p_ship));

var cam_gantry = scene.create_child("cam_gantry");
cam_gantry.add_component(new TransformLerpFollow(cam_gantry, p_ship));
var cam_gimbal = cam_gantry.create_child("cam_gimbal");
cam_gimbal.position = new Vec4(0,1,-4);
var cam_target = cam_gantry.create_child("cam_target");
cam_target.position = new Vec4(0,1,30);
var cam = scene.create_child("cam");
cam.position = new Vec4(0,0,-5);
cam.rotation = new Vec4(0,0,0.5);
cam.add_component(new Camera(cam));
let worldsphere = cam.create_child("worldsphere");
worldsphere.add_component(new MeshRenderer(worldsphere, "worldsphere.obj"));
worldsphere.scale = new Vec4(4,4,4);

let cam_motor = cam.add_component(new CameraMotor(cam));
cam_motor.followTarget = cam_gimbal;
cam_motor.lookTarget = cam_target;
cam_motor.enabled = true;
// !SECTION

// let component = diamond.get_component("asdf");
// console.log(component);
// DEBUG 
//let kyoonb = scene.create_child("PLANE");
//kyoonb.add_component(new MeshRenderer(kyoonb, "plane.obj"))
//kyoonb.add_component(new DebugRotator(kyoonb, 0, 0.0-1, 0));


function game_loop_fixed_update() {
	// Start recursive scene step
	scene._process(1/60);
    if(Input.is_key_pressed("Backquote")) {toggle_debout();}
	// Input management: Clear momentary key states - other input happens here, so I guess this is fine
	Input._process();
	AudMgr._process();
}

 /** 
  * Because her hair has two loops.
  * Starts the render and game loop
 */
function kataras_hair() {
    // Notify all nodes that the scene is now fully constructed
    console.log("Scene initialized, calling _ready() on root");
    scene._ready();
    renderer_init();
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
    //document.getElementById("console").style.display = debout_show ? "block" : "none";
    document.getElementById("edit_1").style.display = debout_show ? "block" : "none";play_ui
    document.getElementById("edit_2").style.display = debout_show ? "block" : "none";
    document.getElementById("play_ui").style.display = !debout_show ? "block" : "none";
}
// !SECTION

// SECTION UI and HUD

function ui_headMsg(text, duration) {
    console.log(text);
    header_message.innerText = text;
    header_message.className = "head_mess head_bounce";
    // wait for duration
    setTimeout(() => {
        header_message.className = "head_mess head_hidden";
    }, duration);
}

// !SECTION