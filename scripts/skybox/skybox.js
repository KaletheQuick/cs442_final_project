class Skybox {
    static create(gl) {
const vertexShaderSrc = `#version 300 es
            in vec2 a_position;
            out vec4 v_position;
            void main() {
                v_position = vec4(a_position, 0.0, 1.0);
                gl_Position = v_position;
                gl_Position.z = 1.0;
            }
        `;

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
        const shaderProgram = Skybox.createShaderProgram(gl, vertexShaderSrc, fragmentShaderSrc);

        const positions = new Float32Array([
            -1, -1,
            1, -1,
            -1, 1,
            -1, 1,
            1, -1,
            1, 1
        ]);

        const vao = gl.createVertexArray();
        gl.bindVertexArray(vao);

        const positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

        const positionLoc = gl.getAttribLocation(shaderProgram, "a_position");
        gl.enableVertexAttribArray(positionLoc);
        gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);

        gl.bindVertexArray(null);

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
            throw new Error(gl.getProgramInfoLog(program));
        }

        return program;
    }

    static compileShader(gl, type, source) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            throw new Error(gl.getShaderInfoLog(shader));
        }

        return shader;
    }

    static render(gl, skybox, viewProjectionInverseMatrix, cubemapTexture) {
        const { vao, shaderProgram } = skybox;

        gl.useProgram(shaderProgram);
        gl.bindVertexArray(vao);

        const viewDirectionProjectionInverseLoc = gl.getUniformLocation(shaderProgram, "u_viewDirectionProjectionInverse");
        const skyboxLoc = gl.getUniformLocation(shaderProgram, "u_skybox");

        gl.uniformMatrix4fv(viewDirectionProjectionInverseLoc, false, viewProjectionInverseMatrix.transpose().data);



        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, cubemapTexture);
        gl.uniform1i(skyboxLoc, 0);

        gl.disable(gl.DEPTH_TEST);
        gl.disable(gl.CULL_FACE);

        gl.drawArrays(gl.TRIANGLES, 0, 6);

        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.CULL_FACE);

        gl.bindVertexArray(null);
    }
}
