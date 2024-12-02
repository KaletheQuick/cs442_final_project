function resizeCanvasToDisplaySize(canvas) {
    const displayWidth  = canvas.clientWidth;
    const displayHeight = canvas.clientHeight;

    if (canvas.width  !== displayWidth || canvas.height !== displayHeight) {
        canvas.width  = displayWidth;
        canvas.height = displayHeight;
    }
}

function main() {
    const canvas = document.getElementById("the-canvas");
    const gl = canvas.getContext("webgl2");
    if (!gl) return console.error("WebGL2 not supported.");

    const skybox = Skybox.create(gl);
    const cubemapTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, cubemapTexture);

    const faceInfos = [
        { target: gl.TEXTURE_CUBE_MAP_POSITIVE_X, url: 'img/right.png' },
        { target: gl.TEXTURE_CUBE_MAP_NEGATIVE_X, url: 'img/left.png' },
        { target: gl.TEXTURE_CUBE_MAP_POSITIVE_Y, url: 'img/top.png' },
        { target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, url: 'img/bottom.png' },
        { target: gl.TEXTURE_CUBE_MAP_POSITIVE_Z, url: 'img/front.png' },
        { target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, url: 'img/back.png' },
    ];

    faceInfos.forEach(({ target, url }) => {
        const image = new Image();
        image.src = url;
        image.onload = () => {
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, cubemapTexture);
            gl.texImage2D(target, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
            gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
        };
    });

    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);

    let then = 0;

function render(now) {
    now *= 0.001;
    const deltaTime = now - then;
    then = now;

    resizeCanvasToDisplaySize(gl.canvas);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const projectionMatrix = Mat4.perspective(Math.PI / 3, aspect, 1, 1000);

    const cameraPosition = [Math.sin(now) * 5, 0, Math.cos(now) * 5];
    const cameraMatrix = Mat4.lookAt(cameraPosition, [0, 0, 0], [0, 1, 0]);

    // Remove translation from view matrix for skybox
    const viewMatrix = cameraMatrix.clone();
    viewMatrix.data[12] = 0;
    viewMatrix.data[13] = 0;
    viewMatrix.data[14] = 0;

    const viewProjectionMatrix = Mat4.multiply(projectionMatrix, viewMatrix);
    const viewProjectionInverseMatrix = viewProjectionMatrix.inverse();

    Skybox.render(gl, skybox, viewProjectionInverseMatrix, cubemapTexture);

    requestAnimationFrame(render);
}

    requestAnimationFrame(render);
}

main();
