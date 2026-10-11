import Vector2D from "./Vector2D.js"
import Intersection from "./Intersection.js"
import Material from "../optics/Material.js"

export default class Shape {
    constructor(material) {
        this.points = [];
        this.material = material ? material : new Material();
    }

    addPoint(x, y) {
        this.points.push({"x": x, "y": y});
    }

    getIntersection(ray) {
        if (this.points.length < 2) {
            return null;
        }
        let closestT = Infinity;
        let closestA = null;
        let closestB = null;

        const testSide = (A, B) => {
            const AB = {
                x: B.x - A.x,
                y: B.y - A.y
            }

            const denominator = Vector2D.vec(ray.direction, AB);
            
            if (Math.abs(denominator) < 1e-9) {
                return null;
            }

            const OA = {
                x: A.x - ray.origin.x,
                y: A.y - ray.origin.y
            };

            const t = Vector2D.vec(OA, AB) / denominator;
            const u = Vector2D.vec(OA, ray.direction) / denominator;

            if (t >= 0 && u >= 0 && u <= 1) {
                return t;
            }
            return null;
        }
        
        for (let i = 0; i < this.points.length; i++) {
            const A = this.points[i];
            const B = this.points[(i + 1) % this.points.length];
            const t = testSide(A, B);

            if (t !== null && t < closestT) {
                closestT = t;
                closestA = A;
                closestB = B;
            }
        }

        if (closestT === null || closestT === Infinity) {
            const intersection = new Intersection();
            return intersection;

        } else {
            const dx = closestB.x - closestA.x;
            const dy = closestB.y - closestA.y;

            let normal = {x: -dy, y: dx};

            const dotProduct = Vector2D.dot(ray.direction, normal); 
            if (dotProduct > 0) {
                normal.x *= -1;
                normal.y *= -1;
            }

            const len = Math.sqrt(normal.x * normal.x + normal.y * normal.y);
            if (len > 0) {
                normal.x /= len;
                normal.y /= len;
            }

            const intersectionPoint = {
                x: ray.origin.x + ray.direction.x * closestT,
                y: ray.origin.y + ray.direction.y * closestT
            };

            const intersection = new Intersection(
                intersectionPoint,
                normal,
                closestT,
                this
            );
            return intersection;
        }

    }

    draw(ctx) {
        ctx.beginPath()
        ctx.moveTo(this.points[this.points.length - 1].x, this.points[this.points.length - 1].y);
        
        for (const point of this.points) {
            ctx.lineTo(
                point.x,
                point.y
            );
        }

        ctx.lineWidth = 3;
        ctx.fillStyle = this.material.color;
        ctx.fill();
    }
}