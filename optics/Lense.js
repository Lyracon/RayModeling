import Shape from "../geometry/Shape.js"

export default class Lense {

	constructor(position, rotation, material, width, height, curvature) {
        Shape.call(this, position, rotation, material)

        this.width = width;
        this.height = height;
        this.color = color;
		this.curvature = curvature;
    }
    
	getIntersection(ray) {

    }

    getNormal(point) {
        
    }

    draw(ctx) {
        ctx.save();
        
        ctx.translate(this.position.x, this.position.y);
        ctx.rotate(this.rotation);
        ctx.fillStyle = "#a0a0ff55";
        ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);

        ctx.restore();
    }
}