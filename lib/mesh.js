const TAU = Math.PI * 2;
class Mesh {

    constructor( data ) {
        if( data == null ) {
            this.verts = [ 
                -0.5, -0.25, 0.0,
                0, 0.6, 0.0,     
                0.5, -0.25, 0.0, 
            ];
            this.v_colors = [
                1.0, 0.0, 0.0, 1.0,
                0.0, 1.0, 0.0, 1.0,
                0.0, 0.0, 1.0, 1.0, 
            ]
            this.faces = [0,1,2];
			this.normals = [];
			this.uvs = [];
            this.recommended_scale = 1;
        }
        else {
            this.data = data;
        }
    }

    // loads and then parses an obj file, creating a new mesh
    static load_from_file(file_path, callback){ 
        let request = new XMLHttpRequest();

        request.onreadystatechange = function() {
            if(request.readyState != 4)
                return;
            if(request.status != 200) {
                console.log(file_path + " load failed. Err: " + request.statusText);
                return;
            }
            let mesh = Mesh.from_obj(request.responseText);
            callback(mesh);
        }
    
        request.open('GET', file_path);
        request.send();
    }

    static from_obj(obj_text) {
		// for performance testing only
		var t0 = performance.now();

        let returnable = new Mesh();
        let lines = obj_text.split( /\r?\n/ );
        returnable.verts = [];
        returnable.v_colors = [];
        returnable.faces = [];
        //let randCol = [Math.random(),Math.random(),Math.random(),1];
        for (let index = 0; index < lines.length; index++) {
            const element = lines[index];
            let ln_elements = element.split(" ");
            if(ln_elements[0] == "v") {
                let e_1 = parseFloat(ln_elements[1]);
                let e_2 = parseFloat(ln_elements[2]);
                let e_3 = parseFloat(ln_elements[3]);
                returnable.verts.push(e_1, e_2, e_3);
				if(ln_elements.length > 4) {
					// Vert colors with data assumed
					//console.log("Eyo issa bigboi");
					returnable.v_colors.push(parseFloat(ln_elements[4]),parseFloat(ln_elements[5]),parseFloat(ln_elements[6]),1);//Math.random(), Math.random(), Math.random(), 1);
				} else {
					returnable.v_colors.push(1,1,1,1);//Math.random(), Math.random(), Math.random(), 1);
				}
                let mag = Math.hypot(e_1, e_2, e_3);
                if (mag > returnable.recommended_scale) {
                    returnable.recommended_scale = mag;
                }

            } else if(ln_elements[0] == "f") {
                if(ln_elements[1].split("/").length == 1) {
                    let e_1 = parseInt(ln_elements[1].split("/")[0]);
                    let e_2 = parseInt(ln_elements[2].split("/")[0]);
                    let e_3 = parseInt(ln_elements[3].split("/")[0]);
                    returnable.faces.push([e_1 - 1]);
                    returnable.faces.push([e_2 - 1]);
                    returnable.faces.push([e_3 - 1]);
                } else {
                    // Normal and UV indexes in there as well
                    let face_data_index_array_1 = []

                    let e_1 = ln_elements[1].split("/");
                    let e_2 = ln_elements[2].split("/");
                    let e_3 = ln_elements[3].split("/");
                    returnable.faces.push([parseInt(e_1[0]) - 1,parseInt(e_1[1]) - 1,parseInt(e_1[2]) - 1]);
                    returnable.faces.push([parseInt(e_2[0]) - 1,parseInt(e_2[1]) - 1,parseInt(e_2[2]) - 1]);
                    returnable.faces.push([parseInt(e_3[0]) - 1,parseInt(e_3[1]) - 1,parseInt(e_3[2]) - 1]);
                }

            }else if(ln_elements[0] == "vn") {
                let e_1 = parseFloat(ln_elements[1]);
                let e_2 = parseFloat(ln_elements[2]);
                let e_3 = parseFloat(ln_elements[3]);
                returnable.normals.push(e_1, e_2, e_3);
            } else if(ln_elements[0] == "vt") {
                //console.log(element);
                //console.log("UV cord? - ", ln_elements[1], ln_elements[2]);
                let e_1 = parseFloat(ln_elements[1]);
                let e_2 = parseFloat(ln_elements[2]);
                returnable.uvs.push(-e_1, e_2);
			}
        }
        returnable.recommended_scale = 1 / (returnable.recommended_scale + 0.1);

		// for performance testing only
		var t1 = performance.now();
		//console.log("Call to loadOBJ took " + (t1 - t0) + " milliseconds.");

        return returnable;
    }

