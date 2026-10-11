import Ray from "../geometry/Ray.js";
import Vector2D from "../geometry/Vector2D.js";
import Intersection from "../geometry/Intersection.js";

export default class RayTracer {
	static EPSILON = 1e-9;
	constructor({scene, maxBounces=25, minPower=0.01} = {}) {
		this.scene = scene;
		this.maxBounces = maxBounces;
		this.minPower = minPower;
	}

	update(dt) {
		for (const ray of this.scene.rays) {
			this.trace(ray);
		}
	}

	updateMediums(mediums, object) {
		const index = mediums.lastIndexOf(object);

	    if (index !== -1) {
	        mediums.splice(index, 1);
	        return true;
	    }
		mediums.push(object);
		return false;
	}

	traceRay(path, ray, mediums=[]) {

		path.add(ray);

		this.findClosestIntersection(ray);

		if (
			ray.intersection.distance == Infinity ||
			ray.power < this.minPower ||
			ray.bounceCounter > this.maxBounces
		) {
			return;
		} else {

			const reflectedRay = this.getReflectedRay(ray);
			this.traceRay(path, reflectedRay, [...mediums]);

			const nextMediums = [...mediums]
			const isOut = this.updateMediums(nextMediums, ray.intersection.object);
			const refractedRay = this.getRefractedRay(ray, nextMediums, isOut);
			this.traceRay(path, refractedRay, nextMediums);
		}
	}

	tracePath(source) {

		let firstRay = new Ray(
			source.position,
			source.direction,
			1, 0
		)
		this.traceRay(source.rayPath, firstRay, []);
	}

	getReflectedRay(ray) {
		const dot = Vector2D.dot(ray.direction, ray.intersection.normal);

		const originX = ray.intersection.point.x + ray.intersection.normal.x * RayTracer.EPSILON;
		const originY = ray.intersection.point.y + ray.intersection.normal.y * RayTracer.EPSILON;
		
		const directionX = ray.direction.x - 2 * dot * ray.intersection.normal.x;
		const directionY = ray.direction.y - 2 * dot * ray.intersection.normal.y;
		
		const power = ray.intersection.object.material.reflectivity * ray.power;

	    return new Ray(
	        {x: originX, y: originY},
	        {x: directionX, y: directionY},
	        power,
	        ray.bounceCounter + 1
	    )
	};

	getRefractedRay(ray, objects, isOut) {
		const originX = ray.intersection.point.x - ray.intersection.normal.x * RayTracer.EPSILON;
		const originY = ray.intersection.point.y - ray.intersection.normal.y * RayTracer.EPSILON;
		
		let refractiveIndex = 1; 

		if (isOut) {
			for (const object of objects) {
				refractiveIndex *= object.material.refractiveIndex;
			}
			refractiveIndex *= ray.intersection.object.material.refractiveIndex
		} else {
			for (const object of objects) {
				refractiveIndex *= object.material.refractiveIndex;
			}
			refractiveIndex = 1 / refractiveIndex;
		}

		const dot = Vector2D.dot(ray.direction, ray.intersection.normal);
		const parallel = new Vector2D(dot * ray.intersection.normal.x, dot * ray.intersection.normal.y);
		const perpendicular = new Vector2D(
			(ray.direction.x - parallel.x) * refractiveIndex,
			(ray.direction.y - parallel.y) * refractiveIndex
		);
		perpendicular.add(parallel);
		perpendicular.normolize();

		const power = ray.intersection.object.material.transparency * ray.power;

		return new Ray(
	        {x: originX, y: originY},
	        perpendicular,
	        power,
	        ray.bounceCounter + 1
	    )
	};

	clear(source) {
		source.rayPath.rays = [];
	}

	findClosestIntersection(ray) {
	    let closestIntersection = new Intersection();

	    for (const object of this.scene.objects) {
	        if (object.tag === "marker") {
	            continue;
	        }

	        const intersection = object.getIntersection(ray);

	        if (intersection.distance === Infinity) {
	            continue;
	        }

	        if (
	            intersection.distance < closestIntersection.distance
	        ) {
	            closestIntersection = intersection;
	        }
	    }

	    ray.intersection = closestIntersection;
	}


	processIntersection(ray, intersection) {

	}
} 
