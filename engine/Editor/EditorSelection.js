import Shape from "../../geometry/Shape.js";
import Lense from "../../optics/Lense.js";
import LaserSource from "../../optics/LaserSource.js";

export default class EditorSelection {
    constructor(scene) {
        this.scene = scene;
        this.sourceHitRadius = 30;
    }

    findObjectAtPosition(position) {
        // Источники рисуются поверх объектов, поэтому
        // проверяем их первыми.
        for (let i = this.scene.sources.length - 1; i >= 0; i--) {
            const source = this.scene.sources[i];

            if (this._sourceContainsPoint(source, position)) {
                return source;
            }
        }

        for (let i = this.scene.objects.length - 1; i >= 0; i--) {
            const object = this.scene.objects[i];

            if (object instanceof Lense) {
                if (this._lensContainsPoint(object, position)) {
                    return object;
                }

                continue;
            }

            if (
                object instanceof Shape &&
                this._shapeContainsPoint(object, position)
            ) {
                return object;
            }
        }

        return null;
    }

    _sourceContainsPoint(source, point) {
        const dx = point.x - source.position.x;
        const dy = point.y - source.position.y;

        return (
            dx * dx + dy * dy <=
            this.sourceHitRadius * this.sourceHitRadius
        );
    }

    _lensContainsPoint(lens, point) {
        const radius = Math.abs(lens.radius);
        const delta = lens.delta;
        const direction = lens.direction;
        const center = lens.position;

        // Центры окружностей, образующих линзу.
        const center1X = center.x + direction.x * delta;
        const center1Y = center.y + direction.y * delta;

        const center2X = center.x - direction.x * delta;
        const center2Y = center.y - direction.y * delta;

        const dx1 = point.x - center1X;
        const dy1 = point.y - center1Y;

        const dx2 = point.x - center2X;
        const dy2 = point.y - center2Y;

        return (
            dx1 * dx1 + dy1 * dy1 <= radius * radius &&
            dx2 * dx2 + dy2 * dy2 <= radius * radius
        );
    }

    _shapeContainsPoint(shape, point) {
        if (shape.points.length < 3) {
            return false;
        }

        let inside = false;

        for (
            let i = 0, j = shape.points.length - 1;
            i < shape.points.length;
            j = i++
        ) {
            const a = shape.points[i];
            const b = shape.points[j];

            const intersects =
                (a.y > point.y) !== (b.y > point.y) &&
                point.x <
                    ((b.x - a.x) * (point.y - a.y)) /
                        (b.y - a.y) +
                    a.x;

            if (intersects) {
                inside = !inside;
            }
        }

        return inside;
    }
}