    /**
     * Creates a plane centered on 0, 
     * with div_x divisions across the X,
     * and div_y divisions across the Y.
     * 
     * @param {Number} width 
     * @param {Number} height 
     * @param {Number} div_x 
     * @param {Number} div_y 
     * 
     * @returns {Mesh}
     */
    static primitive_plane(width, height, div_x, div_y) {
        let returnable = new Mesh();
        returnable.verts = [];
        returnable.v_colors = [];
        returnable.faces = [];
        returnable.normals = [0,1.007,0];

        let x_step = width/div_x;
        let y_step = height/div_y;
        let x_start = -(width*0.5);
        let y_start = -(height*0.5);
        for (let x = 0; x < div_x; x++) {
            for (let y = 0; y < div_y; y++) {
            // Tri one
                // Upper Left 
                returnable.verts.push(x_start + (x_step * x),-y_start -(y_step*y),0.0); // Vert Positio
                returnable.v_colors.push(0.5,0.5,0.5,1); // vert colorie
                returnable.uvs.push((x/div_x),-(y/div_y));
                // Upper Right 
                returnable.verts.push(x_start + (x_step * (x+1)),-y_start -(y_step*y),0.0); // Vert Positio
                returnable.v_colors.push(0.5,0.5,0.5,1); // vert colorie
                returnable.uvs.push(((x+1)/div_x),-(y/div_y));
                // Bottom Left 
                returnable.verts.push(x_start + (x_step * x),-y_start - (y_step*(y+1)),0.0); // Vert Positio
                returnable.v_colors.push(0.5,0.5,0.5,1); // vert colorie
                returnable.uvs.push((x/div_x),-((y+1)/div_y));
            // Tri Two
                // Upper Right 
                returnable.verts.push(x_start + (x_step * (x+1)),-y_start -(y_step*y),0.0); // Vert Positio
                returnable.v_colors.push(0.5,0.5,0.5,1); // vert colorie
                returnable.uvs.push(((x+1)/div_x),-(y/div_y));
                // Bottom Right 
                returnable.verts.push(x_start + (x_step * (x+1)),-y_start - (y_step*(y+1)),0.0); // Vert Positio
                returnable.v_colors.push(0.5,0.5,0.5,1); // vert colorie
                returnable.uvs.push(((x+1)/div_x),-((y+1)/div_y));
                // Bottom Left 
                returnable.verts.push(x_start + (x_step * x),-y_start - (y_step*(y+1)),0.0); // Vert Positio
                returnable.v_colors.push(0.5,0.5,0.5,1); // vert colorie
                returnable.uvs.push((x/div_x),-((y+1)/div_y));
            // Face 1
                let en = returnable.verts.length / 3;
                let uv = Math.floor(returnable.uvs.length / 2);
                returnable.faces.push([en-6,uv-6,0]); // NOTE wrong
                returnable.faces.push([en-5,uv-5,0]);
                returnable.faces.push([en-4,uv-4,0]);
                returnable.faces.push([en-3,uv-3,0]);
                returnable.faces.push([en-2,uv-2,0]);
                returnable.faces.push([en-1,uv-1,0]);
            }
            // Face 2

        }

        return returnable;
    }


