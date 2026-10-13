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

    checkIntersection(A, B, circle, ray, t) {

        if (t <= 0) {
            return new Intersection();
        }

        const cA = new Vector2D();
        cA.x = A.x - circle.x;
        cA.y = A.y - circle.y;

        const cB = new Vector2D();
        cB.x = B.x - circle.x;
        cB.y = B.y - circle.y;

        const I = new Vector2D();
        I.x = ray.origin.x + ray.direction.x * t;
        I.y = ray.origin.y + ray.direction.y * t;

        const cI = new Vector2D();
        cI.x = I.x - circle.x;
        cI.y = I.y - circle.y;

        if (Vector2D.vec(cI, cA) < 0 & Vector2D.vec(cI, cB) > 0) {
            cI.normolize();
            
            return new Intersection(
                {x: 0, y: 0},
                cI,
                t,
                null
            )
        }

        return new Intersection();
    }

    getSideIntersection(ray, positive) {

        let A = new Vector2D();
        A.x = this.position.x + this.direction.y * this.width/2;
        A.y = this.position.y - this.direction.x * this.width/2;

        let B = new Vector2D();
        B.x = this.position.x - this.direction.y * this.width/2;
        B.y = this.position.y + this.direction.x * this.width/2;
        
        const circle = new Vector2D();
        if (positive) {
            circle.x = this.position.x + this.direction.x * this.delta;
            circle.y = this.position.y + this.direction.y * this.delta;
            const temp = A;
            A = B;
            B = temp; 
        } else {
            circle.x = this.position.x - this.direction.x * this.delta;
            circle.y = this.position.y - this.direction.y * this.delta;
        }

        const dx = ray.direction.x;
        const dy = ray.direction.y;

        const ox = ray.origin.x;
        const oy = ray.origin.y;


        const R = this.radius; 

        const b = 2 * ((ox - circle.x)*dx + (oy - circle.y)*dy);
        const c = (ox-circle.x)*(ox-circle.x) + (oy-circle.y)*(oy-circle.y) - R*R;

        const D = b*b - 4*c;
        if (D <= 0) {
            return Infinity;
        } 

        let t1 = (-b + Math.sqrt(D)) / 2;
        let t2 = (-b - Math.sqrt(D)) / 2;

        const intersection1 = this.checkIntersection(A, B, circle, ray, t1);
        const intersection2 = this.checkIntersection(A, B, circle, ray, t2);

        if (intersection1.distance < intersection2.distance) {
            return intersection1;
        } else{
            return intersection2;
        }
    }

    getIntersection(ray) {
        let closestIntersection =  new Intersection();

        const intersection1 = this.getSideIntersection(ray, true);
        const intersection2 = this.getSideIntersection(ray, false);

        if (intersection1.distance < intersection2.distance) {
            closestIntersection = intersection1;
        } else {
            closestIntersection = intersection2;
        }

        const intersectionPoint = {
            x: ray.origin.x + ray.direction.x * closestIntersection.distance,
            y: ray.origin.y + ray.direction.y * closestIntersection.distance
        };

        if (closestIntersection.normal) {
            const dotProduct = Vector2D.dot(ray.direction, closestIntersection.normal); 
            if (dotProduct > 0) {
                closestIntersection.normal.x *= -1;
                closestIntersection.normal.y *= -1;
            }
        };
        
        const intersection = new Intersection(
            intersectionPoint,
            closestIntersection.normal,
            closestIntersection.distance,
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
        this.delta = delta;
    }

    setAngles() {
        let d = this.direction;
        const alpha = Math.asin(this.width/(this.radius*2));
        const angle = Math.asin(d.y);

        this.angles[0] = angle - alpha;
        this.angles[1] = angle + alpha;
        this.angles[2] = angle - alpha + Math.PI;
        this.angles[3] = angle + alpha + Math.PI;

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
          this.angles[3],
        );

        ctx.closePath();
        ctx.fillStyle = this.material.color;
        ctx.fill();
    }
}