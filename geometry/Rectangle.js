import Intersection from "./Intersection.js"
import Shape from "./Shape.js"

export default class Rectangle extends Shape {
    constructor(position, width, height, material, color) {
        super(material, color);

        this.width = width;
        this.height = height;

        this.addPoint(position.x - width / 2, position.y - height / 2);
        this.addPoint(position.x + width / 2, position.y - height / 2);
        this.addPoint(position.x + width / 2, position.y + height / 2);
        this.addPoint(position.x - width / 2, position.y + height / 2);
    }

    setPosition(point) {
        if (!point) {
            this.points[0] = {x: -100, y: -100};
            this.points[1] = {x: -100, y: -100};
            this.points[2] = {x: -100, y: -100};
            this.points[3] = {x: -100, y: -100};
        } else {
            const x = point.x;
            const y = point.y;
            this.points[0] = {x: x - this.width / 2, y: y - this.height / 2};
            this.points[1] = {x: x + this.width / 2, y: y - this.height / 2};
            this.points[2] = {x: x + this.width / 2, y: y + this.height / 2};
            this.points[3] = {x: x - this.width / 2, y: y + this.height / 2};
        }
    }
}