    /**
     * Creates a plane centered on 0, 
     * with div_x divisions across the X,
     * and div_y divisions across the Y.
     * 
     * @param {Number} radius 
     * @param {Number} height 
     * @param {Number} div_x 
     * @param {Number} div_y 
     * 
     * @returns {Mesh}
     */
    static primitive_cylinder(radius, height, div_x, div_y) {
        let returnable = new Mesh();
        returnable.verts = [];
        returnable.v_colors = [];
        returnable.faces = [];
        returnable.normals = [0,1.007,0];
        let radScale = radius / 2;
        let x_step = 1/div_x;
        let y_step = height/div_y;
        let x_start = -(1*0.5);
        let y_start = -(height*0.5);
        for (let x = 0; x < div_x; x++) {
            for (let y = 0; y < div_y; y++) {
            // Tri one
                // Upper Left 
                returnable.verts.push(Math.sin((x/div_x * TAU)) * radScale,-y_start -(y_step*y),Math.cos((x/div_x * TAU)) * radScale); // Vert Positio
                returnable.v_colors.push(0.5,0.5,0.5,1); // vert colorie
                returnable.uvs.push((x/div_x),-(y/div_y));
                // Upper Right 
                returnable.verts.push(Math.sin(((x+1)/div_x * TAU)) * radScale,-y_start -(y_step*y),Math.cos(((x+1)/div_x * TAU)) * radScale); // Vert Positio
                returnable.v_colors.push(0.5,0.5,0.5,1); // vert colorie
                returnable.uvs.push(((x+1)/div_x),-(y/div_y));
                // Bottom Left 
                returnable.verts.push(Math.sin((x/div_x * TAU)) * radScale,-y_start - (y_step*(y+1)),Math.cos((x/div_x * TAU)) * radScale); // Vert Positio
                returnable.v_colors.push(0.5,0.5,0.5,1); // vert colorie
                returnable.uvs.push((x/div_x),-((y+1)/div_y));
            // Tri Two
                // Upper Right 
                returnable.verts.push(Math.sin(((x+1)/div_x * TAU)) * radScale,-y_start -(y_step*y),Math.cos(((x+1)/div_x * TAU)) * radScale); // Vert Positio
                returnable.v_colors.push(0.5,0.5,0.5,1); // vert colorie
                returnable.uvs.push(((x+1)/div_x),-(y/div_y));
                // Bottom Right 
                returnable.verts.push(Math.sin(((x+1)/div_x * TAU)) * radScale,-y_start - (y_step*(y+1)),Math.cos(((x+1)/div_x * TAU)) * radScale); // Vert Positio
                returnable.v_colors.push(0.5,0.5,0.5,1); // vert colorie
                returnable.uvs.push(((x+1)/div_x),-((y+1)/div_y));
                // Bottom Left 
                returnable.verts.push(Math.sin((x/div_x * TAU)) * radScale,-y_start - (y_step*(y+1)),Math.cos((x/div_x * TAU)) * radScale); // Vert Positio
                returnable.v_colors.push(0.5,0.5,0.5,1); // vert colorie
                returnable.uvs.push((x/div_x),-((y+1)/div_y));
            // Face 1
                let en = returnable.verts.length / 3;
                let uv = Math.floor(returnable.uvs.length / 2);
                returnable.faces.push([en-6,uv-6,0]); // NOTE wrong
                returnable.faces.push([en-5,uv-5,0]);
                returnable.faces.push([en-4,uv-4,0]);
                returnable.faces.push([en-3,uv-3,0]);
                returnable.faces.push([en-2,uv-2,0]);
                returnable.faces.push([en-1,uv-1,0]);
            }
            // Face 2

        }

        return returnable;
    }

