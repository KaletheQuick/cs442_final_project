
var Input = InputSystem.start_listening();
var scene = new Node(); // root node

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
let root = new Node();
let child = root.create_child();

root.translate(20, 0, 0);
root.rotate_pitch(6.28 / 2); // half a turn
root.update_model_matrix();
console.log(root.model.toString());


// !SECTION