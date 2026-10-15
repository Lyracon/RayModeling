import Ray from "../geometry/Ray.js";
import Vector2D from "../geometry/Vector2D.js";
import Intersection from "../geometry/Intersection.js";

export default class RayTracer {
	static EPSILON = 1e-9;
	constructor({scene, maxBounces=10, minPower=0.01} = {}) {
		this.scene = scene;
		this.maxBounces = maxBounces;
		this.minPower = minPower;
	}

	update(dt) {
		for (const ray of this.scene.rays) {
			this.trace(ray);
		}
	}

	getAndUpdateMediums(mediums, object) {
	   	let n1 = 1; 
	   	let n2 = 1; 

    	for (const medium of mediums) {
    		n1 *= medium.material.n;
    	}

		const index = mediums.lastIndexOf(object);
	    if (index !== -1) {
	        n2 = n1/object.material.n;
	        mediums.splice(object.material, 1);

	    } else {
	        n2 = n1 * object.material.n;
			mediums.push(object);
	    }
		return {n1: n1, n2: n2};
	}

	traceRay(path, ray, mediums=[]) {

		path.add(ray);

		this.findClosestIntersection(ray);

		if (
			ray.intersection.distance == Infinity ||
			ray.power < this.minPower ||
			ray.bounceCounter + 1 > this.maxBounces
		) {
			return;
		} else {

			const oldMediums = [...mediums];
			const {n1, n2} = this.getAndUpdateMediums(mediums, ray.intersection.object);
			const normal = ray.intersection.normal;
			
			const refractedRay = this.getRefractedRay(ray, normal, n1, n2);
			const reflectedRay = this.getReflectedRay(ray, normal, n1, n2, refractedRay);
			

			this.traceRay(path, reflectedRay, oldMediums);
			if (refractedRay !== null) {
				refractedRay.power = ray.power * ray.intersection.transmittance;
				this.traceRay(path, refractedRay, [...mediums]);
			}

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

	getReflectedRay(ray, normal, n1, n2, refractedRay) {
		let dot = Vector2D.dot(ray.direction, normal);

		const originX = ray.intersection.point.x + normal.x * RayTracer.EPSILON;
		const originY = ray.intersection.point.y + normal.y * RayTracer.EPSILON;
		
		const directionX = ray.direction.x - 2 * dot * normal.x;
		const directionY = ray.direction.y - 2 * dot * normal.y;

		if (refractedRay !== null) {
			let nx = normal.x; 
			let ny = normal.y; 

			let cosA;
			let cosB;

			if (dot > 0) {
				cosA = dot;
				cosB = Vector2D.dot(refractedRay.direction, new Vector2D(-nx, -ny));
			} else {
				cosB = Vector2D.dot(refractedRay.direction, new Vector2D(-nx, -ny));
				cosA = Vector2D.dot(ray.direction, new Vector2D(-nx, -ny));
			}

			const Rs = (n1 * cosA - n2 * cosB) / (n1 * cosA + n2 * cosB);
			const Rp = (n2 * cosA - n1 * cosB) / (n2 * cosA + n1 * cosB);
			const R = (Rs*Rs + Rp*Rp) / 2;

			const power = ray.power * R;
			ray.intersection.reflectance = R;
			ray.intersection.transmittance = 1 - R;

			return new Ray(
		        {x: originX, y: originY},
		        {x: directionX, y: directionY},
		        power,
		        ray.bounceCounter + 1
		    )
		} else {
			const power = ray.power;
			ray.intersection.reflectance = 1;
			ray.intersection.transmittance = 0;

			return new Ray(
		        {x: originX, y: originY},
		        {x: directionX, y: directionY},
		        power,
		        ray.bounceCounter + 1
		    )
		}
	};

	getRefractedRay(ray, normal, n1, n2) {
		// console.log(ray, normal, n1, n2);
		let dot = Vector2D.dot(ray.direction, normal);
			
		let nx = normal.x; 
		let ny = normal.y; 

		if (dot > 0) {
			nx = -nx;
			ny = -ny;
			dot = -dot;
		}

		const refractiveIndex = n1/n2;
		
		const sinTheta1 = Math.abs(Vector2D.vec(ray.direction, normal));
		const sinTheta2 = sinTheta1 * refractiveIndex;

		if (sinTheta2 > 1) {
			return null;
		}

		const parallelToNormal = new Vector2D(dot * nx, dot * ny);
		const tangent = new Vector2D(
			ray.direction.x - parallelToNormal.x,
			ray.direction.y - parallelToNormal.y,
		);

		const cosTheta2 = Math.sqrt(1 - sinTheta2*sinTheta2);

		const direction = new Vector2D();

		direction.x = refractiveIndex * tangent.x - cosTheta2 * nx;
		direction.y = refractiveIndex * tangent.y - cosTheta2 * ny;
		direction.normolize();

		const originX = ray.intersection.point.x - nx * RayTracer.EPSILON;
		const originY = ray.intersection.point.y - ny * RayTracer.EPSILON;

		const power = ray.power;

		return new Ray(
	        {x: originX, y: originY},
	        direction,
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