    /**
     * Creates a plane centered on 0, 
     * with div_x divisions across the X,
     * and div_y divisions across the Y.
     * 
     * @param {Number} radius 
     * @param {Number} height 
     * @param {Number} div_x 
     * @param {Number} div_y 
     * 
     * @returns {Mesh}
     */
    static primitive_sphere_uv(radius, height, div_x, div_y) {
        let returnable = new Mesh();
        returnable.verts = [];
        returnable.v_colors = [];
        returnable.faces = [];
        let radScale = radius / 2;
        let x_step = 1/div_x;
        let y_step = (2 * radius) / div_y;
        let x_start = -(1*0.5);
        let y_start = radius;
        for (let y_lyr = 0; y_lyr < div_y; y_lyr++) {
            //if(y == 10) {break};
            let yTurns = y_lyr / div_y / 2 ;
            let y1 = Math.cos(yTurns * TAU) ;
            let y2 = Math.cos(((y_lyr+1) / div_y / 2) * TAU) ;;          
            let rs1 = Math.sin(2* Math.PI * yTurns);
            let rs2 = Math.sin(2* Math.PI * ((y_lyr+1) / div_y / 2));
            let y = y1;
            
            for (let x = 0; x < div_x; x++) {  
            // Tri one
                //radScale = Math.sin(y/div_y * Math.PI);
                //console.log("(", x, ",", y, "): Rad scale ", radScale);
                // Upper Left 
                returnable.verts.push(Math.sin((x/div_x * TAU)) * rs1,y1,Math.cos((x/div_x * TAU)) * rs1); // Vert Positio
                returnable.normals.push(Math.sin((x/div_x * TAU)) * rs1,y1,Math.cos((x/div_x * TAU)) * rs1) // Vert Normio
                returnable.v_colors.push(Math.random(),Math.random(),Math.random(),1); // vert colorie
                returnable.uvs.push((x/div_x),(y1/2) + 0.5);
                // Upper Right 
                returnable.verts.push(Math.sin(((x+1)/div_x * TAU)) * rs1,y1,Math.cos(((x+1)/div_x * TAU)) * rs1); // Vert Positio
                returnable.normals.push(Math.sin(((x+1)/div_x * TAU)) * rs1,y1,Math.cos(((x+1)/div_x * TAU)) * rs1) // Vert Normio
                returnable.v_colors.push(0.5,0.5,0.5,1); // vert colorie
                returnable.uvs.push(((x+1)/div_x),(y1/2) + 0.5);
                // Bottom Left 
                returnable.verts.push(Math.sin((x/div_x * TAU)) * rs2,y2,Math.cos((x/div_x * TAU)) * rs2); // Vert Positio
                returnable.normals.push(Math.sin((x/div_x * TAU)) * rs2,y2,Math.cos((x/div_x * TAU)) * rs2) // Vert Normio
                returnable.v_colors.push(0.5,0.5,0.5,1); // vert colorie
                returnable.uvs.push((x/div_x),(y2/2) + 0.5);
            // Tri Two
                //radScale = Math.sin((y)/div_y * Math.PI);
                // Upper Right 
                returnable.verts.push(Math.sin(((x+1)/div_x * TAU)) * rs1,y1,Math.cos(((x+1)/div_x * TAU)) * rs1); // Vert Positio
                returnable.normals.push(Math.sin(((x+1)/div_x * TAU)) * rs1,y1,Math.cos(((x+1)/div_x * TAU)) * rs1) // Vert Normio
                returnable.v_colors.push(0.5,0.5,0.5,1); // vert colorie
                returnable.uvs.push(((x+1)/div_x),(y1/2) + 0.5);
                // Bottom Right 
                returnable.verts.push(Math.sin(((x+1)/div_x * TAU)) * rs2,y2,Math.cos(((x+1)/div_x * TAU)) * rs2); // Vert Positio
                returnable.normals.push(Math.sin(((x+1)/div_x * TAU)) * rs2,y2,Math.cos(((x+1)/div_x * TAU)) * rs2) // Vert Normio
                returnable.v_colors.push(0.5,0.5,0.5,1); // vert colorie
                returnable.uvs.push(((x+1)/div_x),(y2/2) + 0.5);
                // Bottom Left 
                returnable.verts.push(Math.sin((x/div_x * TAU)) * rs2,y2,Math.cos((x/div_x * TAU)) * rs2); // Vert Positio
                returnable.normals.push(Math.sin((x/div_x * TAU)) * rs2,y2,Math.cos((x/div_x * TAU)) * rs2) // Vert Normio
                returnable.v_colors.push(0.5,0.5,0.5,1); // vert colorie
                returnable.uvs.push((x/div_x),(y2/2) + 0.5);
            // Face 1
                let en = returnable.verts.length / 3;
                let uv = Math.floor(returnable.uvs.length / 2);
                returnable.faces.push([en-6,uv-6,uv-6]); // NOTE wrong
                returnable.faces.push([en-5,uv-5,uv-5]);
                returnable.faces.push([en-4,uv-4,uv-4]);
                returnable.faces.push([en-3,uv-3,uv-3]);
                returnable.faces.push([en-2,uv-2,uv-2]);
                returnable.faces.push([en-1,uv-1,uv-1]);
            }
            // Face 2

        }

        return returnable;
    }


