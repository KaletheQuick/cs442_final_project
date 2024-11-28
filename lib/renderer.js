// TODO - Isolate rendering to this file. 
// TODO - Consider how rendering could be isolated to this file
// NOTE - I mean like how do we want 'main' to interact with this? 

    /** @type {WebGLRenderingContext} */

var animate = false;
var perspective = false;
var aspect_ratio = window.innerWidth / window.innerHeight; 
let canvas = document.getElementById('the-canvas');

var gl = canvas.getContext( 'webgl2' );
var shader_program = create_compile_and_link_program( gl, vertex_source, fragment_source );
var vertex_buffer;
let loaded_obj = Mesh.primitive_plane(1,1,1,1);
var meshes = {}; // TODO move to mesh.js class so that the mesh thing manages meshes.
let verts = loaded_obj.to_indexed_render_array(0);


VERTEX_STRIDE = 52;

// SECTION -- Camera Variables, 
let cam_transform = Mat4.translation(0,0,5).mul(Mat4.rotation_xz(0.5));
let cam_velocity = new Vec4(0,0,0);
let cam_euler = new Vec4(0,0,0);
// !SECTION

function load_text_resource(file_name) {
    if(file_name == "plane") {
        loaded_obj = Mesh.primitive_plane(2,2,5,5);
        meshes[file_name] = loaded_obj;
    } else if(file_name == "cylinder") {
        loaded_obj = Mesh.primitive_cylinder(1,1,32,32);
        meshes[file_name] = loaded_obj;
    } else if(file_name == "sphere") {
        loaded_obj = Mesh.primitive_sphere_uv(1,1,16,16);
        meshes[file_name] = loaded_obj;
    } else if(file_name == "koun") {
        loaded_obj = Mesh.primitive_koun(1,1,32,32);
        meshes[file_name] = loaded_obj;
    } else if(file_name == "boul") {
        loaded_obj = Mesh.primitive_boul(1,1,32,32);
        meshes[file_name] = loaded_obj;
    } else if(file_name == "onion") {
        loaded_obj = Mesh.primitive_onion(1,1,32,32);
        meshes[file_name] = loaded_obj;
    } else {
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
            loaded_obj = Mesh.from_obj(request.responseText);
            logger.innerHTML = request.responseText;
            meshes[file_name] = loaded_obj;
            renderer_init();
        }
    
        request.open('GET', file_name);
        request.send();
        loaded_obj = Mesh.from_obj(request.responseText);
    }
}

function load_matrix_from_user_input() {
    let data = new Array();
    // load the model matrix from user input
    for( let i = 0; i < 16; i++ ) {
        data.push( parseFloat( document.getElementById( 'matrix-data-' + i ).value ) );
    }

    return new Mat4( data );
}

function get_camera_matrix() {
//    return cam_transform.inverse();
	return Camera.main.node.model.inverse();
}

