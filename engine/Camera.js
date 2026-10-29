import Vector2D from "../geometry/Vector2D.js";

export default class Camera {
    constructor(canvas) {
        this.canvas = canvas;

        // Центр видимой области в мировых координатах.
        this.position = new Vector2D(
            canvas.width / 2,
            canvas.height / 2
        );

        // Масштаб отображения.
        // 1 — одна единица мира на один пиксель canvas.
        this.zoom = 1;

        // Поворот камеры в радианах.
        this.rotation = 0;

        this.minZoom = 0.05;
        this.maxZoom = 20;
    }

    get viewportWidth() {
        return this.canvas.width;
    }

    get viewportHeight() {
        return this.canvas.height;
    }

    /**
     * Применяет трансформацию камеры к canvas-контексту.
     * Вызывать между ctx.save() и ctx.restore().
     */
    apply(ctx) {
        const centerX = this.viewportWidth / 2;
        const centerY = this.viewportHeight / 2;

        ctx.translate(centerX, centerY);
        ctx.scale(this.zoom, this.zoom);
        ctx.rotate(-this.rotation);
        ctx.translate(-this.position.x, -this.position.y);
    }

    /**
     * Переводит координаты canvas в координаты мира.
     * position — координаты в пикселях canvas,
     * например, из CanvasInput.
     */
    screenToWorld(position) {
        const centerX = this.viewportWidth / 2;
        const centerY = this.viewportHeight / 2;

        // Относительно центра экрана.
        const x = (position.x - centerX) / this.zoom;
        const y = (position.y - centerY) / this.zoom;

        // Отменяем поворот камеры.
        const cos = Math.cos(this.rotation);
        const sin = Math.sin(this.rotation);

        return new Vector2D(
            this.position.x + x * cos - y * sin,
            this.position.y + x * sin + y * cos
        );
    }

    /**
     * Переводит координаты мира в координаты canvas.
     */
    worldToScreen(position) {
        const dx = position.x - this.position.x;
        const dy = position.y - this.position.y;

        const cos = Math.cos(this.rotation);
        const sin = Math.sin(this.rotation);

        const x = dx * cos + dy * sin;
        const y = -dx * sin + dy * cos;

        return new Vector2D(
            this.viewportWidth / 2 + x * this.zoom,
            this.viewportHeight / 2 + y * this.zoom
        );
    }

    /**
     * Устанавливает масштаб камеры.
     */
    setZoom(zoom) {
        this.zoom = Math.max(
            this.minZoom,
            Math.min(this.maxZoom, zoom)
        );
    }

    /**
     * Изменяет масштаб относительно текущего.
     */
    zoomBy(factor) {
        if (factor <= 0) return;

        this.setZoom(this.zoom * factor);
    }

    /**
     * Перемещает центр камеры в мировых координатах.
     */
    pan(delta) {
        this.position.add(delta);
    }

    /**
     * Поворачивает камеру на заданный угол в радианах.
     */
    rotate(angle) {
        this.rotation += angle;
    }

    /**
     * Обновляет центр камеры при изменении размера canvas,
     * сохраняя прежнюю точку мира в центре экрана.
     */
    resize() {
        // position намеренно не меняем:
        // камера продолжает смотреть на ту же точку мира.
    }
}
