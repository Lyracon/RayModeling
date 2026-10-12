export default class Rendering {
	constructor(canvas, ctx, rayTracer) {
		this.canvas = canvas;
		this.ctx = ctx;
		this.rayTracer = rayTracer;
	}

	draw(scene) {
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
		for (const object of scene.objects) {
			object.draw(this.ctx);
		}

		for (const ray of scene.rays) {
			ray.draw(this.ctx);
		}

		for (const source of scene.sources) {
			this.rayTracer.clear(source);

			source.draw(this.ctx);
			this.rayTracer.tracePath(source);

			for (const ray of source.rayPath.rays) {
				ray.draw(this.ctx);
			}

		}
	}
}