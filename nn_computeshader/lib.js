/// TODO Implement
const canvas = document.getElementById("glCanvas");
const gl = canvas.getContext("webgl2");

// Ensure WebGL2 is supported
if (!gl) {
    alert("WebGL2 is not available in your browser.");
    throw new Error("WebGL2 not supported");
}

// Set canvas dimensions
canvas.width = 800;
canvas.height = 600;
gl.viewport(0, 0, canvas.width, canvas.height);

const vertexShaderSource = `
    attribute vec2 a_position;
    uniform vec2 u_translation;
    uniform vec2 u_scale;
    void main() {
        vec2 scaledPosition = a_position * u_scale;
        vec2 translatedPosition = scaledPosition + u_translation;
        gl_Position = vec4(translatedPosition, 0.0, 1.0);
    }
`;

// Fragment shader for the cars
const fragmentShaderSource = `
    precision highp float;
    uniform vec3 u_color;
    void main() {
        gl_FragColor = vec4(u_color, 1.0);
    }
`;

// Utility to compile shaders
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

// Create and link shader program
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

const program = createProgram(gl, vertexShaderSource, fragmentShaderSource);

// Define car geometry (a triangle)
const carVertices = new Float32Array([
    0.0,  0.1,  // Top
   -0.1, -0.1,  // Bottom left
    0.1, -0.1,  // Bottom right
]);

// Upload car geometry to the GPU
const carBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, carBuffer);
gl.bufferData(gl.ARRAY_BUFFER, carVertices, gl.STATIC_DRAW);

// Set up attributes and uniforms
const aPositionLocation = gl.getAttribLocation(program, "a_position");
const uTranslationLocation = gl.getUniformLocation(program, "u_translation");
const uScaleLocation = gl.getUniformLocation(program, "u_scale");
const uColorLocation = gl.getUniformLocation(program, "u_color");

gl.useProgram(program);
gl.enableVertexAttribArray(aPositionLocation);
gl.bindBuffer(gl.ARRAY_BUFFER, carBuffer);
gl.vertexAttribPointer(aPositionLocation, 2, gl.FLOAT, false, 0, 0);

// Set up three cars
const cars = [
    { position: [-0.6, 0.0], scale: [0.4, 0.4], color: [1.0, 0.0, 0.0] }, // Red car
    { position: [ 0.0, 0.0], scale: [0.4, 0.4], color: [0.0, 1.0, 0.0] }, // Green car
    { position: [ 0.6, 0.0], scale: [0.4, 0.4], color: [0.0, 0.0, 1.0] }, // Blue car
];

// Render function
function render() {
    gl.clearColor( 0.5, 0.8, 1.0, 1.0 );
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);

    // const car = cars[0]; // Test with the first car
    // gl.uniform2fv(uTranslationLocation, car.position);
    // gl.uniform2fv(uScaleLocation, car.scale);
    // gl.uniform3fv(uColorLocation, car.color);
    // console.log('u_translation:', car.position);
    // console.log('u_scale:', car.scale);
    // console.log('u_color:', car.color);

    // gl.drawArrays(gl.TRIANGLES, 0, 3);

    cars.forEach(car => {
        gl.uniform2fv(uTranslationLocation, car.position);
        gl.uniform2fv(uScaleLocation, car.scale);
        gl.uniform3fv(uColorLocation, car.color);
        console.log(cars);
        //console.log(gl.getParameter(gl.CURRENT_PROGRAM));
        gl.drawArrays(gl.TRIANGLES, 0, 3);
    });

    requestAnimationFrame(render);
}

// Start rendering
render();
