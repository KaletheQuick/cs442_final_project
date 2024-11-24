
/**
 * Matrix with row-major layout:
 *  0       1       2       3
 *  4       5       6       7
 *  8       9       10      11
 *  12      13      14      15
 */
class Mat4 {

    constructor( data ) {
        if( data == null ) {
            this.data = [
                1, 0, 0, 0,
                0, 1, 0, 0,
                0, 0, 1, 0,
                0, 0, 0, 1,
            ]
        }
        else {
            this.data = data;
        }
    }

    static identity() {
        return new Mat4();
    }

    //located inside of the Mat4 class
    static frustum( left, right, bottom, top, near, far ) { 
        // these scalars will scale x,y values to the near plane
        let scale_x = 2 * near / ( right - left );
        let scale_y = 2 * near / ( top - bottom );

        // shift the eye depending on the right/left and top/bottom planes.
        // only really used for VR (left eye and right eye shifted differently).  
        let t_x = ( right + left ) / ( right - left );
        let t_y = ( top + bottom ) / ( top - bottom );

        // map z into the range [ -1, 1 ] linearly
        const linear_c2 = 1 / ( far - near );
        const linear_c1 = near / ( far - near );
        // remember that the w coordinate will always be 1 before being fed to the vertex shader.
        // therefore, anything we put in row 3, col 4 of the matrix will be added to the z.

        // map z into the range [ -1, 1], but with a non-linear ramp
        // see: https://learnopengl.com/Advanced-OpenGL/Depth-testing and
        // https://www.scratchapixel.com/lessons/3d-basic-rendering/perspective-and-orthographic-projection-matrix/opengl-perspective-projection-matrix and
        // http://learnwebgl.brown37.net/08_projections/projections_perspective.html
        // for more info. (note, I'm using left-handed coordinates. Some sources use right-handed).
        const nonlin_c2 = (far + near) / (far - near);
        const nonlin_c1 = 2 * far * near / (far - near);

        let c1 = nonlin_c1;
        let c2 = nonlin_c2;

        return new Mat4( [
            scale_x,    0,          t_x, 0,
            0,          scale_y,    t_y, 0,
            0,          0,          c2, -c1,
            0,          0,          1, 0, 
        ] );
    }

    toString() {
        var str_vals = this.data.map( function( val ) { return "" + val } )
        var str = 
            str_vals.slice( 0, 4 ).join(' ') + '; ' + 
            str_vals.slice( 4, 8 ).join(' ') + '; ' +
            str_vals.slice( 8, 12 ).join(' ') + '; ' +
            str_vals.slice( 12, 16 ).join(' ');

        return '[' + str + ']';
    }

    /**
     * Returns a rotation matrix in the XY plane, rotating by the given number of turns. 
     * @param {number} turns amount to rotate by
     * @returns {Mat4}  
     */
    static rotation_xy( turns ) {
		// 0 1 , 4 5 -- 0-0 2-4 8-1 10-5
        let xy_mx = new Mat4();
		let fucker = turns * Math.PI * 2;
		xy_mx.data[0]  = Math.cos(fucker); 
		xy_mx.data[1]  = Math.sin(fucker);
		xy_mx.data[4]  = -Math.sin(fucker);
		xy_mx.data[5] = Math.cos(fucker);
		return xy_mx;
    }

    /**
     * Returns a rotation matrix in the XZ plane, rotating by the given number of turns
     * @param {number} turns amount to rotate by
     * @returns {Mat4}  
     */
    static rotation_xz( turns ) {

        let xy_mx = new Mat4();
		let fucker = turns * Math.PI * 2;
		xy_mx.data[0]  = Math.cos(fucker);//Math.sin(fucker);
		xy_mx.data[8]  = -Math.sin(fucker);
		xy_mx.data[2]  = Math.sin(fucker);//Math.cos(fucker);
		xy_mx.data[10] = Math.cos(fucker);
		return xy_mx;
        // return the rotation matrix
    }