    /**
     * Creates a plane centered on 0, 
     * with div_x divisions across the X,
     * and div_y divisions across the Y.
     * 
     * @param {Number} radius 
     * @param {Number} height 
     * @param {Number} div_x 
     * @param {Number} div_y 
     * 
     * @returns {Mesh}
     */
    static primitive_koun(radius, height, div_x, div_y) {
        let returnable = new Mesh();
        returnable.verts = [];
        returnable.v_colors = [];
        returnable.faces = [];
        returnable.normals = [0,1.007,0];
        let radScale = radius / 2;
        let x_step = 1/div_x;
        let y_step = height/div_y;
        let x_start = -(1*0.5);
        let y_start = -(height*0.5);
        for (let x = 0; x < div_x; x++) {
            for (let y = 0; y < div_y; y++) {
                radScale = Math.sin(y/div_y);
            // Tri one
                // Upper Left 
                returnable.verts.push(Math.sin((x/div_x * TAU)) * radScale,-y_start -(y_step*y),Math.cos((x/div_x * TAU)) * radScale); // Vert Positio
                returnable.v_colors.push(0.5,0.5,0.5,1); // vert colorie
                returnable.uvs.push((x/div_x),-(y/div_y));
                // Upper Right 
                returnable.verts.push(Math.sin(((x+1)/div_x * TAU)) * radScale,-y_start -(y_step*y),Math.cos(((x+1)/div_x * TAU)) * radScale); // Vert Positio
                returnable.v_colors.push(0.5,0.5,0.5,1); // vert colorie
                returnable.uvs.push(((x+1)/div_x),-(y/div_y));
                // Bottom Left 
                returnable.verts.push(Math.sin((x/div_x * TAU)) * radScale,-y_start - (y_step*(y+1)),Math.cos((x/div_x * TAU)) * radScale); // Vert Positio
                returnable.v_colors.push(0.5,0.5,0.5,1); // vert colorie
                returnable.uvs.push((x/div_x),-((y+1)/div_y));
            // Tri Two
                // Upper Right 
                returnable.verts.push(Math.sin(((x+1)/div_x * TAU)) * radScale,-y_start -(y_step*y),Math.cos(((x+1)/div_x * TAU)) * radScale); // Vert Positio
                returnable.v_colors.push(0.5,0.5,0.5,1); // vert colorie
                returnable.uvs.push(((x+1)/div_x),-(y/div_y));
                // Bottom Right 
                returnable.verts.push(Math.sin(((x+1)/div_x * TAU)) * radScale,-y_start - (y_step*(y+1)),Math.cos(((x+1)/div_x * TAU)) * radScale); // Vert Positio
                returnable.v_colors.push(0.5,0.5,0.5,1); // vert colorie
                returnable.uvs.push(((x+1)/div_x),-((y+1)/div_y));
                // Bottom Left 
                returnable.verts.push(Math.sin((x/div_x * TAU)) * radScale,-y_start - (y_step*(y+1)),Math.cos((x/div_x * TAU)) * radScale); // Vert Positio
                returnable.v_colors.push(0.5,0.5,0.5,1); // vert colorie
                returnable.uvs.push((x/div_x),-((y+1)/div_y));
            // Face 1
                let en = returnable.verts.length / 3;
                let uv = Math.floor(returnable.uvs.length / 2);
                returnable.faces.push([en-6,uv-6,0]); // NOTE wrong
                returnable.faces.push([en-5,uv-5,0]);
                returnable.faces.push([en-4,uv-4,0]);
                returnable.faces.push([en-3,uv-3,0]);
                returnable.faces.push([en-2,uv-2,0]);
                returnable.faces.push([en-1,uv-1,0]);
            }
            // Face 2

        }

        return returnable;
    }


