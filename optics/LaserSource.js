import Path from "../geometry/Path.js";

export default class LaserSource {
    constructor(position, direction, power = 1) {
        this.position = position;

        direction.normalize();
        this.direction = direction;

        this.power = power;

        this.spectrum = this.createWhiteSpectrum(42);
        this.rayPath = new Path(position, direction, 1, 0);

        this.counter = 0;
        this.step = -0.003;
    }

    createWhiteSpectrum(count) {
        const minWavelength = 380;
        const maxWavelength = 780;
        const spectrum = [];

        for (let i = 0; i < count; i++) {
            const t = count === 1 ? 0.5 : i / (count - 1);

            spectrum.push({
                wavelength:
                    minWavelength
                    + (maxWavelength - minWavelength) * t,
                intensity: 1 / count
            });
        }

        return spectrum;
    }

    setRotation(angle) {
        this.direction.x = Math.cos(angle);
        this.direction.y = Math.sin(angle);
    }

    move() {
        this.counter -= this.step;
        this.position.y = Math.sin(this.counter) * 100 + 360;
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.moveTo(this.position.x, this.position.y);

        ctx.lineTo(
            this.position.x - this.direction.x * 70,
            this.position.y - this.direction.y * 70
        );

        ctx.strokeStyle = "rgb(100, 100, 100)";
        ctx.lineWidth = 30;
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(
            this.position.x - this.direction.x * 10,
            this.position.y - this.direction.y * 10
        );

        ctx.lineTo(
            this.position.x - this.direction.x * 60,
            this.position.y - this.direction.y * 60
        );

        ctx.strokeStyle = "rgb(50, 50, 50)";
        ctx.lineWidth = 30;
        ctx.stroke();
    }
}