    /**
     * Returns a rotation matrix in the YZ plane, rotating by the given number of turns
     * @param {number} turns amount to rotate by
     * @returns {Mat4}  
     */
    static rotation_yz( turns ) {
        // 5 6 , 9 10 -- 5-2 6-8 9-8neg 10-sin
        let xy_mx = new Mat4();
		let fucker = turns * Math.PI * 2;
		xy_mx.data[5]  = Math.cos(fucker);
		xy_mx.data[6]  = Math.sin(fucker);
		xy_mx.data[9]  = -Math.sin(fucker);
		xy_mx.data[10] = Math.cos(fucker);
		return xy_mx;
        // return the rotation matrix
    }

	static bruteForceIt(left, right) {
		let a = right.data;
		let b = left.data;
		// I do not actually know math. This seemed to work.
		let returnable = new Array(16); // 4x4 matrix represented as a flat array

		returnable[0] = (a[0] * b[0]) + (a[4] * b[1]) + (a[8] * b[2]) + (a[12] * b[3]);
		returnable[1] = (a[1] * b[0]) + (a[5] * b[1]) + (a[9] * b[2]) + (a[13] * b[3]);
		returnable[2] = (a[2] * b[0]) + (a[6] * b[1]) + (a[10] * b[2]) + (a[14] * b[3]);
		returnable[3] = (a[3] * b[0]) + (a[7] * b[1]) + (a[11] * b[2]) + (a[15] * b[3]);
	
		returnable[4] = (a[0] * b[4]) + (a[4] * b[5]) + (a[8] * b[6]) + (a[12] * b[7]);
		returnable[5] = (a[1] * b[4]) + (a[5] * b[5]) + (a[9] * b[6]) + (a[13] * b[7]);
		returnable[6] = (a[2] * b[4]) + (a[6] * b[5]) + (a[10] * b[6]) + (a[14] * b[7]);
		returnable[7] = (a[3] * b[4]) + (a[7] * b[5]) + (a[11] * b[6]) + (a[15] * b[7]);
	
		returnable[8] = (a[0] * b[8]) + (a[4] * b[9]) + (a[8] * b[10]) + (a[12] * b[11]);
		returnable[9] = (a[1] * b[8]) + (a[5] * b[9]) + (a[9] * b[10]) + (a[13] * b[11]);
		returnable[10] = (a[2] * b[8]) + (a[6] * b[9]) + (a[10] * b[10]) + (a[14] * b[11]);
		returnable[11] = (a[3] * b[8]) + (a[7] * b[9]) + (a[11] * b[10]) + (a[15] * b[11]);

		returnable[12] = (a[0] * b[12]) + (a[4] * b[13]) + (a[8] * b[14]) + (a[12] * b[15]);
		returnable[13] = (a[1] * b[12]) + (a[5] * b[13]) + (a[9] * b[14]) + (a[13] * b[15]);
		returnable[14] = (a[2] * b[12]) + (a[6] * b[13]) + (a[10] * b[14]) + (a[14] * b[15]);
		returnable[15] = (a[3] * b[12]) + (a[7] * b[13]) + (a[11] * b[14]) + (a[15] * b[15]);
	
		return new Mat4(returnable);
	}

    static translation( dx, dy, dz ) {
		let t_mx = new Mat4();
		t_mx.data[3] = dx;
		t_mx.data[7] = dy;
		t_mx.data[11] = dz;
        return t_mx;
    }

    static scale( sx, sy, sz ) {
        
		let s_mx = new Mat4();
		s_mx.data[0] = sx;
		s_mx.data[5] = sy;
		s_mx.data[10] = sz;
		return s_mx;
    }

    mul( right ) {
        return Mat4.bruteForceIt(this, right);
        // return the result of multiplication
    }

	// right multiply by column vector
    transform( x, y, z, w ) {
        return this.transform_vec( new Vec4( x, y, z, w ) );
    }

    transform_vec( vec ) {
        let x = this.data[0] * vec.x + this.data[1] * vec.y + this.data[2] * vec.z + this.data[3] * vec.w;;
    	let y = this.data[4] * vec.x + this.data[5] * vec.y + this.data[6] * vec.z + this.data[7] * vec.w;;
    	let z = this.data[8] * vec.x + this.data[9] * vec.y + this.data[10] * vec.z + this.data[11] * vec.w;;
    	let w = this.data[12] * vec.x + this.data[13] * vec.y + this.data[14] * vec.z + this.data[15] * vec.w;;
        return new Vec4(x,y,z,w);
    }