function get_projection_matrix() {
    let fov_rad = Camera.main.fov_rad;
    let clip_near = Camera.main.clip_near;
    let clip_far = Camera.main.clip_far;
    
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
image.src = "img/albedo.png";
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

var model2Loc;
function shader_vars_initialize(prog) {
    modelLocation = gl.getUniformLocation(prog, "model");
    viewLocation = gl.getUniformLocation(prog, "view");
    timeLocation = gl.getUniformLocation(prog, "u_time"); 
    projectionLocation = gl.getUniformLocation(prog, "projection"); 
    sunDir_location = gl.getUniformLocation(prog, "sun_dir"); 
    camPos_location = gl.getUniformLocation(prog, "cam_pos"); 
    ambient_p_location = gl.getUniformLocation(prog, "ambient_power"); 
    sun_p_location = gl.getUniformLocation(prog, "sun_power"); 
    spk_p_location = gl.getUniformLocation(prog, "specular_power"); 
    shn_p_location = gl.getUniformLocation(prog, "shinyness"); 
    point_color_location = gl.getUniformLocation(prog, "lightColor"); 
    
    model2Loc = gl.getUniformLocation(prog, "model[1]");
}
function shader_vars_apply(timeStamp) {
    // update aspect ratio:
    aspect_ratio = window.innerWidth / window.innerHeight;

    if(modelLocation) {
        gl.uniformMatrix4fv(modelLocation, true, compileMatrixArray());
        //gl.uniformMatrix4fv(model2Loc, true, Mat4.translation(-1,0,0).data);
    }

    // set uniforms
    if(viewLocation) {gl.uniformMatrix4fv(viewLocation, true, get_camera_matrix().data);}
    if(timeLocation) {gl.uniform1f(timeLocation, timeStamp/1000.0);}
    if(projectionLocation) {gl.uniformMatrix4fv(projectionLocation, true, get_projection_matrix().data);}
    if(sunDir_location) {let thingy = Mat4.rotation_xy(0.1).mul(Mat4.rotation_xz(0.75)).basis_z();gl.uniform3f(sunDir_location, thingy.x, thingy.y, thingy.z);}
    if(camPos_location) {let cPos = cam_transform.position();gl.uniform3f(camPos_location, cPos.x, cPos.y, cPos.z);}
    if(ambient_p_location) {gl.uniform1f(ambient_p_location, document.getElementById("amb_pwr").value);}
    if(sun_p_location) {gl.uniform1f(sun_p_location, document.getElementById("sun_pwr").value);}
    if(spk_p_location) {gl.uniform1f(spk_p_location, document.getElementById("spk_pwr").value);}
    if(shn_p_location) {gl.uniform1f(shn_p_location, document.getElementById("shn_pwr").value);}
    if(point_color_location) {
        let hex = document.getElementById("light_color").value;
        let [r, g, b] = [parseInt(hex.slice(1, 3), 16) / 255, parseInt(hex.slice(3, 5), 16) / 255, parseInt(hex.slice(5, 7), 16) / 255];

        gl.uniform3f(point_color_location, r, g, b);
    }
}

// combine mesh model matrices into one array of raw matrix data
// (matrix data will be pulled from node later, 3 static objects for now)
function compileMatrixArray() {
	returnable = [];
	for (let index = 0; index < MeshRenderer.all.length; index++) {
		const element = MeshRenderer.all[index];
		returnable = returnable.concat(element.node.model.data);
	}
    return returnable;
}

// !SECTION End shader var management

function renderer_init() {
    // GL vars and config
    vertex_buffer = create_and_load_vertex_buffer(gl, verts, gl.STATIC_DRAW);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);
    gl.frontFace(gl.CW) ;

    // compile ZUPER MESH
    for (let index = 0; index < MeshRenderer.all.length; index++) {
        const element = MeshRenderer.all[index];
        verts = verts.concat(meshes[element.mesh].to_indexed_render_array(index));
    }
//    meshes["meshes/ring.obj"].to_indexed_render_array(0)
//            .concat(meshes["meshes/d4.obj"].to_indexed_render_array(1))
//            .concat(meshes["meshes/ship.obj"].to_indexed_render_array(2));

    //verts = loaded_obj.to_indexed_render_array(1);
    //verts.push(loaded_obj.to_indexed_render_array(1));
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
    set_vertex_attrib_to_buffer( 
        gl, shader_program, 
        "matIndex", 
        vertex_buffer, 1, 
        gl.FLOAT, false, VERTEX_STRIDE, (3*4)+(4*4)+(3*4)+(2*4)
    );
    set_render_params( gl );
    shader_vars_initialize(shader_program);
}

function renderLoop(timeStamp) { 
    gl.clearColor(0.1,0.0,0.1, 1.0);
    gl.clear( gl.COLOR_BUFFER_BIT );
    let geometry_total = verts.length / 13;
    let delta = (timeStamp - last_time_for_delta_calc) * 0.0001;
    last_time_for_delta_calc = timeStamp;


    // move camera for smoothness:
    let cam_move = Mat4.translation(cam_velocity.scaled(delta * 100).x, cam_velocity.scaled(delta * 100).y, cam_velocity.scaled(delta * 100).z)
    cam_transform = cam_transform.mul(cam_move);
    // Render
    shader_vars_apply(timeStamp);
    gl.drawArrays( gl.TRIANGLES, 0, geometry_total);
    //gl.drawElements(gl.TRIANGLES, geometry_total, gl.UNSIGNED_SHORT, 0);
    // recursive invocation
    window.requestAnimationFrame(renderLoop);

}
function print_gl_items(glProgam) {
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


