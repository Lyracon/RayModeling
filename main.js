import Rectangle from "./geometry/Rectangle.js"
import Ray from "./geometry/Ray.js"
import Shape from "./geometry/Shape.js"
import Vector2D from "./geometry/Vector2D.js"
import Material from "./optics/Material.js"
import Scene from "./engine/Scene.js"
import App from "./engine/App.js"
import LaserSource from "./optics/LaserSource.js"

const canvas = document.querySelector("#work-area");
const ctx = canvas.getContext("2d");

canvas.width = 1280;
canvas.height = 720;

const fixedDt = 1 / 60;
let accumulator = 0;
let previousTime = 0;



const app = new App(canvas, ctx);

const material = new Material({reflectivity: 0.7, color: "#cfdfef"})


// ============================================================
// MATERIALS
// ============================================================

const mirror = new Material();
mirror.color = "#b8c0cc";
mirror.reflectivity = 0.9;
mirror.refractiveIndex = 1.0;

const darkMirror = new Material();
darkMirror.color = "#30343b";
darkMirror.reflectivity = 0.8;
darkMirror.refractiveIndex = 1.0;

const glass = new Material();
glass.color = "rgb(120, 185, 214, 0.5)";
glass.reflectivity = 0.1;
glass.transparency = 0.6;
glass.refractiveIndex = 1.5;

const water = new Material();
water.color = "rgb(15, 10, 150, 0.7)";
water.reflectivity = 0.05;
water.transparency = 0.9;
water.refractiveIndex = 1.333;

const red = new Material();
red.color = "rgb(255, 50, 50, 0.5)";
red.reflectivity = 0.15;
red.transparency = 0.45;
red.refractiveIndex = 1.4;

const gold = new Material();
gold.color = "#f2b85a";
gold.reflectivity = 0.75;

const wall = new Material();
wall.color = "#252932";


// ============================================================
// LEFT MIRROR
// ============================================================

const shape1 = new Shape(mirror);

shape1.addPoint(100, 480);
shape1.addPoint(260, 620);
shape1.addPoint(275, 605);
shape1.addPoint(115, 465);


// ============================================================
// RIGHT MIRROR
// ============================================================

const shape2 = new Shape(mirror);

shape2.addPoint(900, 160);
shape2.addPoint(1170, 300);
shape2.addPoint(1160, 320);
shape2.addPoint(890, 185);


// ============================================================
// DIAGONAL DARK MIRROR
// ============================================================

const shape3 = new Shape(darkMirror);

shape3.addPoint(500, 150);
shape3.addPoint(760, 100);
shape3.addPoint(765, 125);
shape3.addPoint(505, 175);


// ============================================================
// RED TRIANGLE
// ============================================================

const shape4 = new Shape(red);

shape4.addPoint(380, 510);
shape4.addPoint(500, 350);
shape4.addPoint(710, 470);


// ============================================================
// GLASS PRISM
// ============================================================

const prism = new Shape(glass);

prism.addPoint(550, 380);
prism.addPoint(760, 300);
prism.addPoint(870, 380);
prism.addPoint(820, 530);
prism.addPoint(600, 530);


// ============================================================
// SMALL GOLDEN TRIANGLE
// ============================================================

const goldTriangle = new Shape(gold);

goldTriangle.addPoint(180, 180);
goldTriangle.addPoint(270, 120);
goldTriangle.addPoint(320, 220);


// ============================================================
// WATER-LIKE OBJECT
// ============================================================

const waterShape = new Shape(water);

waterShape.addPoint(950, 500);
waterShape.addPoint(1080, 440);
waterShape.addPoint(1190, 510);
waterShape.addPoint(1130, 620);
waterShape.addPoint(1000, 610);


// ============================================================
// BOTTOM WALL
// ============================================================

const bottomWall = new Shape(wall);

bottomWall.addPoint(0, 680);
bottomWall.addPoint(1280, 680);
bottomWall.addPoint(1280, 720);
bottomWall.addPoint(0, 720);


// ============================================================
// TOP WALL
// ============================================================

const topWall = new Shape(wall);

topWall.addPoint(0, 0);
topWall.addPoint(1280, 0);
topWall.addPoint(1280, 35);
topWall.addPoint(0, 35);




const smallMirror = new Shape(mirror);

smallMirror.addPoint(330, 290);
smallMirror.addPoint(450, 250);
smallMirror.addPoint(455, 265);
smallMirror.addPoint(335, 305);


const smallMirror2 = new Shape(gold);

smallMirror2.addPoint(760, 600);
smallMirror2.addPoint(900, 560);
smallMirror2.addPoint(905, 575);
smallMirror2.addPoint(765, 615);


// const marker = new Rectangle(
// 	new Vector2D(500, 600),
// 	15, 15,
// 	new Material({color: "#ff0000"})
// );
// marker.tag = "marker";



const laserSource = new LaserSource(new Vector2D(125, 345), new Vector2D(0.1, 5), 1);


app.scene.addObject(shape1);
app.scene.addObject(shape2);
app.scene.addObject(shape3);
app.scene.addObject(shape4);

app.scene.addObject(prism);
app.scene.addObject(goldTriangle);
app.scene.addObject(waterShape);
app.scene.addObject(bottomWall);
app.scene.addObject(topWall);

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