export default class Vector2D {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    add(vector) {
        this.x += vector.x;
        this.y += vector.y;

        return this;
    }

    subtract(vector) {
        this.x -= vector.x;
        this.y -= vector.y;

        return this;
    }

    multiply(scalar) {
        this.x *= scalar;
        this.y *= scalar;

        return this;
    }

    clone() {
        return new Vector2D(this.x, this.y);
    }

    length() {
        return Math.hypot(this.x, this.y);
    }

    normalize() {
        const length = this.length();

        if (length === 0) {
            return this;
        }

        this.x /= length;
        this.y /= length;

        return this;
    }

    rotate(angle) {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);

        const x = this.x * cos - this.y * sin;
        const y = this.x * sin + this.y * cos;

        this.x = x;
        this.y = y;

        return this;
    }

    angle() {
        return Math.atan2(this.y, this.x);
    }

    static vec(vector1, vector2) {
        return (
            vector1.x * vector2.y -
            vector1.y * vector2.x
        );
    }

    static dot(vector1, vector2) {
        return (
            vector1.x * vector2.x +
            vector1.y * vector2.y
        );
    }

    static distance(vector1, vector2) {
        return Math.hypot(
            vector2.x - vector1.x,
            vector2.y - vector1.y
        );
    }

    static fromAngle(angle) {
        return new Vector2D(
            Math.cos(angle),
            Math.sin(angle)
        );
    }
}