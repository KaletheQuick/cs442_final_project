function loadCubeMap (gl)  {
    let faceInfos = [
        { target: gl.TEXTURE_CUBE_MAP_POSITIVE_X, url: 'img/right_nebula.png' },
        { target: gl.TEXTURE_CUBE_MAP_NEGATIVE_X, url: 'img/left_nebula.png' },
        { target: gl.TEXTURE_CUBE_MAP_POSITIVE_Y, url: 'img/bottom_nebula.png' },
        { target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, url: 'img/top_nebula.png' },
        { target: gl.TEXTURE_CUBE_MAP_POSITIVE_Z, url: 'img/front_nebula.png' },
        { target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, url: 'img/back_nebula.png' },
    ];

    let texture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0 + 2); // Activate texture unit
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);

    faceInfos.forEach(({ target, url }) => {
        let image = new Image();
        image.src = url;
        image.onload = () => {
            gl.activeTexture(gl.TEXTURE0 + 2); // Activate texture unit
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
            gl.texImage2D(target, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
            gl.generateMipmap(gl.TEXTURE_CUBE_MAP);

            gl.uniform1i(refl_cubemap_location, 2); // Link to shader
            // NOTE Hardcoded constant          ^
        };
    });

    return texture;
};


//const cubeMapTexture = loadCubeMap(gl, faceInfos);