    rc( row, col ) {
        return this.data[ row * 4 + col ]
    }

    // inverting a 4x4 matrix is ugly, there are 16 determinants we 
    // need to calculate. Because it's such a pain, I looked it up:
    // https://stackoverflow.com/questions/1148309/inverting-a-4x4-matrix
    // author: willnode
    inverse() {
        // var A2323 = m.m22 * m.m33 - m.m23 * m.m32 ;
        const A2323 = this.rc(2, 2) * this.rc(3, 3) - this.rc(2, 3) * this.rc(3, 2); 
        
        // var A1323 = m.m21 * m.m33 - m.m23 * m.m31 ;
        const A1323 = this.rc(2, 1) * this.rc(3, 3) - this.rc(2, 3) * this.rc(3, 1);
        
        // var A1223 = m.m21 * m.m32 - m.m22 * m.m31 ;
        const A1223 = this.rc(2, 1) * this.rc(3, 2) - this.rc(2, 2) * this.rc(3, 1);

        // var A0323 = m.m20 * m.m33 - m.m23 * m.m30 ;
        const A0323 = this.rc(2, 0) * this.rc(3, 3) - this.rc(2, 3) * this.rc(3, 0);

        // var A0223 = m.m20 * m.m32 - m.m22 * m.m30 ;
        const A0223 = this.rc(2, 0) * this.rc(3, 2) - this.rc(2, 2) * this.rc(3, 0);

        // var A0123 = m.m20 * m.m31 - m.m21 * m.m30 ;
        const A0123 = this.rc(2, 0) * this.rc(3, 1) - this.rc(2, 1) * this.rc(3, 0);

        // var A2313 = m.m12 * m.m33 - m.m13 * m.m32 ;
        const A2313 = this.rc(1, 2) * this.rc(3, 3) - this.rc(1, 3) * this.rc(3, 2);

        // var A1313 = m.m11 * m.m33 - m.m13 * m.m31 ;
        const A1313 = this.rc(1, 1) * this.rc(3, 3) - this.rc(1, 3) * this.rc(3, 1);

        // var A1213 = m.m11 * m.m32 - m.m12 * m.m31 ;
        const A1213 = this.rc(1, 1) * this.rc(3, 2) - this.rc(1, 2) * this.rc(3, 1);

        // var A2312 = m.m12 * m.m23 - m.m13 * m.m22 ;
        const A2312 = this.rc(1, 2) * this.rc(2, 3) - this.rc(1, 3) * this.rc(2, 2);

        // var A1312 = m.m11 * m.m23 - m.m13 * m.m21 ;
        const A1312 = this.rc(1, 1) * this.rc(2, 3) - this.rc(1, 3) * this.rc(2, 1);

        // var A1212 = m.m11 * m.m22 - m.m12 * m.m21 ;
        const A1212 = this.rc(1, 1) * this.rc(2, 2) - this.rc(1, 2) * this.rc(2, 1);

        // var A0313 = m.m10 * m.m33 - m.m13 * m.m30 ;
        const A0313 = this.rc(1, 0) * this.rc(3, 3) - this.rc(1, 3) * this.rc(3, 0);

        // var A0213 = m.m10 * m.m32 - m.m12 * m.m30 ;
        const A0213 = this.rc(1, 0) * this.rc(3, 2) - this.rc(1, 2) * this.rc(3, 0);
        
        // var A0312 = m.m10 * m.m23 - m.m13 * m.m20 ;
        const A0312 = this.rc(1, 0) * this.rc(2, 3) - this.rc(1, 3) * this.rc(2, 0);

        // var A0212 = m.m10 * m.m22 - m.m12 * m.m20 ;
        const A0212 = this.rc(1, 0) * this.rc(2, 2) - this.rc(1, 2) * this.rc(2, 0);

        // var A0113 = m.m10 * m.m31 - m.m11 * m.m30 ;
        const A0113 = this.rc(1, 0) * this.rc(3, 1) - this.rc(1, 1) * this.rc(3, 0);
        
        // var A0112 = m.m10 * m.m21 - m.m11 * m.m20 ;
        const A0112 = this.rc(1, 0) * this.rc(2, 1) - this.rc(1, 1) * this.rc(2, 0);
        

        const det = 
        this.rc(0, 0) * ( this.rc(1, 1) * A2323 - this.rc(1, 2) * A1323 + this.rc(1, 3) * A1223 ) -
        this.rc(0, 1) * ( this.rc(1, 0) * A2323 - this.rc(1, 2) * A0323 + this.rc(1, 3) * A0223 ) +
        this.rc(0, 2) * ( this.rc(1, 0) * A1323 - this.rc(1, 1) * A0323 + this.rc(1, 3) * A0123 ) -
        this.rc(0, 3) * ( this.rc(1, 0) * A1223 - this.rc(1, 1) * A0223 + this.rc(1, 2) * A0123 );

        const dr = 1.0 / det;

        return new Mat4( [
            dr * ( this.rc(1, 1) * A2323 - this.rc(1, 2) * A1323 + this.rc(1, 3) * A1223 ),
            dr *-( this.rc(0, 1) * A2323 - this.rc(0, 2) * A1323 + this.rc(0, 3) * A1223 ),
            dr * ( this.rc(0, 1) * A2313 - this.rc(0, 2) * A1313 + this.rc(0, 3) * A1213 ),
            dr *-( this.rc(0, 1) * A2312 - this.rc(0, 2) * A1312 + this.rc(0, 3) * A1212 ),

            dr *-( this.rc(1, 0) * A2323 - this.rc(1, 2) * A0323 + this.rc(1, 3) * A0223 ),
            dr * ( this.rc(0, 0) * A2323 - this.rc(0, 2) * A0323 + this.rc(0, 3) * A0223 ),
            dr *-( this.rc(0, 0) * A2313 - this.rc(0, 2) * A0313 + this.rc(0, 3) * A0213 ),
            dr * ( this.rc(0, 0) * A2312 - this.rc(0, 2) * A0312 + this.rc(0, 3) * A0212 ),

            dr * ( this.rc(1, 0) * A1323 - this.rc(1, 1) * A0323 + this.rc(1, 3) * A0123 ),
            dr *-( this.rc(0, 0) * A1323 - this.rc(0, 1) * A0323 + this.rc(0, 3) * A0123 ),
            dr * ( this.rc(0, 0) * A1313 - this.rc(0, 1) * A0313 + this.rc(0, 3) * A0113 ),
            dr *-( this.rc(0, 0) * A1312 - this.rc(0, 1) * A0312 + this.rc(0, 3) * A0112 ),

            dr *-( this.rc(1, 0) * A1223 - this.rc(1, 1) * A0223 + this.rc(1, 2) * A0123 ),
            dr * ( this.rc(0, 0) * A1223 - this.rc(0, 1) * A0223 + this.rc(0, 2) * A0123 ),
            dr *-( this.rc(0, 0) * A1213 - this.rc(0, 1) * A0213 + this.rc(0, 2) * A0113 ),
            dr * ( this.rc(0, 0) * A1212 - this.rc(0, 1) * A0212 + this.rc(0, 2) * A0112 ),
        ] );
    }

    clone() {
        let c = new Array(16);
        for( let i = 0; i < 16; i++ ) { c[i] = this.data[i]; }
        return new Mat4( c );
    }
	
	toString() {
		let pieces = [];
		
		for( let row = 0; row < 4; row ++ ){
			pieces.push( '\n[' );
			
			for( let col = 0; col < 4; col ++ ){
				let i = row * 4 + col;
				pieces.push( this.data[i] );
			}
		}
		
		pieces.push( ']' );
		
		return pieces.join( ' ' );
	}
    
    // SECTION My additions
    basis_x() {return new Vec4(this.data[0],this.data[4],this.data[8]);}
    basis_y() {return new Vec4(this.data[1],this.data[5],this.data[9]);}
    basis_z() {return new Vec4(this.data[2],this.data[6],this.data[10]);}
    position() {return new Vec4(this.data[3],this.data[7],this.data[11]);}
    // !SECTION
}