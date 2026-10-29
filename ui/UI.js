import CanvasInput from "../engine/CanvasInput.js";

export default class UI {
	constructor(canvas, toolbarElement, insperctorElement, statusElement) {
		this.toolbarElement = toolbarElement;
		this.insperctorElement = insperctorElement;
		this.statusElement = statusElement;

		this.selectedToolbarTool = null;

		this.toolButtons = this.toolbarElement.querySelectorAll("[data-tool]");
		this.toolButtons.forEach(button => {
			button.addEventListener("click", () => {
				const tool = button.dataset.tool;
				this.select(tool);
			});
		});
	}

	select(tool) {
		this.toolButtons.forEach(button => {
			button.classList.toggle(
				"active",
				button.dataset.tool === tool
			);
		});

		this.selectedToolbarTool = tool;
	}

	onToolChange(tool) {

	}
}