export default class Verctor2D {
	constructor(x, y) {
		this.x = x;
		this.y = y;
	}

	add(vector) {
		this.x += vector.x;
		this.y += vector.y;
	}

	multiply(scalar) {
		this.x *= scalar;
		this.y *= scalar;
	}

	static vec(vector1, vector2) {
		return vector1.x * vector2.y - vector1.y * vector2.x;
	}

	static dot(vector1, vector2) {
		return vector1.x * vector2.x + vector1.y * vector2.y;
	}

	length() {
		return Math.sqrt(this.x * this.x + this.y * this.y);
	}

	normolize() {
		const length = this.length();
		this.x /= length;
		this.y /= length;
	}

	rotate(angle) {

	}

	clone() {
		return new Verctor2D(this.x, this.y);
	}	
}