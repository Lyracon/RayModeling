export default class Material {
    constructor({
        color = "#1f1f1f",
        n = 1.5,
        dispersion = 0.01
    } = {}) {
        this.color = color;
        this.n = n;
        this.dispersion = dispersion;
    }

    getRefractiveIndex(wavelength) {
        if (!Number.isFinite(wavelength) || wavelength <= 0) {
            return this.n;
        }

        // Переводим длину волны из нанометров в микрометры.
        const wavelengthUm = wavelength / 1000;
        const referenceWavelengthUm = 0.55;

        return this.n + this.dispersion * (
            1 / (wavelengthUm * wavelengthUm)
            - 1 / (referenceWavelengthUm * referenceWavelengthUm)
        );
    }
}