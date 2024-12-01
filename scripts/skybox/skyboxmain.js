"use strict";

function main() {
    // Get WebGL context
    /** @type {HTMLCanvasElement} */
    const canvas = document.getElementById("the-canvas");
    const gl = canvas.getContext("webgl2");
    if (!gl) {
        console.error("WebGL2 is not available on your browser.");
        return;
    }

    // Create the skybox
    const skybox = Skybox.create(gl);

    // Load and setup the cubemap texture
    const cubemapTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, cubemapTexture);

    // Define the six faces of the cubemap
    const faceInfos = [
        { target: gl.TEXTURE_CUBE_MAP_POSITIVE_X, url: 'img/right.png' },  // Right
        { target: gl.TEXTURE_CUBE_MAP_NEGATIVE_X, url: 'img/left.png' },   // Left
        { target: gl.TEXTURE_CUBE_MAP_POSITIVE_Y, url: 'img/top.png' },    // Top
        { target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, url: 'img/bottom.png' }, // Bottom
        { target: gl.TEXTURE_CUBE_MAP_POSITIVE_Z, url: 'img/front.png' },  // Front
        { target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, url: 'img/back.png' },   // Back
    ];

    faceInfos.forEach((face) => {
        const { target, url } = face;
        const level = 0;
        const internalFormat = gl.RGBA;
        const width = 512; // Placeholder size
        const height = 512;
        const format = gl.RGBA;
        const type = gl.UNSIGNED_BYTE;

        gl.texImage2D(target, level, internalFormat, width, height, 0, format, type, null);

        const image = new Image();
        image.src = url;
        image.onload = function () {
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, cubemapTexture);
            gl.texImage2D(target, level, internalFormat, format, type, image);
            gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
        };
    });

    gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);

    // Animation loop
    let then = 0;

  function resizeCanvasToDisplaySize(canvas, multiplier) {
    multiplier = multiplier || 1;
    const width  = canvas.clientWidth  * multiplier | 0;
    const height = canvas.clientHeight * multiplier | 0;
    if (canvas.width !== width ||  canvas.height !== height) {
      canvas.width  = width;
      canvas.height = height;
      return true;
    }
    return false;
  }

    function render(now) {
        now *= 0.001; // Convert to seconds
        const deltaTime = now - then;
        then = now;

        // Resize canvas to fit display
        resizeCanvasToDisplaySize(gl.canvas);

        // Set viewport and clear buffers
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // Compute matrices
        const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
        const fieldOfViewRadians = Math.PI / 3; // 60 degrees
        const projectionMatrix = m4.perspective(fieldOfViewRadians, aspect, 8, 60000);

        const cameraPosition = [Math.cos(now * 0.1) * 2, 0, Math.sin(now * 0.1) * 2];
        const target = [0, 0, 0];
        const up = [0, 1, 0];

        const cameraMatrix = m4.lookAt(cameraPosition, target, up);
        const viewMatrix = m4.inverse(cameraMatrix);

        // Remove translation for skybox rendering
        viewMatrix[12] = 0;
        viewMatrix[13] = 0;
        viewMatrix[14] = 0;

        const viewProjectionMatrix = m4.multiply(projectionMatrix, viewMatrix);
        const viewProjectionInverseMatrix = m4.inverse(viewProjectionMatrix);

        // Render skybox
        Skybox.render(gl, skybox, viewProjectionInverseMatrix, cubemapTexture);

        requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
}

main();
