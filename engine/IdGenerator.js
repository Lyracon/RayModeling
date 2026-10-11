export default class IdGenerator {
	static id = -1;

	static NewId() {
		this.id++;
		return this.id;
	}
}