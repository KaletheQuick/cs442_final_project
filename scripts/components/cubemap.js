function loadCubeMap (gl, faceInfos)  {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);

    faceInfos.forEach(({ target, url }) => {
        const image = new Image();
        image.src = url;
        image.onload = () => {
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
            gl.texImage2D(target, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
            gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
        };
    });

    return texture;
};

const faceInfos = [
    { target: gl.TEXTURE_CUBE_MAP_POSITIVE_X, url: '../../img/right.png' },
    { target: gl.TEXTURE_CUBE_MAP_NEGATIVE_X, url: '../../img/left.png' },
    { target: gl.TEXTURE_CUBE_MAP_POSITIVE_Y, url: '../../img/top.png' },
    { target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, url: '../../img/bottom.png' },
    { target: gl.TEXTURE_CUBE_MAP_POSITIVE_Z, url: '../../img/front.png' },
    { target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, url: '../../img/back.png' },
];

const cubeMapTexture = loadCubeMap(gl, faceInfos);