    /**
     * Creates a plane centered on 0, 
     * with div_x divisions across the X,
     * and div_y divisions across the Y.
     * 
     * @param {Number} radius 
     * @param {Number} height 
     * @param {Number} div_x 
     * @param {Number} div_y 
     * 
     * @returns {Mesh}
     */
    static primitive_boul(radius, height, div_x, div_y) {
        let returnable = new Mesh();
        returnable.verts = [];
        returnable.v_colors = [];
        returnable.faces = [];
        returnable.normals = [0,1.007,0];
        let radScale = radius / 2;
        let x_step = 1/div_x;
        let y_step = height/div_y;
        let x_start = -(1*0.5);
        let y_start = -(height*0.5);
        for (let x = 0; x < div_x; x++) {
            for (let y = 0; y < div_y; y++) {
                radScale = Math.cos(y/div_y);
            // Tri one
                // Upper Left 
                returnable.verts.push(Math.sin((x/div_x * TAU)) * radScale,-y_start -(y_step*y),Math.cos((x/div_x * TAU)) * radScale); // Vert Positio
                returnable.v_colors.push(0.5,0.5,0.5,1); // vert colorie
                returnable.uvs.push((x/div_x),-(y/div_y));
                // Upper Right 
                returnable.verts.push(Math.sin(((x+1)/div_x * TAU)) * radScale,-y_start -(y_step*y),Math.cos(((x+1)/div_x * TAU)) * radScale); // Vert Positio
                returnable.v_colors.push(0.5,0.5,0.5,1); // vert colorie
                returnable.uvs.push(((x+1)/div_x),-(y/div_y));
                // Bottom Left 
                returnable.verts.push(Math.sin((x/div_x * TAU)) * radScale,-y_start - (y_step*(y+1)),Math.cos((x/div_x * TAU)) * radScale); // Vert Positio
                returnable.v_colors.push(0.5,0.5,0.5,1); // vert colorie
                returnable.uvs.push((x/div_x),-((y+1)/div_y));
            // Tri Two
                // Upper Right 
                returnable.verts.push(Math.sin(((x+1)/div_x * TAU)) * radScale,-y_start -(y_step*y),Math.cos(((x+1)/div_x * TAU)) * radScale); // Vert Positio
                returnable.v_colors.push(0.5,0.5,0.5,1); // vert colorie
                returnable.uvs.push(((x+1)/div_x),-(y/div_y));
                // Bottom Right 
                returnable.verts.push(Math.sin(((x+1)/div_x * TAU)) * radScale,-y_start - (y_step*(y+1)),Math.cos(((x+1)/div_x * TAU)) * radScale); // Vert Positio
                returnable.v_colors.push(0.5,0.5,0.5,1); // vert colorie
                returnable.uvs.push(((x+1)/div_x),-((y+1)/div_y));
                // Bottom Left 
                returnable.verts.push(Math.sin((x/div_x * TAU)) * radScale,-y_start - (y_step*(y+1)),Math.cos((x/div_x * TAU)) * radScale); // Vert Positio
                returnable.v_colors.push(0.5,0.5,0.5,1); // vert colorie
                returnable.uvs.push((x/div_x),-((y+1)/div_y));
            // Face 1
                let en = returnable.verts.length / 3;
                let uv = Math.floor(returnable.uvs.length / 2);
                returnable.faces.push([en-6,uv-6,0]); // NOTE wrong
                returnable.faces.push([en-5,uv-5,0]);
                returnable.faces.push([en-4,uv-4,0]);
                returnable.faces.push([en-3,uv-3,0]);
                returnable.faces.push([en-2,uv-2,0]);
                returnable.faces.push([en-1,uv-1,0]);
            }
            // Face 2

        }

        return returnable;
    }


