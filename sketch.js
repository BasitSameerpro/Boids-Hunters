const flocks = [];
const maxBoids = 500;
const initialBoids = 50;

let alignmentSlider, cohesionSlider, separationSlider; // What the sliders will control (steering forces)
function setup() {
  alignmentSlider = createSlider(0, 5, 1, 0.1); // {max, min,default, step}
  cohesionSlider = createSlider(0, 3, 0.5, 0.1);
  separationSlider = createSlider(0, 5, 1.5, 0.1);
  createCanvas(1400, 775); // Set the size of the canvas {width, height}
  // On canvas we create maxBoids
  for (let i = 0; i < initialBoids; i++) {
    flocks.push(new boids(random(width), random(height)));
  }
}

// on click of mouse, add a new boid to the flock
function mousePressed() {
  if (flocks.length <= maxBoids) {
    flocks.push(new boids(mouseX, mouseY));
  } else console.log("Max boids reached");
}

function draw() {
  background(25);
  // translate(700, 237); // Move the origin to the center of the canvas (not working properly)
  flocks.forEach((boids) => {
    boids.flock(flocks);
    boids.update();
    boids.edge();
    boids.show();
  });
  fill(200);
  textSize(25);
  text("Boids Simulation", 20, 40);
  text("Boids: " + flocks.length, 20, 70);
  text("Click to add boids", 1000, 40);
}
