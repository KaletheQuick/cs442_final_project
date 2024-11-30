
class Vec4 {

    constructor( x, y, z, w ) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w ?? 0;
    }

    /**
     * Returns the vector that is this vector scaled by the given scalar.
     * @param {number} by the scalar to scale with 
     * @returns {Vec4}
     */
    scaled( by ) {
        let x = this.x * by;
        let y = this.y * by;
        let z = this.z * by;
        let w = this.w * by;
        return new Vec4( x, y, z, w );
    }

    /**
     * Returns the dot product between this vector and other
     * @param {Vec4} other the other vector 
     * @returns {number}
     */
    dot( other ) {
        return (this.x * other.x + this.y * other.y + this.z * other.z + this.w * other.w);
        // return the dot product 
    }

    /**
     * Returns the length of this vector
     * @returns {number}
     */
    length() {
		let first = Math.sqrt((this.y * this.y) + (this.x * this.x));
		let second = Math.sqrt((first * first) + (this.z * this.z));
		let third = Math.sqrt((second * second) + (this.w * this.w));
        return third;
        // return the length
    }

	lengthSquared() {
		let first = (this.y * this.y) + (this.x * this.x);
		let second = (first * first) + (this.z * this.z);
		let third = (second * second) + (this.w * this.w);
        return third;
		// for comparisons and audio falloff 
	}

    /**
     * Returns a normalized version of this vector
     * @returns {Vec4}
     */
    norm() {
		let len = this.length()
        return new Vec4(this.x/len, this.y/len, this.z/len, this.w/len);
        // return the normalized vector
    }

    /**
     * Returns the vector sum between this and other.
     * @param {Vec4} other 
     */
    add( other ) {
        let x = this.x + other.x;
        let y = this.y + other.y;
        let z = this.z + other.z;
        let w = this.w + other.w;

        return new Vec4( x, y, z, w );
        
        // return the vector sum
    }

    sub( other ) {
        return this.add( other.scaled( -1 ) );
    }

    cross( other ) {
        let x = this.y * other.z - this.z * other.y;
        let y = this.x * other.z - this.z * other.x;
        let z = this.x * other.y - this.y * other.x;

        return new Vec4( x, y, z, 0 );
    }
	
	toString() {
		return [ '[', this.x, this.y, this.z, this.w, ']' ].join( ' ' );
	}
}