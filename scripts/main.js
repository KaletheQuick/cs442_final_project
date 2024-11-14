
var animate = false;
var perspective = false;
var Input = InputSystem.start_listening();
var aspect_ratio = window.innerWidth / window.innerHeight; 
let canvas = document.getElementById('the-canvas');

let loaded_obj = Mesh.primitive_plane(1,1,1,1);
let verts = loaded_obj.to_renderArray();

// SECTION -- Camera Variables, 
let cam_transform = Mat4.translation(0,0,5).mul(Mat4.rotation_xz(0.5));
let cam_velocity = new Vec4(0,0,0);
let cam_euler = new Vec4(0,0,0);
// !SECTION

function load_text_resource(file_name) {
    let request = new XMLHttpRequest();
    let logger = document.createElement("p");
    logger.innerHTML= "Loading " + file_name;
    debout.appendChild(logger);

    request.onreadystatechange = function() {
        if(request.readyState != 4) { return; }
        if(request.status != 200) {
            logger.innerHTML = file_name + " load failed. Err: " + request.statusText;
            return;
        }
        logger.innerHTML = "Loading " + file_name + " ~ SUCCESS!<br>Parsing . . .";
        if(file_name == "plane") {
            loaded_obj = Mesh.primitive_plane(2,2,5,5);
        } else if(file_name == "cylinder") {
            loaded_obj = Mesh.primitive_cylinder(1,1,32,32);
        } else if(file_name == "sphere") {
            loaded_obj = Mesh.primitive_sphere_uv(1,1,16,16);
        } else if(file_name == "koun") {
            loaded_obj = Mesh.primitive_koun(1,1,32,32);
        } else if(file_name == "boul") {
            loaded_obj = Mesh.primitive_boul(1,1,32,32);
        } else if(file_name == "onion") {
            loaded_obj = Mesh.primitive_onion(1,1,32,32);
        } else {
            loaded_obj = Mesh.from_obj(request.responseText);
        }
        logger.innerHTML = request.responseText;
        //console.log(request.responseText);
        logger.innerHTML = "Loading " + file_name + " ~ SUCCESS!<br>Parsing DONE!<br>GPU load . . .";
        verts = loaded_obj.to_renderArray();
        logger.innerHTML = "Loading " + file_name + " ~ SUCCESS!<br>Parsing DONE!<br>GPU load DONE!";
        vertex_buffer = create_and_load_vertex_buffer(gl, verts, gl.STATIC_DRAW);
        shader_program = create_compile_and_link_program( gl, vertex_source, fragment_source );
        gl.useProgram( shader_program );
        set_vertex_attrib_to_buffer( 
            gl, shader_program, 
            "coordinates", 
            vertex_buffer, 3, 
            gl.FLOAT, false, VERTEX_STRIDE, 0 
        );
        set_vertex_attrib_to_buffer( 
            gl, shader_program, 
            "color", 
            vertex_buffer, 4, 
            gl.FLOAT, false, VERTEX_STRIDE, (3*4)//+(4*4)+(3*4)
        );
        set_vertex_attrib_to_buffer( 
            gl, shader_program, 
            "normal", 
            vertex_buffer, 3, 
            gl.FLOAT, false, VERTEX_STRIDE, (3*4)+(4*4)//+(3*4)
        );
        set_vertex_attrib_to_buffer( 
            gl, shader_program, 
            "uv", 
            vertex_buffer, 2, 
            gl.FLOAT, false, VERTEX_STRIDE, (3*4)+(4*4)+(3*4)
        );
        set_render_params( gl );

        //print_items(gl);

        shader_vars_initialize(shader_program);
    }

    request.open('GET', file_name);
    request.send();
}
/** @type {WebGLRenderingContext} */
let gl = canvas.getContext( 'webgl2' );
gl.enable(gl.DEPTH_TEST);
gl.enable(gl.CULL_FACE);
gl.cullFace(gl.BACK);
gl.frontFace(gl.CW) ;

let vertex_buffer = create_and_load_vertex_buffer(gl, verts, gl.STATIC_DRAW);

var shader_program = 
    create_compile_and_link_program( gl, vertex_source, fragment_source );
