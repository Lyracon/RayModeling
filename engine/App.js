import Scene from "./Scene.js"
import RayTracer from "./RayTracer.js"
import Rendering from "./Rendering.js"

export default class App {
	constructor(canvas, ctx) {
		this.scene = new Scene();
		this.rayTracer = new RayTracer({scene:this.scene});
		this.rendering = new Rendering(canvas, ctx, this.rayTracer);
	}

	update(dt) {
		this.rayTracer.update(dt);
		if (this.scene.sources[0].rayPath.rays.length > 0) {
			this.scene.objects[0].setPosition(this.scene.sources[0].rayPath.rays[0].intersection.point);
		}
		this.scene.sources[0].sinRotate();
	}

	draw() {
		this.rendering.draw(this.scene);
	}
}