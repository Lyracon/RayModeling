import LightSource from "../optics/LightSource.js";
import Sensor from "../optics/Sensor.js";

export default class Scene {
    constructor() {
        this.objects = [];
        this.sources = [];
        this.rays = [];
    }

    update(dt) {
        // Логика сцены появится здесь позже,
        // если она действительно понадобится.
    }

    addObject(object) {
        this.objects.push(object);
        return object;
    }

    removeObject(object) {
        const index = this.objects.indexOf(object);

        if (index !== -1) {
            this.objects.splice(index, 1);
        }
    }

    addSource(source) {
        this.sources.push(source);
        return source;
    }

    removeSource(source) {
        const index = this.sources.indexOf(source);

        if (index !== -1) {
            this.sources.splice(index, 1);
        }
    }

    addRay(ray) {
        this.rays.push(ray);
        return ray;
    }

    clearRays() {
        this.rays.length = 0;
    }
}