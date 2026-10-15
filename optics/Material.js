export default class Material {
	constructor({reflectivity = 0, transparency = 0, absorption = 0, refractiveIndex = 1, color = "#1f1f1f", outline=null, n=1} = {}) {
		this.reflectivity = reflectivity;
		this.transparency = transparency;
		this.absorption = absorption;
		this.refractiveIndex = refractiveIndex;
		this.color = color;
		this.outline = outline;
		this.n = n;
	}
}