import IdGenerator from "../engine/IdGenerator.js";

export default class Path {
	constructor() {
		this.rays = [];
		this.id = IdGenerator.NewId();
	}

	add(ray) {
		this.rays.push(ray);
	}
}