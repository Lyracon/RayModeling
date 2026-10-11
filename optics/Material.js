export default class Material {
	constructor({reflectivity = 0, transparency = 0, refractiveIndex = 1, color = "#1f1f1f", outline=null} = {}) {
		this.reflectivity = reflectivity;
		this.transparency = transparency;
		this.refractiveIndex = refractiveIndex;
		this.color = color;
		this.outline = outline;
	}
}