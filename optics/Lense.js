import Vector2D from "../geometry/Vector2D.js"
import Intersection from "../geometry/Intersection.js"
import Shape from "../geometry/Shape.js"

export default class Lense extends Shape {
    constructor(position, direction, width, deepth, focusLegth, type, material) {
        super(material);

        this.position = position;

        this.width = width;
        this.deepth = deepth;
        
        this.focusLegth = focusLegth;

        direction.normolize();
        this.direction = direction;
     
        for (let i = 0; i < 4; i++) {
            this.addPoint(position.x, position.y);
        }

        this.setRadius();
        this.setDelta();
        this.angles = [];
        this.setAngles();
    }

    getIntersection(ray) {
        let closestT = Infinity;

        const dx = ray.direction.x;
        const dy = ray.direction.y;

        const ox = ray.origin.x;
        const oy = ray.origin.y;

        const px = this.position.x;
        const py = this.position.y;

        const R = this.radius; 

        const b = 2 * ((ox - px)*dx + (oy - py)*dy);
        const c = (ox-px)*(ox-px) + (oy-py)*(oy-py) - R*R;

        const D = b*b - 4*c;
        if (D <= 0) {
            const intersection = new Intersection();
            return intersection;
        } 

        let t1 = (-b + Math.sqrt(D)) / 2;
        let t2 = (-b - Math.sqrt(D)) / 2;

        console.log(t1, t2);

        if (t1 <= 0 && t2 <= 0) {
            return new Intersection();
        } else {
            t1 = Math.max(0, t1);
            t2 = Math.max(0, t2);
        }

        closestT = Math.min(t1, t2);

        const intersectionPoint = {
            x: ox + dx * closestT,
            y: oy + dy * closestT
        };

        const intersection = new Intersection(
            intersectionPoint,
            new Vector2D(1, 0),
            closestT,
            this
        );

        return intersection;

    }

    setRadius() {
        let R = this.focusLegth * 2 * (this.material.refractiveIndex - 1);

        if (this.width > R*2) {
            this.focusLegth = this.width / (4 * (this.material.refractiveIndex - 1));
        }
        R = this.focusLegth * 2 * (this.material.refractiveIndex - 1);
        this.radius = R + 0.0001;
    }

    setDelta() {
        const R = this.radius;
        const delta = Math.sqrt(Math.abs(R*R - this.width*this.width/4));
        // console.log(delta);
        this.delta = delta;
    }

    setAngles() {
        let d = this.direction;
        const alpha = Math.asin(this.width/(this.radius*2));
        const o1 = Math.acos(d.x);
        const o2 = Math.acos(-d.x);

        this.angles[0] = o1 - alpha;
        this.angles[1] = o1 + alpha;
        this.angles[2] = o2 - alpha;
        this.angles[3] = o2 + alpha;
    } 

    draw(ctx) {

        ctx.beginPath();
        ctx.arc(
          this.position.x - this.direction.x * this.delta,
          this.position.y - this.direction.y * this.delta,
          this.radius,
          this.angles[0],
          this.angles[1]
        );

        ctx.arc(
          this.position.x + this.direction.x * this.delta,
          this.position.y + this.direction.y * this.delta,
          this.radius,
          this.angles[2],
          this.angles[3]
        );

        ctx.closePath();
        ctx.fillStyle = this.material.color;
        ctx.fill();
    }
}