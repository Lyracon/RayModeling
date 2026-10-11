export default class Intersection {
	constructor(point = {x: 0, y: 0}, normal = {x: 0, y: 0}, distance=Infinity, object=null) {
		this.point = point;
		this.normal = normal;
		this.distance = distance;
		this.object = object;
	}
}