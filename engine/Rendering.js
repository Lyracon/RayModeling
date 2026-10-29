export default class Rendering {
    constructor(canvas, ctx, rayTracer, camera) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.rayTracer = rayTracer;
    this.camera = camera;
    this.editor = null;
    }

    setEditor(editor) {
        this.editor = editor;
    }

    draw(scene) {
        const ctx = this.ctx;

        ctx.clearRect(
            0,
            0,
            this.canvas.width,
            this.canvas.height
        );

        ctx.save();
        this.camera.apply(ctx);

        // 1. Обычные объекты сцены.
        for (const object of scene.objects) {
            object.draw(ctx);
        }

        // 2. Все световые лучи смешиваются как свет.
        ctx.save();
        ctx.globalCompositeOperation = "lighter";

        for (const ray of scene.rays) {
            ray.draw(ctx);
        }

        for (const source of scene.sources) {
            this.rayTracer.clear(source);
            this.rayTracer.tracePath(source);

            for (const ray of source.rayPath.rays) {
                ray.draw(ctx);
            }
        }

        ctx.restore();

        // 3. Источники поверх световых линий.
        for (const source of scene.sources) {
            source.draw(ctx);
        }

        ctx.restore();

        // 4. Редакторская графика в экранных координатах.
        if (this.editor) {
            this.editor.drawOverlay(ctx);
        }
    }
}