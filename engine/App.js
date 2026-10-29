import Scene from "./Scene.js";
import RayTracer from "./RayTracer.js";
import Rendering from "./Rendering.js";
import Camera from "./Camera.js";

export default class App {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;

        this.scene = new Scene();

        this.camera = new Camera(canvas);

        this.resizeObserver = new ResizeObserver(() => {
		    const rect = this.canvas.parentElement.getBoundingClientRect();

		    if (rect.width <= 0 || rect.height <= 0) return;

		    this.canvas.width = Math.round(rect.width);
		    this.canvas.height = Math.round(rect.height);

		    this.camera.resize();
		});

		this.resizeObserver.observe(this.canvas.parentElement);

        this.rayTracer = new RayTracer({
            scene: this.scene
        });

        this.rendering = new Rendering(
            canvas,
            ctx,
            this.rayTracer,
            this.camera
        );
    }

    update(dt) {
        // this.scene.sources[0].move();
    }

    draw() {
        this.rendering.draw(this.scene);
    }
}