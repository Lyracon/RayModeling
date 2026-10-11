import Vector2D from "./Vector2D.js";
import Intersection from "./Intersection.js"

export default class Ray {
    constructor(origin, direction, power, bounceCounter) {
        this.origin = origin;
        this.direction = direction;
        this.power = power;
        this.intersection = new Intersection();
        this.bounceCounter = bounceCounter;
        this.counter = 0;
    }

    getPoint(t) {
        return new Vector2D(this.direction.x, this.direction.y).add(this.origin);
    }

    draw(ctx) {

        ctx.beginPath()
        ctx.moveTo(this.origin.x, this.origin.y);
        
        if (this.intersection.distance === Infinity) {
            ctx.lineTo(
                this.origin.x + this.direction.x * 1280,
                this.origin.y + this.direction.y * 1280
            );
        } else {
            ctx.lineTo(
                this.intersection.point.x,
                this.intersection.point.y
            );
        }

        ctx.strokeStyle = `rgb(255, 25, 25, ${this.power})`;
        ctx.lineWidth = 3;
        ctx.stroke();
    }
}