gl.useProgram( shader_program );


VERTEX_STRIDE = 48;
set_vertex_attrib_to_buffer( 
    gl, shader_program, 
    "coordinates", 
    vertex_buffer, 3, 
    gl.FLOAT, false, VERTEX_STRIDE, 0 
);
set_vertex_attrib_to_buffer( 
    gl, shader_program, 
    "color", 
    vertex_buffer, 4, 
    gl.FLOAT, false, VERTEX_STRIDE, (3*4)//+(4*4)+(2*4)
);
set_vertex_attrib_to_buffer( 
    gl, shader_program, 
    "normal", 
    vertex_buffer, 3, 
    gl.FLOAT, false, VERTEX_STRIDE, (3*4)+(4*4)//+(2*4)
);
set_vertex_attrib_to_buffer( 
    gl, shader_program, 
    "uv", 
    vertex_buffer, 2, 
    gl.FLOAT, false, VERTEX_STRIDE, (3*4)+(4*4)+(2*4)
);

set_render_params( gl );
//print_items(gl);

function load_matrix_from_user_input() {
    let data = new Array();
    // load the model matrix from user input
    for( let i = 0; i < 16; i++ ) {
        data.push( parseFloat( document.getElementById( 'matrix-data-' + i ).value ) );
    }

    return new Mat4( data );
}

function get_camera_matrix() {
    return cam_transform.inverse();
}

function get_projection_matrix() {
    let fov_rad = document.getElementById("cam_fov").value * (Math.PI / 180);
    let clip_near = document.getElementById("cam_clip_near").value * 0.001;
    let clip_far = Math.pow(document.getElementById("cam_clip_far").value, 2); 
    
    //let aspect_ratio = canvas.width / canvas.height;  // Ensure this is correct
    let top_plane = Math.tan(fov_rad / 2) * clip_near;
    let bot_plane = -top_plane;
    let right_plane = top_plane * aspect_ratio;
    let left_plane = -right_plane;

    return Mat4.frustum(left_plane, right_plane, bot_plane, top_plane, clip_near, clip_far);  // No inverse here
}
// SECTION ~ Set up texture
let image = new Image();
function on_load() { // callback
    gl.texImage2D(
        gl.TEXTURE_2D, 0, gl.RGBA,
        gl.RGBA, gl.UNSIGNED_BYTE,
        image
    );
    gl.generateMipmap(gl.TEXTURE_2D);
}
image.onload = on_load;
image.src = "img/diamond.jpg";
let tex = gl.createTexture();
gl.bindTexture(gl.TEXTURE_2D, tex);
gl.generateMipmap(gl.TEXTURE_2D);
const sampler_loc = gl.getUniformLocation(shader_program, 'albedo');
gl.uniform1i(sampler_loc, 0);
// !SECTION