    /**
     * Creates a plane centered on 0, 
     * with div_x divisions across the X,
     * and div_y divisions across the Y.
     * 
     * @param {Number} radius 
     * @param {Number} height 
     * @param {Number} div_x 
     * @param {Number} div_y 
     * 
     * @returns {Mesh}
     */
    static primitive_onion(radius, height, div_x, div_y) {
        let returnable = new Mesh();
        returnable.verts = [];
        returnable.v_colors = [];
        returnable.faces = [];
        returnable.normals = [0,1.007,0];
        let radScale = radius / 2;
        let x_step = 1/div_x;
        let y_step = radius*2/div_y;
        let x_start = -(1*0.5);
        let y_start = -radius;
        for (let x = 0; x < div_x; x++) {
            for (let y = 0; y < div_y; y++) {
            // Tri one
                let rs1 =  Math.sin(y/div_y * Math.PI);
                let rs2 =  Math.sin((y+1)/div_y * Math.PI);
                //radScale = Math.sin(y/div_y * Math.PI);
                console.log("(", x, ",", y, "): Rad scale ", radScale);
                // Upper Left 
                returnable.verts.push(Math.sin((x/div_x * TAU)) * rs1,-y_start -(y_step*y),Math.cos((x/div_x * TAU)) * rs1); // Vert Positio
                returnable.v_colors.push(0.5,0.5,0.5,1); // vert colorie
                returnable.uvs.push((x/div_x),-(y/div_y));
                // Upper Right 
                returnable.verts.push(Math.sin(((x+1)/div_x * TAU)) * rs1,-y_start -(y_step*y),Math.cos(((x+1)/div_x * TAU)) * rs1); // Vert Positio
                returnable.v_colors.push(0.5,0.5,0.5,1); // vert colorie
                returnable.uvs.push(((x+1)/div_x),-(y/div_y));
                // Bottom Left 
                returnable.verts.push(Math.sin((x/div_x * TAU)) * rs2,-y_start - (y_step*(y+1)),Math.cos((x/div_x * TAU)) * rs2); // Vert Positio
                returnable.v_colors.push(0.5,0.5,0.5,1); // vert colorie
                returnable.uvs.push((x/div_x),-((y+1)/div_y));
            // Tri Two
                radScale = Math.sin((y)/div_y * Math.PI);
                // Upper Right 
                returnable.verts.push(Math.sin(((x+1)/div_x * TAU)) * rs1,-y_start -(y_step*y),Math.cos(((x+1)/div_x * TAU)) * rs1); // Vert Positio
                returnable.v_colors.push(0.5,0.5,0.5,1); // vert colorie
                returnable.uvs.push(((x+1)/div_x),-(y/div_y));
                // Bottom Right 
                returnable.verts.push(Math.sin(((x+1)/div_x * TAU)) * rs2,-y_start - (y_step*(y+1)),Math.cos(((x+1)/div_x * TAU)) * rs2); // Vert Positio
                returnable.v_colors.push(0.5,0.5,0.5,1); // vert colorie
                returnable.uvs.push(((x+1)/div_x),-((y+1)/div_y));
                // Bottom Left 
                returnable.verts.push(Math.sin((x/div_x * TAU)) * rs2,-y_start - (y_step*(y+1)),Math.cos((x/div_x * TAU)) * rs2); // Vert Positio
                returnable.v_colors.push(0.5,0.5,0.5,1); // vert colorie
                returnable.uvs.push((x/div_x),-((y+1)/div_y));
            // Face 1
                let en = returnable.verts.length / 3;
                let uv = Math.floor(returnable.uvs.length / 2);
                returnable.faces.push([en-6,uv-6,0]); // NOTE wrong
                returnable.faces.push([en-5,uv-5,0]);
                returnable.faces.push([en-4,uv-4,0]);
                returnable.faces.push([en-3,uv-3,0]);
                returnable.faces.push([en-2,uv-2,0]);
                returnable.faces.push([en-1,uv-1,0]);
            }
            // Face 2

        }

        return returnable;
    }



