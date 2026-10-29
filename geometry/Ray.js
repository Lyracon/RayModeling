import Vector2D from "./Vector2D.js";
import Intersection from "./Intersection.js";

export default class Ray {
    constructor(
        origin,
        direction,
        power = 1,
        bounceCounter = 0,
        wavelength = 550,
        intensity = 1
    ) {
        this.origin = origin;
        this.direction = direction;
        this.power = power;
        this.wavelength = wavelength;
        this.intensity = intensity;

        this.intersection = new Intersection();
        this.bounceCounter = bounceCounter;
        this.counter = 0;
    }

    getPoint(t) {
        return new Vector2D(
            this.origin.x + this.direction.x * t,
            this.origin.y + this.direction.y * t
        );
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.moveTo(this.origin.x, this.origin.y);

        if (this.intersection.distance === Infinity) {
            const corners = [
                { x: 0, y: 0 },
                { x: ctx.canvas.width, y: 0 },
                { x: ctx.canvas.width, y: ctx.canvas.height },
                { x: 0, y: ctx.canvas.height }
            ];

            // Ray.draw вызывается внутри camera.apply(), поэтому
            // здесь длина должна вычисляться в мировых координатах.
            const transform = ctx.getTransform();
            const inverse = transform.inverse();

            const worldCorners = corners.map(point => {
                const p = new DOMPoint(point.x, point.y)
                    .matrixTransform(inverse);

                return { x: p.x, y: p.y };
            });

            let maxDistance = 0;

            for (const point of worldCorners) {
                const projection =
                    (point.x - this.origin.x) * this.direction.x +
                    (point.y - this.origin.y) * this.direction.y;

                maxDistance = Math.max(maxDistance, projection);
            }

            const margin = 50 / Math.max(
                Math.hypot(transform.a, transform.b),
                1e-6
            );

            const length = Math.max(0, maxDistance + margin);

            ctx.lineTo(
                this.origin.x + this.direction.x * length,
                this.origin.y + this.direction.y * length
            );
        } else {
            ctx.lineTo(
                this.intersection.point.x,
                this.intersection.point.y
            );
        }

        const [r, g, b] = Ray.wavelengthToRGB(this.wavelength);
        const alpha = Math.max(
            0,
            Math.min(1, this.intensity)
        );

        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
        ctx.lineWidth = 3;
        ctx.stroke();
    }

    static rawWavelengthToRGB(wavelength) {
        let r = 0;
        let g = 0;
        let b = 0;

        if (wavelength >= 380 && wavelength < 440) {
            r = (440 - wavelength) / 60;
            b = 1;
        } else if (wavelength < 490) {
            g = (wavelength - 440) / 50;
            b = 1;
        } else if (wavelength < 510) {
            g = 1;
            b = (510 - wavelength) / 20;
        } else if (wavelength < 580) {
            r = (wavelength - 510) / 70;
            g = 1;
        } else if (wavelength < 645) {
            r = 1;
            g = (645 - wavelength) / 65;
        } else if (wavelength <= 780) {
            r = 1;
        }

        let factor = 1;

        if (wavelength < 420) {
            factor = 0.3 + 0.7 * (wavelength - 380) / 40;
        } else if (wavelength > 700) {
            factor = 0.3 + 0.7 * (780 - wavelength) / 80;
        }

        const gamma = 0.8;
        const convert = value => Math.pow(
            Math.max(0, value * factor),
            gamma
        );

        return [convert(r), convert(g), convert(b)];
    }

    static getSpectrumWhiteBalance() {
        const count = 25;
        const totals = [0, 0, 0];

        for (let i = 0; i < count; i++) {
            const wavelength = 380 + (780 - 380) * i / (count - 1);
            const rgb = Ray.rawWavelengthToRGB(wavelength);

            for (let channel = 0; channel < 3; channel++) {
                totals[channel] += rgb[channel];
            }
        }

        const target = (totals[0] + totals[1] + totals[2]) / 3;

        return totals.map(total => target / Math.max(total, 1e-9));
    }

    static wavelengthToRGB(wavelength) {
        const rgb = Ray.rawWavelengthToRGB(wavelength);
        const balance = Ray.getSpectrumWhiteBalance();

        return rgb.map((value, channel) =>
            Math.round(Math.min(1, value * balance[channel]) * 255)
        );
    }
}