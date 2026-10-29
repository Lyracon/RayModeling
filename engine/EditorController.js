
import Vector2D from "../geometry/Vector2D.js";
import Shape from "../geometry/Shape.js";

import EditorSelection from "./Editor/EditorSelection.js";
import Material from "../optics/Material.js";
import LaserSource from "../optics/LaserSource.js";
import Lense from "../optics/Lense.js";


export default class EditorController {
    constructor(app, canvas) {
        this.app = app;
        this.canvas = canvas;
        this.camera = app.camera;
        this.scene = app.scene;

        this.selection = new EditorSelection(this.scene);

        this.activeTool = "select";
        this.selectedObject = null;
        this.isCreatingShape = false;
        this.creationPoints = [];

        // Минимальное расстояние между точками.
        // Не даём случайно создать две почти одинаковые вершины.
        this.minPointDistance = 3;

        // Радиус первой точки при замыкании.
        this.closePointRadius = 10;

        this.draggingVertex = false;
        this.draggedVertexIndex = -1;

        this.draggingObject = false;
        this.dragStartPointer = null;
        this.dragStartPosition = null;
        this.dragStartPoints = null;

        this.isPanning = false;
        this.lastPointer = null;

        this._onPointerDown = this._onPointerDown.bind(this);
        this._onPointerMove = this._onPointerMove.bind(this);
        this._onPointerUp = this._onPointerUp.bind(this);

        this._onWheel = this._onWheel.bind(this);
        this._onToolClick = this._onToolClick.bind(this);
        this._onKeyDown = this._onKeyDown.bind(this);

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
            this._onPointerUp
        );

        canvas.addEventListener(
            "wheel",
            this._onWheel,
            {
                passive: false
            }
        );

        window.addEventListener(
            "keydown",
            this._onKeyDown
        );

        this.toolbar = document.querySelector("#toolbar");

        this.toolbar?.addEventListener(
            "click",
            this._onToolClick
        );

        this.inspector = document.querySelector("#inspector");

