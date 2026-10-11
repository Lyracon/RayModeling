import LightSource from "../optics/LightSource.js";
import Sensor from "../optics/Sensor.js";
import Rendering from "./Rendering.js"

export default class Scene {
	constructor() {
		this.objects = [];
		this.sources = [];
		this.rays = [];
	}

	update(dt) {

	}

	addObject(object) {
		this.objects.push(object);
	}

	addRay(ray) {
		this.rays.push(ray);
	}

	addSource(source) {
		this.sources.push(source);
	}
}