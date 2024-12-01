/**
 * Skybox rendering class using quad-based rendering
 */
class Skybox {
    static create(gl) {
        // Vertex shader source
        const vertexShaderSrc = `#version 300 es
            in vec2 a_position;
            out vec4 v_position;
            void main() {
                v_position = vec4(a_position, 0.0, 1.0);
                gl_Position = v_position;
                gl_Position.z = 1.0; // Push to farthest depth
            }
        `;

        // Fragment shader source
        const fragmentShaderSrc = `#version 300 es
            precision mediump float;
            uniform samplerCube u_skybox;
            uniform mat4 u_viewDirectionProjectionInverse;
            in vec4 v_position;
            out vec4 outColor;
            void main() {
                vec4 t = u_viewDirectionProjectionInverse * v_position;
                outColor = texture(u_skybox, normalize(t.xyz / t.w));
            }
        `;

        // Compile and link shaders into a program
        const shaderProgram = Skybox.createShaderProgram(gl, vertexShaderSrc, fragmentShaderSrc);

        // Setup a quad covering the canvas in clip space
        const positions = new Float32Array([
            -1, -1,
             1, -1,
            -1,  1,
            -1,  1,
             1, -1,
             1,  1
        ]);

        const vao = gl.createVertexArray();
        gl.bindVertexArray(vao);

        // Create and bind the position buffer
        const positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

        const positionLoc = gl.getAttribLocation(shaderProgram, "a_position");
        gl.enableVertexAttribArray(positionLoc);
        gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);

        gl.bindVertexArray(null); // Unbind VAO

        return { vao, positionBuffer, shaderProgram };
    }

    static createShaderProgram(gl, vertexSrc, fragmentSrc) {
        const vertexShader = Skybox.compileShader(gl, gl.VERTEX_SHADER, vertexSrc);
        const fragmentShader = Skybox.compileShader(gl, gl.FRAGMENT_SHADER, fragmentSrc);

        const program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);

        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            const info = gl.getProgramInfoLog(program);
            console.error('Could not link program:', info);
            gl.deleteProgram(program);
            throw new Error("Program linking failed: " + info);
        }

        return program;
    }

    static compileShader(gl, type, source) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            const info = gl.getShaderInfoLog(shader);
            console.error('Could not compile shader:', info);
            console.error('Shader source:', source);
            gl.deleteShader(shader);
            throw new Error("Shader compilation failed: " + info);
        }

        return shader;
    }

    static render(gl, skybox, viewProjectionInverseMatrix, cubemapTexture) {
        const { vao, shaderProgram } = skybox;

        gl.useProgram(shaderProgram);

        // Bind the VAO
        gl.bindVertexArray(vao);

        // Set uniforms
        const viewDirectionProjectionInverseLoc = gl.getUniformLocation(shaderProgram, "u_viewDirectionProjectionInverse");
        const skyboxLoc = gl.getUniformLocation(shaderProgram, "u_skybox");

        if (viewDirectionProjectionInverseLoc === -1) {
            console.error('Uniform u_viewDirectionProjectionInverse not found');
        }
        if (skyboxLoc === -1) {
            console.error('Uniform u_skybox not found');
        }

        gl.uniformMatrix4fv(viewDirectionProjectionInverseLoc, false, viewProjectionInverseMatrix);

        // Bind the cubemap texture
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, cubemapTexture);
        gl.uniform1i(skyboxLoc, 0);

        // Disable depth testing and face culling
        const wasDepthTestEnabled = gl.isEnabled(gl.DEPTH_TEST);
        const wasCullFaceEnabled = gl.isEnabled(gl.CULL_FACE);
        gl.disable(gl.DEPTH_TEST);
        gl.disable(gl.CULL_FACE);

        // Draw the skybox
        gl.drawArrays(gl.TRIANGLES, 0, 6);

        // Restore previous state
        if (wasDepthTestEnabled) gl.enable(gl.DEPTH_TEST);
        if (wasCullFaceEnabled) gl.enable(gl.CULL_FACE);

        gl.bindVertexArray(null); // Unbind VAO
    }
}