        this._updateToolbar();
        this._updateInspector();
    }


    // ==================================================
    // TOOL
    // ==================================================

    _onToolClick(event) {
        const button = event.target.closest("[data-tool]");

        if (!button || !this.toolbar.contains(button)) {
            return;
        }

        this.setTool(button.dataset.tool);
    }


    setTool(tool) {
        if (this.activeTool === tool) {
            return;
        }

        // При смене инструмента незавершённая
        // фигура должна исчезнуть.
        this._cancelShapeCreation();

        this.draggingVertex = false;
        this.draggedVertexIndex = -1;

        this.activeTool = tool;

        this._updateToolbar();
    }


    _updateToolbar() {
        if (!this.toolbar) {
            return;
        }

        for (const button of this.toolbar.querySelectorAll(
            "[data-tool]"
        )) {
            const active =
                button.dataset.tool === this.activeTool;

            button.classList.toggle(
                "active",
                active
            );

            button.setAttribute(
                "aria-pressed",
                String(active)
            );
        }
    }


    // ==================================================
    // KEYBOARD
    // ==================================================

    _onKeyDown(event) {
        if (event.key === "Escape") {
            this.setTool("select");
            return;
        }

        if (event.key !== "Delete" && event.key !== "Backspace") {
            return;
        }

        // Не удаляем объекты, если пользователь вводит текст.
        const target = event.target;

        if (
            target instanceof HTMLElement &&
            (
                target.isContentEditable ||
                target.closest("input, textarea, select")
            )
        ) {
            return;
        }

        if (!this.selectedObject) return;

        event.preventDefault();
        this._deleteSelectedObject();
    }

    _onPointerDown(event) {
        // ----------------------------------------------
        // MIDDLE MOUSE
        // ----------------------------------------------

        if (event.button === 1) {
            this.isPanning = true;

            this.lastPointer =
                this._getCanvasPosition(event);

            this.canvas.setPointerCapture(
                event.pointerId
            );

            event.preventDefault();

            return;
        }


        // Нас интересует только левая кнопка.
        if (event.button !== 0) {
            return;
        }


        const screenPosition =
            this._getCanvasPosition(event);

        const worldPosition =
            this.camera.screenToWorld(
                screenPosition
            );

        if (this.activeTool === "move") {
            this._handleMovePointerDown(worldPosition, event);
            return;
        }

        if (this.activeTool === "select") {
            this._handleSelectionPointerDown(
                screenPosition,
                worldPosition
            );

            return;
        }

        if (this.activeTool === "shape") {
            this._handleShapeCreationPointerDown(
                screenPosition,
                worldPosition
            );

            return;
        }

        if (this.activeTool === "source") {
            this._createSource(worldPosition);
            return;
        }

        if (this.activeTool === "lens") {
            this._createLens(worldPosition);
            return;
        }
    }


    _onPointerMove(event) {

        if (this.isPanning && this.lastPointer) {
            const current =
                this._getCanvasPosition(event);

            const dx =
                current.x - this.lastPointer.x;

            const dy =
                current.y - this.lastPointer.y;

            const worldDelta =
                new Vector2D(dx, dy);

            worldDelta.multiply(
                1 / this.camera.zoom
            );

            worldDelta.rotate(
                this.camera.rotation
            );

            this.camera.position.x -= worldDelta.x;
            this.camera.position.y -= worldDelta.y;

            this.lastPointer = current;

            return;
        }

        if (this.draggingObject) {
            const worldPosition = this.camera.screenToWorld(
                this._getCanvasPosition(event)
            );

            this._moveSelectedObject(worldPosition);
            return;
        }

        if (this.draggingVertex) {
            const screenPosition =
                this._getCanvasPosition(event);

            const worldPosition =
                this.camera.screenToWorld(
                    screenPosition
                );

            this._moveSelectedVertex(
                worldPosition
            );
        }
    }


    _onPointerUp(event) {
        if (
            event.button === 1 ||
            event.type === "pointercancel"
        ) {
            this.isPanning = false;
            this.lastPointer = null;
        }

        if (event.button === 0) {
            this.draggingVertex = false;
            this.draggedVertexIndex = -1;
        }

        this.draggingObject = false;
        this.dragStartPointer = null;
        this.dragStartPosition = null;
        this.dragStartPoints = null;
    }


    // ==================================================
    // SELECTION
    // ==================================================

    _handleSelectionPointerDown(
        screenPosition,
        worldPosition
    ) {
        // Сначала проверяем управляющие точки
        // уже выбранного объекта.
        if (this.selectedObject instanceof Shape) {
            const vertexIndex =
                this._findVertexAtScreenPosition(
                    this.selectedObject,
                    screenPosition
                );

            if (vertexIndex !== -1) {
                this.draggingVertex = true;
                this.draggedVertexIndex =
                    vertexIndex;

                return;
            }
        }


        // Затем пытаемся выбрать объект.
        const object =
            this._findObjectAtPosition(
                worldPosition
            );

        if (object) {
            this.selectedObject = object;

            this._updateInspector();

            return;
        }


        // Нажали в пустоту.
        this.selectedObject = null;

        this._updateInspector();
    }

    _findObjectAtPosition(position) {
        return this.selection.findObjectAtPosition(position);
    }

    _deleteSelectedObject() {
        const object = this.selectedObject;
        if (!object) return;

        let index = this.scene.objects.indexOf(object);

        if (index !== -1) {
            this.scene.objects.splice(index, 1);
        } else {
            index = this.scene.sources.indexOf(object);

            if (index !== -1) {
                this.scene.sources.splice(index, 1);
            } else {
                return;
            }
        }

        this.selectedObject = null;
        this.draggingObject = false;
        this.draggingVertex = false;
        this.draggedVertexIndex = -1;

        this._updateInspector();
    }

    _findVertexAtScreenPosition(
        shape,
        screenPosition
    ) {
        const handleRadius = 8;

        for (
            let i = 0;
            i < shape.points.length;
            i++
        ) {
            const point = shape.points[i];

            const screenPoint =
                this.camera.worldToScreen(
                    point
                );

            const dx =
                screenPosition.x -
                screenPoint.x;

            const dy =
                screenPosition.y -
                screenPoint.y;

            if (
                dx * dx +
                dy * dy <=
                handleRadius * handleRadius
            ) {
                return i;
            }
        }

        return -1;
    }


    _moveSelectedVertex(worldPosition) {
        if (
            !(this.selectedObject instanceof Shape)
        ) {
            return;
        }

        const index =
            this.draggedVertexIndex;

        if (
            index < 0 ||
            index >= this.selectedObject.points.length
        ) {
            return;
        }

        this.selectedObject.points[index].x =
            worldPosition.x;

        this.selectedObject.points[index].y =
            worldPosition.y;
    }

    _handleShapeCreationPointerDown(
        screenPosition,
        worldPosition
    ) {
        if (!this.isCreatingShape) {
            this.isCreatingShape = true;

            this.creationPoints = [
                worldPosition.clone()
            ];

            return;
        }

        const firstPoint =
            this.creationPoints[0];

        const firstPointScreen =
            this.camera.worldToScreen(
                firstPoint
            );

        const dx =
            screenPosition.x -
            firstPointScreen.x;

        const dy =
            screenPosition.y -
            firstPointScreen.y;

        const distanceSquared =
            dx * dx + dy * dy;

        if (
            this.creationPoints.length >= 3 &&
            distanceSquared <=
            this.closePointRadius *
            this.closePointRadius
        ) {
            this._finishShapeCreation();
            return;
        }

        const lastPoint =
            this.creationPoints[
                this.creationPoints.length - 1
            ];

        const distance =
            Math.sqrt(
                (worldPosition.x - lastPoint.x) ** 2 +
                (worldPosition.y - lastPoint.y) ** 2
            );

        if (
            distance <
            this.minPointDistance
        ) {
            return;
        }

        this.creationPoints.push(
            worldPosition.clone()
        );
    }


    _finishShapeCreation() {
        if (this.creationPoints.length < 3) {
            return;
        }

        const material =
            new Material();

        material.color = "#777777";

        const shape =
            new Shape(material);

        for (
            const point of this.creationPoints
        ) {
            shape.addPoint(
                point.x,
                point.y
            );
        }

        this.scene.addObject(shape);

        // Новый объект сразу становится выбранным.
        this.selectedObject = shape;

        this._cancelShapeCreation();

        this._updateInspector();
    }


    _cancelShapeCreation() {
        this.isCreatingShape = false;
        this.creationPoints = [];
    }

    _createSource(position) {
        const source =
            new LaserSource(
                position.clone(),
                new Vector2D(1, 0),
                1
            );

        this.scene.addSource(source);
    }


    _createLens(position) {
        const material =
            new Material();

        material.color =
            "rgba(120, 185, 214, 0.5)";

        material.n = 1.5;

        const lens =
            new Lense(
                position.clone(),
                new Vector2D(1, 0),
                100,
                0,
                100,
                null,
                material
            );

        this.scene.addObject(lens);
    }

    _onWheel(event) {
        event.preventDefault();

        const screenPosition =
            this._getCanvasPosition(event);

        const worldBefore =
            this.camera.screenToWorld(
                screenPosition
            );

        const factor =
            Math.exp(
                -event.deltaY * 0.001
            );

        this.camera.zoomBy(factor);

        const worldAfter =
            this.camera.screenToWorld(
                screenPosition
            );

        this.camera.position.x +=
            worldBefore.x -
            worldAfter.x;

        this.camera.position.y +=
            worldBefore.y -
            worldAfter.y;
    }


    // ==================================================
    // SCREEN POSITION
    // ==================================================

    _getCanvasPosition(event) {
        const rect =
            this.canvas.getBoundingClientRect();

        return new Vector2D(
            (event.clientX - rect.left) *
            this.canvas.width /
            rect.width,

            (event.clientY - rect.top) *
            this.canvas.height /
            rect.height
        );
    }

    _updateInspector() {
        if (!this.inspector) {
            return;
        }

        if (!this.selectedObject) {
            this.inspector.innerHTML = `
                <div class="inspector__empty">
                    Nothing selected
                </div>
            `;

            return;
        }

        const object =
            this.selectedObject;

        if (object instanceof Shape) {
            this.inspector.innerHTML = `
                <div class="inspector__section">
                    <div class="inspector__title">
                        Shape
                    </div>

                    <div class="inspector__property">
                        <span>Points</span>
                        <span>${object.points.length}</span>
                    </div>

                    <div class="inspector__property">
                        <span>Material</span>
                        <span>${object.material ? "Yes" : "No"}</span>
                    </div>

                    <div class="inspector__property">
                        <span>Color</span>
                        <span>
                            ${object.material?.color ?? "—"}
                        </span>
                    </div>
                </div>
            `;
        }
    }


    drawOverlay(ctx) {

        if (
            this.isCreatingShape &&
            this.creationPoints.length > 0
        ) {
            this._drawCreationPreview(ctx);
        }

        if (this.selectedObject instanceof Shape) {
            this._drawShapeSelection(
                ctx,
                this.selectedObject
            );
        }
    }


    _drawCreationPreview(ctx) {
        const points =
            this.creationPoints;

        if (points.length === 0) {
            return;
        }

        ctx.save();

        ctx.beginPath();

        const first =
            this.camera.worldToScreen(
                points[0]
            );

        ctx.moveTo(
            first.x,
            first.y
        );

        for (
            let i = 1;
            i < points.length;
            i++
        ) {
            const screenPoint =
                this.camera.worldToScreen(
                    points[i]
                );

            ctx.lineTo(
                screenPoint.x,
                screenPoint.y
            );
        }

        ctx.strokeStyle =
            "#ffffff";

        ctx.lineWidth = 2;

        ctx.setLineDash([
            6,
            4
        ]);

        ctx.stroke();

        ctx.setLineDash([]);

        ctx.beginPath();

        ctx.arc(
            first.x,
            first.y,
            6,
            0,
            Math.PI * 2
        );

        ctx.fillStyle =
            "#ffffff";

        ctx.fill();

        ctx.strokeStyle =
            "#000000";

        ctx.lineWidth = 2;

        ctx.stroke();

        ctx.restore();
    }


    _drawShapeSelection(ctx, shape) {
        if (shape.points.length === 0) {
            return;
        }

        ctx.save();

        ctx.beginPath();

        const first =
            this.camera.worldToScreen(
                shape.points[0]
            );

        ctx.moveTo(
            first.x,
            first.y
        );

        for (
            let i = 1;
            i < shape.points.length;
            i++
        ) {
            const point =
                this.camera.worldToScreen(
                    shape.points[i]
                );

            ctx.lineTo(
                point.x,
                point.y
            );
        }

        ctx.closePath();

        ctx.strokeStyle =
            "#ffffff";

        ctx.lineWidth = 2;

        ctx.setLineDash([
            5,
            4
        ]);

        ctx.stroke();

        ctx.setLineDash([]);

        for (
            const point of shape.points
        ) {
            const screenPoint =
                this.camera.worldToScreen(
                    point
                );

            this._drawVertexHandle(
                ctx,
                screenPoint.x,
                screenPoint.y
            );
        }

        ctx.restore();
    }


    _drawVertexHandle(
        ctx,
        x,
        y
    ) {
        const radius = 6;

        ctx.beginPath();

        ctx.arc(
            x,
            y,
            radius,
            0,
            Math.PI * 2
        );

        ctx.fillStyle =
            "#ffffff";

        ctx.fill();

        ctx.strokeStyle =
            "#000000";

        ctx.lineWidth = 2;

        ctx.stroke();
    }

    _handleMovePointerDown(worldPosition, event) {
        const object = this._findObjectAtPosition(worldPosition);

        if (!object) {
            this.selectedObject = null;
            this._updateInspector();
            return;
        }

        this.selectedObject = object;

        this.draggingObject = true;
        this.dragStartPointer = worldPosition.clone();

        if (object instanceof Lense) {
            this.dragStartPosition = object.position.clone();
        } else if (object instanceof LaserSource) {
            this.dragStartPosition = object.position.clone();
        } else if (object instanceof Shape) {
            this.dragStartPoints = object.points.map(point => ({
                x: point.x,
                y: point.y
            }));
        }

        this.canvas.setPointerCapture(event.pointerId);
        this._updateInspector();
    }

    _moveSelectedObject(worldPosition) {
        const object = this.selectedObject;

        if (!object || !this.dragStartPointer) return;

        const dx = worldPosition.x - this.dragStartPointer.x;
        const dy = worldPosition.y - this.dragStartPointer.y;

        if (object instanceof Lense) {
            object.position.x = this.dragStartPosition.x + dx;
            object.position.y = this.dragStartPosition.y + dy;

            // Линза рассчитывает форму по position и direction.
            // Обновляем вспомогательные точки для согласованности.
            for (const point of object.points) {
                point.x = object.position.x;
                point.y = object.position.y;
            }
        } else if (object instanceof LaserSource) {
            object.position.x = this.dragStartPosition.x + dx;
            object.position.y = this.dragStartPosition.y + dy;
        } else if (object instanceof Shape) {
            for (let i = 0; i < object.points.length; i++) {
                object.points[i].x = this.dragStartPoints[i].x + dx;
                object.points[i].y = this.dragStartPoints[i].y + dy;
            }
        }
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
            this._onPointerUp
        );

        this.canvas.removeEventListener(
            "wheel",
            this._onWheel
        );

        window.removeEventListener(
            "keydown",
            this._onKeyDown
        );

        this.toolbar?.removeEventListener(
            "click",
            this._onToolClick
        );
    }
}


