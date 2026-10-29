export default class CanvasInput {
    constructor(canvas) {
        this.canvas = canvas;

        // --------------------------------------------------
        // Pointer state
        // --------------------------------------------------

        this.isDown = false;

        // Кнопка, которая сейчас удерживается.
        // 0 = left
        // 1 = middle
        // 2 = right
        this.button = null;

        // Кнопка, которая была нажата в этом кадре.
        this.pressedButton = null;

        // Кнопка, которая была отпущена в этом кадре.
        this.releasedButton = null;

        // --------------------------------------------------
        // Position (canvas coordinates)
        // --------------------------------------------------

        this.x = 0;
        this.y = 0;

        this.startX = 0;
        this.startY = 0;

        // --------------------------------------------------
        // One-frame state
        // --------------------------------------------------

        this.justPressed = false;
        this.justReleased = false;

        // --------------------------------------------------
        // Modifiers
        // --------------------------------------------------

        this.shift = false;
        this.ctrl = false;
        this.alt = false;
        this.meta = false;

        // --------------------------------------------------
        // Event handlers
        // --------------------------------------------------

        this._onPointerDown = this._onPointerDown.bind(this);
        this._onPointerMove = this._onPointerMove.bind(this);
        this._onPointerUp = this._onPointerUp.bind(this);
        this._onPointerCancel = this._onPointerCancel.bind(this);

        canvas.addEventListener(
            "pointerdown",
            this._onPointerDown
        );

        canvas.addEventListener(
            "pointermove",
            this._onPointerMove
        );

        canvas.addEventListener(
            "pointerup",
            this._onPointerUp
        );

        canvas.addEventListener(
            "pointercancel",
            this._onPointerCancel
        );
    }

    // --------------------------------------------------
    // Public API
    // --------------------------------------------------

    get position() {
        return {
            x: this.x,
            y: this.y
        };
    }

    get startPosition() {
        return {
            x: this.startX,
            y: this.startY
        };
    }

    get dragDelta() {
        return {
            x: this.x - this.startX,
            y: this.y - this.startY
        };
    }

    get dragDistance() {
        const dx = this.x - this.startX;
        const dy = this.y - this.startY;

        return Math.hypot(dx, dy);
    }

    /**
     * Вызывается в начале каждого animation frame.
     *
     * Сбрасывает состояния, которые существуют
     * только один кадр.
     */
    update() {
        this.justPressed = false;
        this.justReleased = false;

        this.pressedButton = null;
        this.releasedButton = null;
    }

    destroy() {
        this.canvas.removeEventListener(
            "pointerdown",
            this._onPointerDown
        );

        this.canvas.removeEventListener(
            "pointermove",
            this._onPointerMove
        );

        this.canvas.removeEventListener(
            "pointerup",
            this._onPointerUp
        );

        this.canvas.removeEventListener(
            "pointercancel",
            this._onPointerCancel
        );
    }

    // --------------------------------------------------
    // Pointer events
    // --------------------------------------------------

    _onPointerDown(event) {
        this._updatePosition(event);
        this._updateModifiers(event);

        this.isDown = true;
        this.button = event.button;

        this.pressedButton = event.button;
        this.justPressed = true;

        this.startX = this.x;
        this.startY = this.y;

        event.preventDefault();

        this.canvas.setPointerCapture(event.pointerId);
    }

    _onPointerMove(event) {
        this._updatePosition(event);
        this._updateModifiers(event);
    }

    _onPointerUp(event) {
        this._updatePosition(event);
        this._updateModifiers(event);

        this.isDown = false;

        this.releasedButton = event.button;
        this.justReleased = true;

        this.button = null;

        if (this.canvas.hasPointerCapture(event.pointerId)) {
            this.canvas.releasePointerCapture(event.pointerId);
        }
    }

    _onPointerCancel(event) {
        this._updatePosition(event);

        this.isDown = false;

        this.releasedButton = this.button;
        this.justReleased = true;

        this.button = null;
    }

    // --------------------------------------------------
    // Coordinate conversion
    // --------------------------------------------------

    _updatePosition(event) {
        const rect = this.canvas.getBoundingClientRect();

        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;

        this.x = (event.clientX - rect.left) * scaleX;
        this.y = (event.clientY - rect.top) * scaleY;
    }

    _updateModifiers(event) {
        this.shift = event.shiftKey;
        this.ctrl = event.ctrlKey;
        this.alt = event.altKey;
        this.meta = event.metaKey;
    }
}