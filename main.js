import Rectangle from "./geometry/Rectangle.js";
import Ray from "./geometry/Ray.js";
import Shape from "./geometry/Shape.js";
import Vector2D from "./geometry/Vector2D.js";
import Material from "./optics/Material.js";
import Scene from "./engine/Scene.js";
import App from "./engine/App.js";
import LaserSource from "./optics/LaserSource.js";
import Lense from "./optics/Lense.js";
import EditorController from "./engine/EditorController.js";


const toolbarElement = document.querySelector("#toolbar");
const insperctorElement = document.querySelector("#insperctor");
const statusElement = document.querySelector("#status");
const canvas = document.querySelector("#work-canvas");
const ctx = canvas.getContext("2d");

canvas.width = 1280;
canvas.height = 1280 * 3/4;

const fixedDt = 1 / 60;
let accumulator = 0;
let previousTime = 0;

const app = new App(canvas, ctx);
const editor = new EditorController(app, canvas);

app.rendering.setEditor(editor);


const material = new Material({reflectivity: 0.7, color: "#cfdfef"})

const glass = new Material({
    color: "rgba(120, 185, 214, 0.5)",
    n: 1.52,
    dispersion: 0.005
});

const markerMaterial = new Material();
markerMaterial.color = "#0f0f0f";


const marker = new Shape(markerMaterial);
marker.tag = "marker";

const markerPos = new Vector2D(1000, 480);;

marker.addPoint(markerPos.x, markerPos.y+7);
marker.addPoint(markerPos.x+7, markerPos.y);
marker.addPoint(markerPos.x, markerPos.y-7);
marker.addPoint(markerPos.x-7, markerPos.y);

const lense = new Lense(new Vector2D(300, 480), new Vector2D(1, 0), 600, 0, 700, null, glass)

const laserSource = new LaserSource(new Vector2D(200, 680), new Vector2D(1, 0), 1);


app.scene.addObject(marker);
app.scene.addObject(lense);

app.scene.addSource(laserSource);


function mainLoop(timestamp) {
	const dt = Math.min((timestamp - previousTime) / 1000, 0.1);

	previousTime = timestamp;
	accumulator += dt;

	while (accumulator >= fixedDt) {
		app.update(fixedDt);
		accumulator -= fixedDt;
	}

	app.draw();
	requestAnimationFrame(mainLoop);
}
requestAnimationFrame(mainLoop);