// SECTION Shader var management
var last_time_for_delta_calc = 0;
var model = new Mat4(); // TODO - Remember what this is
// Uniforms 
var modelLocation;
var viewLocation;
var timeLocation;
var projectionLocation;
var sunDir_location;
var camPos_location;
var ambient_p_location;
var sun_p_location;
var spk_p_location;
var shn_p_location;
var point_color_location;
function shader_vars_initialize(prog) {
    modelLocation = gl.getUniformLocation(prog, "model")
    viewLocation = gl.getUniformLocation(prog, "view")
    timeLocation = gl.getUniformLocation(prog, "u_time"); 
    projectionLocation = gl.getUniformLocation(prog, "projection"); 
    sunDir_location = gl.getUniformLocation(prog, "sun_dir"); 
    camPos_location = gl.getUniformLocation(prog, "cam_pos"); 
    ambient_p_location = gl.getUniformLocation(prog, "ambient_power"); 
    sun_p_location = gl.getUniformLocation(prog, "sun_power"); 
    spk_p_location = gl.getUniformLocation(prog, "specular_power"); 
    shn_p_location = gl.getUniformLocation(prog, "shinyness"); 
    point_color_location = gl.getUniformLocation(prog, "lightColor"); 
}
function shader_vars_apply(timeStamp) {
    // update aspect ratio:
    aspect_ratio = window.innerWidth / window.innerHeight;

    if(modelLocation) {gl.uniformMatrix4fv(modelLocation, true, model.data);}
    if(viewLocation) {gl.uniformMatrix4fv(viewLocation, true, get_camera_matrix().data);}
    if(timeLocation) {gl.uniform1f(timeLocation, timeStamp/1000.0);}
    if(projectionLocation) {gl.uniformMatrix4fv(projectionLocation, true, get_projection_matrix().data);}
    //if(sunDir_location) {let thingy = Mat4.rotation_xy(0.1).mul(Mat4.rotation_xz(timeStamp/10000.0)).basis_z();gl.uniform3f(sunDir_location, thingy.x, thingy.y, thingy.z);}
    if(sunDir_location) {let thingy = Mat4.rotation_xy(0.1).mul(Mat4.rotation_xz(0.75)).basis_z();gl.uniform3f(sunDir_location, thingy.x, thingy.y, thingy.z);}
    if(camPos_location) {let cPos = cam_transform.position();gl.uniform3f(camPos_location, cPos.x, cPos.y, cPos.z);}
    if(ambient_p_location) {gl.uniform1f(ambient_p_location, document.getElementById("amb_pwr").value);}
    if(sun_p_location) {gl.uniform1f(sun_p_location, document.getElementById("sun_pwr").value);}
    if(spk_p_location) {gl.uniform1f(spk_p_location, document.getElementById("spk_pwr").value);}
    if(shn_p_location) {gl.uniform1f(shn_p_location, document.getElementById("shn_pwr").value);}
    if(point_color_location) {
        let hex = document.getElementById("light_color").value;
        let [r, g, b] = [parseInt(hex.slice(1, 3), 16) / 255, parseInt(hex.slice(3, 5), 16) / 255, parseInt(hex.slice(5, 7), 16) / 255];
        //console.log(r, g, b);  // Output: 0.3647, 0.698, 1
        gl.uniform3f(point_color_location, r, g, b);
    }
}
// !SECTION End shader var management

function renderLoop(timeStamp) { 
    gl.clearColor(0.1,0.0,0.1, 1.0);
    gl.clear( gl.COLOR_BUFFER_BIT );
    let geometry_total = verts.length / 12;
    let delta = (timeStamp - last_time_for_delta_calc) * 0.0001;
    last_time_for_delta_calc = timeStamp;


    // move camera for smoothness:
    let cam_move = Mat4.translation(cam_velocity.scaled(delta * 100).x, cam_velocity.scaled(delta * 100).y, cam_velocity.scaled(delta * 100).z)
    cam_transform = cam_transform.mul(cam_move);
    // Render
    shader_vars_apply(timeStamp);
    gl.drawArrays( gl.TRIANGLES, 0, geometry_total);
    // recursive invocation
    window.requestAnimationFrame(renderLoop);

}

var scene = new Node(); // root node
function game_loop_fixed_update() {
	// Todo, start recursive scene step
	scene._process(1/60);
    
    if(Input.is_key_pressed("Backquote")) {toggle_debout();}
	// Input management: Clear momentary key states - other input happens here, so I guess this is fine
	Input._process();
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

function print_items(glProgam) {
    console.log("Active GL uniforms:");
    const numUniforms = glProgam.getProgramParameter(shader_program, glProgam.ACTIVE_UNIFORMS);
    for (let i = 0; i < numUniforms; ++i) {
        const unif = glProgam.getActiveUniform(shader_program, i);
        console.log("\t", unif.name, unif.size, unif.type);
    }
    console.log("Active GL attributes:");
    const numAttribs = glProgam.getProgramParameter(shader_program, glProgam.ACTIVE_ATTRIBUTES);
    for (let i = 0; i < numAttribs; ++i) {
        const attrib = glProgam.getActiveAttrib(shader_program, i);
        console.log("\t", attrib.name, attrib.size, attrib.type);
    }
    console.log("Active GL textures: TEXTURE LIST NOT IMPLIMENTED");
}

// SECTION Katara's Hair
// NOTE - Because it has two loops
window.requestAnimationFrame(renderLoop);
setInterval(game_loop_fixed_update, 1000/60);
// !SECTION
load_text_resource("meshes/diamond.obj");