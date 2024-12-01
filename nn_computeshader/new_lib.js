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

layout(location = 0) out vec4 outData; // Output for computation
uniform sampler2D u_inputTexture;     // Input car state texture
uniform sampler2D u_weights;         // Weights texture
uniform float u_bias;                // Bias for the hidden layer

void main() {
    ivec2 coords = ivec2(gl_FragCoord.xy); // Compute coordinates
    vec4 carData = texelFetch(u_inputTexture, coords, 0); // Fetch car data (pos.x, pos.y, vel.x, vel.y)

    // Fetch weight for the hidden layer
    float weight = texelFetch(u_weights, ivec2(0, 0), 0).r;

    // Compute hidden layer activation
    float hiddenNeuron = max(0.0, carData.x * weight + u_bias); // ReLU activation

    // Update velocity and position
    vec2 newVelocity = carData.zw + vec2(hiddenNeuron, hiddenNeuron) * 0.01;
    vec2 newPosition = carData.xy + newVelocity * 0.01;

    // Handle boundary reflection
    if (newPosition.x > 1.0) {
        newPosition.x = 1.0;
        newVelocity.x = -abs(newVelocity.x);
    } else if (newPosition.x < -1.0) {
        newPosition.x = -1.0;
        newVelocity.x = abs(newVelocity.x);
    }

    if (newPosition.y > 1.0) {
        newPosition.y = 1.0;
        newVelocity.y = -abs(newVelocity.y);
    } else if (newPosition.y < -1.0) {
        newPosition.y = -1.0;
        newVelocity.y = abs(newVelocity.y);
    }

    // Output updated position and velocity
    outData = vec4(newPosition, newVelocity);
}`;

// Create programs
const renderProgram = createProgram(gl, vertexShaderSource, fragmentShaderSource);
const computeProgram = createProgram(gl, vertexShaderSource, computeShaderSource);

// Set up buffers
const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    -0.5, -0.5,  0.5, -0.5,  0.0,  0.5, // Triangle 1
    
]), gl.STATIC_DRAW);

// Initial states: positions and velocities for triangles
const carStates = new Float32Array([
    -0.5, 0.0, 0.01, 0.005, // Position (x, y) and velocity (vx, vy) for one car
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
            1,                  // Width
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
            1, 
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
    // Step 1: Compute Shader Updates
    gl.useProgram(computeProgram);

    // Bind framebuffer to writeTexture
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, writeTexture, 0);

    // Verify framebuffer completeness
    if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
        console.error("Framebuffer incomplete");
        return;
    }

    // Use readTexture as input
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, readTexture);
    gl.uniform1i(gl.getUniformLocation(computeProgram, "u_inputTexture"), 0);

    gl.viewport(0, 0, 1, 1);

    // Execute compute shader for one car
    gl.drawArrays(gl.POINTS, 0, 1);

    // Step 2: Read Updated State
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, readTexture, 0);
    const updatedState = new Float32Array(4); // Read one car's state
    gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.FLOAT, updatedState);

    // Log updated state
    const [x, y, vx, vy] = updatedState;
    console.log(`Car: Position(${x}, ${y}), Velocity(${vx}, ${vy})`);

    // Swap textures for next iteration
    [readTexture, writeTexture] = [writeTexture, readTexture];

    // Step 3: Render the Car
    gl.bindFramebuffer(gl.FRAMEBUFFER, null); // Render to the canvas
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(renderProgram);

    // Bind position buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    const positionLocation = gl.getAttribLocation(renderProgram, "a_position");
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    // Use updated position for rendering
    gl.uniform2f(translationLocation, x, y);
    gl.uniform2f(scaleLocation, 0.5, 0.5); // Scale
    gl.uniform3f(gl.getUniformLocation(renderProgram, "u_color"), 0.0, 1.0, 0.0); // Green color

    // Render the first triangle (one car)
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    // Request next frame
    requestAnimationFrame(render);
}

// Start rendering
render();