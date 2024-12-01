// WebGL setup
const canvas = document.getElementById("glCanvas");
const gl = canvas.getContext("webgl2",{preserveDrawingBuffer: true});

if (!gl) {
    alert("WebGL2 is not available in your browser.");
    throw new Error("WebGL2 not supported");
}

// Set canvas dimensions
canvas.width = 800;
canvas.height = 600;
gl.viewport(0, 0, canvas.width, canvas.height);

// Utility: Compile Shader
function compileShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        throw new Error("Shader compile error");
    }
    return shader;
}

// Utility: Create Shader Program
function createProgram(gl, vertexSource, fragmentSource) {
    const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vertexSource);
    const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error(gl.getProgramInfoLog(program));
        gl.deleteProgram(program);
        throw new Error("Program link error");
    }
    return program;
}

// Vertex shader
const vertexShaderSource = `#version 300 es
in vec2 a_position;
uniform vec2 u_translation;
uniform vec2 u_scale;
void main() {
    vec2 scaledPosition = a_position * u_scale;
    vec2 translatedPosition = scaledPosition + u_translation;
    gl_Position = vec4(translatedPosition, 0.0, 1.0);
}`;

// Fragment shader
const fragmentShaderSource = `#version 300 es
precision highp float;
out vec4 outColor;
uniform vec3 u_color;
void main() {
    outColor = vec4(u_color, 1.0);
}`;

// Compute shader
const computeShaderSource = `#version 300 es
precision highp float;
layout(location = 0) out vec4 outData;
uniform sampler2D u_inputTexture;

void main() {
    ivec2 coords = ivec2(gl_FragCoord.xy); // Get current fragment coordinate
    vec4 state = texelFetch(u_inputTexture, coords, 0); // Fetch current state: pos.x, pos.y, vel.x, vel.y

    // Update position using velocity
    vec2 newPosition = state.xy + state.zw * 0.01;

    // Reflect on boundaries
    vec2 newVelocity = state.zw;
   if (newPosition.x > 1.0 || newPosition.x < -1.0) {
    newVelocity.x *= -1.0;
    newPosition.x = clamp(newPosition.x, -1.0, 1.0); // Explicit clamping
}
if (newPosition.y > 1.0 || newPosition.y < -1.0) {
    newVelocity.y *= -1.0;
    newPosition.y = clamp(newPosition.y, -1.0, 1.0);
}

    outData = vec4(newPosition, newVelocity); // Write updated position and velocity

}`;

// Create programs
const renderProgram = createProgram(gl, vertexShaderSource, fragmentShaderSource);
const computeProgram = createProgram(gl, vertexShaderSource, computeShaderSource);

// Set up buffers
const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    -0.5, -0.5,  0.5, -0.5,  0.0,  0.5, // Triangle 1
    -0.6, -0.6, -0.4, -0.6, -0.5, -0.4, // Triangle 2
     0.4, -0.6,  0.6, -0.6,  0.5, -0.4  // Triangle 3
]), gl.STATIC_DRAW);

// Initial states: positions and velocities for triangles
const carStates = new Float32Array([
    -0.5, 0.0,  0.01,  0.005, // Triangle 1
     0.0, 0.0,  0.01, -0.005, // Triangle 2
     0.5, 0.0, -0.01,  0.005  // Triangle 3
]);

// Uniform locations
const translationLocation = gl.getUniformLocation(renderProgram, "u_translation");
const scaleLocation = gl.getUniformLocation(renderProgram, "u_scale");


// Create texture for car states
// Create two textures for ping-ponging
const carStateTextureA = gl.createTexture();
const carStateTextureB = gl.createTexture();
const ext = gl.getExtension("EXT_color_buffer_float");
const useFloatTextures = !!ext;

function initializeTexture(texture, data, useFloat) {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    if (useFloat) {
        gl.texImage2D(
            gl.TEXTURE_2D,
            0,                  // Mipmap level
            gl.RGBA32F,         // Internal format
            3,                  // Width
            1,                  // Height
            0,                  // Border
            gl.RGBA,            // Format
            gl.FLOAT,           // Type
            data
        );
    } else {
        gl.texImage2D(
            gl.TEXTURE_2D,
            0, 
            gl.RGBA, 
            3, 
            1, 
            0, 
            gl.RGBA, 
            gl.UNSIGNED_BYTE, 
            data
        );
    }
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
}

// Initialize textures with appropriate format
initializeTexture(carStateTextureA, carStates, useFloatTextures);
initializeTexture(carStateTextureB, null, useFloatTextures);


// Framebuffer setup
const framebuffer = gl.createFramebuffer();
gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);

let readTexture = carStateTextureA; // Start with texture A as the input
let writeTexture = carStateTextureB; // Start with texture B as the output

// Render function
function render() {
    // Step 1: Compute shader updates positions
    gl.useProgram(computeProgram);

    // Attach writeTexture to the framebuffer
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, writeTexture, 0);
    
    // Verify framebuffer completeness
    const fbStatus = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
    if (fbStatus !== gl.FRAMEBUFFER_COMPLETE) {
        console.error("Framebuffer incomplete:", fbStatus);
        return;
    }

    // Use readTexture as input to compute shader
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, readTexture);
    gl.uniform1i(gl.getUniformLocation(computeProgram, "u_inputTexture"), 0);

    // Set viewport to match texture dimensions
    gl.viewport(0, 0, 3, 1);

    // Execute compute shader
    gl.drawArrays(gl.POINTS, 0, 3);

    // Step 2: Read back updated states
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, readTexture, 0); // Bind readTexture
    const updatedStates = new Float32Array(12);
    gl.readPixels(0, 0, 3, 1, gl.RGBA, gl.FLOAT, updatedStates);
    console.log("Updated Car States:", updatedStates);

    for (let i = 0; i < 3; i++) {
        const x = updatedStates[i * 4];
        const y = updatedStates[i * 4 + 1];
        const vx = updatedStates[i * 4 + 2];
        const vy = updatedStates[i * 4 + 3];
        console.log(`Triangle ${i}: Position(${x}, ${y}), Velocity(${vx}, ${vy})`);
    }
    [readTexture, writeTexture] = [writeTexture, readTexture];

    // Switch to the default framebuffer for rendering
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Render triangles with updated positions
    gl.useProgram(renderProgram);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    const positionLocation = gl.getAttribLocation(renderProgram, "a_position");
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    for (let i = 0; i < 3; i++) {
        //const x = updatedStates[i * 4];
        //const y = updatedStates[i * 4 + 1];
        const x = 5;
        const y = 5;
        console.log("x: " + x + ", y: " + y);
        gl.uniform2f(translationLocation, x, y);
        gl.uniform2f(scaleLocation, 0.5, 0.5);
        gl.uniform3f(gl.getUniformLocation(renderProgram, "u_color"), Math.random(), Math.random(), Math.random());

        gl.drawArrays(gl.TRIANGLES, i * 3, 3);
    }
    for (var i = 0; i <2; i++) {
    requestAnimationFrame(render);
    }
}

render();