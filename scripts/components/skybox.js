class Skybox {
    constructor(gl, shaderProgram, size = 1) {
        this.gl = gl;
        this.shaderProgram = shaderProgram;
        this.size = size;
        this.init();
    }

    init() {
        const { gl, size } = this;

        // the cube vertices
        const vertices = [
            -size,  size, -size,   -size, -size, -size,   size, -size, -size,    size,  size, -size,
            -size, -size,  size,   -size,  size,  size,    size,  size,  size,    size, -size,  size,
            -size,  size, -size,   size,  size, -size,    size,  size,  size,   -size,  size,  size,
            -size, -size,  size,    size, -size,  size,    size, -size, -size,  -size, -size, -size,
             size, -size, -size,    size, -size,  size,    size,  size,  size,    size,  size, -size,
            -size, -size,  size,   -size, -size, -size,   -size,  size, -size,   -size,  size,  size
        ];

        //the cube indices
        const indices = [
            0,  1,  2,   0,  2,  3,  // Front
            4,  5,  6,   4,  6,  7,  // Back
            8,  9, 10,   8, 10, 11,  // Top
            12, 13, 14,  12, 14, 15,  // Bottom
            16, 17, 18,  16, 18, 19,  // Right
            20, 21, 22,  20, 22, 23   // Left
        ];

        this.vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

        this.indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

        this.numIndices = indices.length;
    }

    render(viewMatrix, projectionMatrix, cubemapTexture) {
        const { gl, shaderProgram } = this;

        gl.useProgram(shaderProgram);

        // binding the different buffers
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        const positionLoc = gl.getAttribLocation(shaderProgram, "a_position");
        gl.enableVertexAttribArray(positionLoc);
        gl.vertexAttribPointer(positionLoc, 3, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

        
        const viewLoc = gl.getUniformLocation(shaderProgram, "u_view");
        const projLoc = gl.getUniformLocation(shaderProgram, "u_projection");
        gl.uniformMatrix4fv(viewLoc, false, viewMatrix);
        gl.uniformMatrix4fv(projLoc, false, projectionMatrix);

        // binding the cubemap texture
        const textureLoc = gl.getUniformLocation(shaderProgram, "u_cubemap");
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, cubemapTexture);
        gl.uniform1i(textureLoc, 0);

        // drawing the skybox
        gl.drawElements(gl.TRIANGLES, this.numIndices, gl.UNSIGNED_SHORT, 0);

        
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);
    }
}