    toString() {
        return "toString undefined";
    }

    to_renderArray() {
		// for performance testing only
		//var t0 = performance.now();
        // px py pz cr cg cb ca nx ny nz uu uv
        let returnable = []
        for (let index = 0; index < this.faces.length; index++) {
            const element = this.faces[index];
            const v_index = element[0];
            const uv_index = element[1];
            const normal_index = element[2];
            returnable.push(this.verts[v_index*3],this.verts[v_index*3+1],this.verts[v_index*3+2]);//, element*3+3));
            returnable.push(this.v_colors[v_index*4],this.v_colors[v_index*4+1],this.v_colors[v_index*4+2],this.v_colors[v_index*4+3]);
            if(element.length > 1) {
                returnable.push(this.normals[normal_index*3],this.normals[normal_index*3+1],this.normals[normal_index*3+2]);
                returnable.push(this.uvs[uv_index*2],this.uvs[uv_index*2+1]);
            } else {
                let f_norm = new Vec4(this.verts[v_index*3],this.verts[v_index*3+1],this.verts[v_index*3+2]).norm();
                returnable.push(f_norm.x, f_norm.y, f_norm.z);
                returnable.push(0,0);
            }
            //returnable.push(this.no[element*4],this.v_colors[element*4+1],this.v_colors[element*4+2],this.v_colors[element*4+3]);
            //returnable = returnable.concat([0.011,1.0,0.0]); // normals
        }
		// for performance testing only
		//var t1 = performance.now();
		//console.log("Call to to_renderArray took " + (t1 - t0) + " milliseconds.");
        return returnable;
    }

    to_indexed_render_array(intguy) {
        let returnable = []

        for (let index = 0; index < this.faces.length; index++) {
            const element = this.faces[index];
            const v_index = element[0];
            const uv_index = element[1];
            const normal_index = element[2];

            returnable.push(this.verts[v_index*3],this.verts[v_index*3+1],this.verts[v_index*3+2]);//, element*3+3));
            returnable.push(this.v_colors[v_index*4],this.v_colors[v_index*4+1],this.v_colors[v_index*4+2],this.v_colors[v_index*4+3]);

            if(element.length > 1) {
                returnable.push(this.normals[normal_index*3],this.normals[normal_index*3+1],this.normals[normal_index*3+2]);
                returnable.push(this.uvs[uv_index*2],this.uvs[uv_index*2+1]);
            } else {
                let f_norm = new Vec4(this.verts[v_index*3],this.verts[v_index*3+1],this.verts[v_index*3+2]).norm();
                returnable.push(f_norm.x, f_norm.y, f_norm.z);
                returnable.push(0,0);
            }
            returnable.push(parseInt(intguy));
        }
        return returnable;
    }

    static verts_to_norm(first, second, third) {
        
        
    }

    to_renderArray_old() {
        let returnable = []
        console.log(this.verts);
        for (let index = 0; index < this.verts.length / 3; index++) {
            console.log(this.verts.slice(index*3, index*3+3));
            returnable = returnable.concat(this.verts.slice(index*3, index*3+3))
            returnable = returnable.concat(this.v_colors.slice(index*4,index*4+4));
            
        }
        return returnable;
    }
}