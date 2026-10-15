import Path from "../geometry/Path.js"
// import Vector2D from "../geometry/Vector2D.js"

export default class LaserSource {
	constructor(position, direction, power) {
		this.position = position;
        direction.normolize();
		this.direction = direction;
		this.power = power;
		this.rayPath = new Path(position, direction, 1, 0);
        this.counter = 0;
        this.step = -0.003;
	}


	setRotation(angle) {
        this.direction.x = Math.cos(angle);
        this.direction.y = Math.sin(angle);
    }

    move() {
        this.counter -= this.step;
        this.position.y = Math.sin(this.counter)*100 + 360;
    }

	draw(ctx) {

        ctx.beginPath();
        ctx.moveTo(this.position.x, this.position.y);
        
        ctx.lineTo(
            this.position.x - this.direction.x * 70,
            this.position.y - this.direction.y * 70
        );

        ctx.strokeStyle = `rgb(100, 100, 100)`;
        ctx.lineWidth = 30;
        ctx.stroke();

        ctx.beginPath()
        ctx.moveTo(
            this.position.x - this.direction.x * 10,
            this.position.y - this.direction.y * 10
        );
        
        ctx.lineTo(
            this.position.x - this.direction.x * 60,
            this.position.y - this.direction.y * 60
        );

        ctx.strokeStyle = `rgb(50, 50, 50)`;
        ctx.lineWidth = 30;
        ctx.stroke();

    }
}