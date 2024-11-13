
const VERTEX_STRIDE = 28;

class Mesh {
    /** 
     * Creates a new mesh and loads it into video memory.
     * 
     * @param {WebGLRenderingContext} gl  
     * @param {number} program
     * @param {number[]} vertices
     * @param {number[]} indices
    */
    constructor( gl, program, vertices, indices ) {
        this.verts = create_and_load_vertex_buffer( gl, vertices, gl.STATIC_DRAW );
        this.indis = create_and_load_elements_buffer( gl, indices, gl.STATIC_DRAW );
        this.n_verts = vertices.length;
        this.n_indis = indices.length;
        this.program = program;
    }

    /**
     * Create a box mesh with the given dimensions and colors.
     * @param {WebGLRenderingContext} gl 
     * @param {number} width 
     * @param {number} height 
     * @param {number} depth 
     */

    static box( gl, program, width, height, depth ) {
        let hwidth = width / 2.0;
        let hheight = height / 2.0;
        let hdepth = depth / 2.0;

        let verts = [
            hwidth, -hheight, -hdepth,      1.0, 0.0, 0.0, 1.0,  
            -hwidth, -hheight, -hdepth,     0.0, 1.0, 0.0, 1.0,
            -hwidth, hheight, -hdepth,      0.0, 0.0, 1.0, 1.0,
            hwidth, hheight, -hdepth,       1.0, 1.0, 0.0, 1.0,

            hwidth, -hheight, hdepth,       1.0, 0.0, 1.0, 1.0,
            -hwidth, -hheight, hdepth,      0.0, 1.0, 1.0, 1.0,
            -hwidth, hheight, hdepth,       0.5, 0.5, 1.0, 1.0,
            hwidth, hheight, hdepth,        1.0, 1.0, 0.5, 1.0,
        ];

        let indis = [
            // clockwise winding
            
            0, 1, 2, 2, 3, 0, 
            4, 0, 3, 3, 7, 4, 
            5, 4, 7, 7, 6, 5, 
            1, 5, 6, 6, 2, 1,
            3, 2, 6, 6, 7, 3,
            4, 5, 1, 1, 0, 4,
            

            // counter-clockwise winding
            /*
            0, 3, 2, 2, 1, 0,
            4, 7, 3, 3, 0, 4,
            5, 6, 7, 7, 4, 5,
            1, 2, 6, 6, 5, 1,
            3, 7, 6, 6, 2, 3,
            4, 0, 1, 1, 5, 4,
            */
        ];

        return new Mesh( gl, program, verts, indis );
    }



    /**
     * Render the mesh. Does NOT preserve array/index buffer or program bindings! 
     * 
     * @param {WebGLRenderingContext} gl 
     */
    render( gl ) {
    	gl.frontFace(gl.CW);
        gl.cullFace( gl.BACK );
        gl.enable( gl.CULL_FACE );
        
        gl.useProgram( this.program );
        gl.bindBuffer( gl.ARRAY_BUFFER, this.verts );
        gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, this.indis );

        set_vertex_attrib_to_buffer( 
            gl, this.program, 
            "coordinates", 
            this.verts, 3, 
            gl.FLOAT, false, VERTEX_STRIDE, 0 
        );


        // set_vertex_attrib_to_buffer( 
        //      gl, this.program, 
        //      "uv", 
        //      this.verts, 4, 
        //      gl.FLOAT, false, VERTEX_STRIDE, 12
        //  );

        const coordLoc = gl.getAttribLocation(this.program, "coordinates");
        const colorLoc = gl.getAttribLocation(this.program, "color");
        
        console.log(coordLoc, colorLoc);
        if (coordLoc === -1 || colorLoc === -1) {
            console.error("Could not find attributes");
            return;
        }
        gl.drawElements( gl.TRIANGLES, this.n_indis, gl.UNSIGNED_SHORT, 0 );
    }

    /**
     * Parse the given text as the body of an obj file.
     * @param {WebGLRenderingContext} gl
     * @param {WebGLProgram} program
     * @param {string} text
     */
    static from_obj_text(gl, program, text) {
        let coord_array = [];
        let elem_array = [];


        const faceColors = [
            [1.0, 0.0, 0.0, 1.0],  // Red
            [0.0, 1.0, 0.0, 1.0],  // Green
            [0.0, 0.0, 1.0, 1.0],  // Blue
            [1.0, 1.0, 0.0, 1.0],  // Yellow
            [1.0, 0.0, 1.0, 1.0],  // Magenta
            [0.0, 1.0, 1.0, 1.0]   // Cyan
        ];
        let faceIndex = 0;
    
        // Function to get a predefined color for each face
        const predefinedColor = () => faceColors[faceIndex++ % faceColors.length];

        // Split text into lines correctly
        let lines = text.split(/\r?\n/);

        lines.forEach(line => {
            line = line.trim();
            
            // Parsing vertices (v x y z)
            if (line.startsWith('v ')) {
                // Split correctly based on spaces
                let parts = line.split(/\s+/);
                let x = parseFloat(parts[1]);
                let y = parseFloat(parts[2]);
                let z = parseFloat(parts[3]);
                let faceColor = predefinedColor();

                coord_array.push(x, y, z, ...faceColor); 
                
            // Parsing faces (f v1 v2 v3 ...)
            } else if (line.startsWith('f ')) {
                // Split correctly based on spaces
                let parts = line.split(/\s+/).slice(1); // Skip the "f" part
                
                // Add each vertex index (convert from 1-based to 0-based)
                parts.forEach(vIndex => {
                    elem_array.push(parseInt(vIndex) - 1);
                });
            }
        });

        // Create mesh from parsed vertices and indices
        return new Mesh(gl, program, coord_array, elem_array);
}


    /**
     * Asynchronously load the obj file as a mesh.
     * @param {WebGLRenderingContext} gl
     * @param {string} file_name 
     * @param {WebGLProgram} program
     * @param {function} f the function to call and give mesh to when finished.
     */
    static from_obj_file( gl, file_name, program, f ) {
        let request = new XMLHttpRequest();
        
        // the function that will be called when the file is being loaded
        request.onreadystatechange = function() {
            // console.log( request.readyState );

            if( request.readyState != 4 ) { return; }
            if( request.status != 200 ) { 
                throw new Error( 'HTTP error when opening .obj file: ', request.statusText ); 
            }

            // now we know the file exists and is ready
            let loaded_mesh = Mesh.from_obj_text( gl, program, request.responseText );

            console.log( 'loaded ', file_name );
            f( loaded_mesh );
        };

        
        request.open( 'GET', file_name ); // initialize request. 
        request.send();                   // execute request
    }
}
