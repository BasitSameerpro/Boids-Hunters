const flocks = [];
const maxBoids = 500;
const initialBoids = 20;

let alignmentSlider, cohesionSlider, separationSlider; // What the sliders will control (steering forces)
function setup() {
  createCanvas(windowWidth, windowHeight); // Set the size of the canvas {width, height}
  alignmentSlider = createSlider(0, 5, 1, 0.1); // {max, min,default, step}
  cohesionSlider = createSlider(0, 3, 0.5, 0.1);
  separationSlider = createSlider(0, 5, 1.5, 0.1);

  // Initial Position
  alignmentSlider.position(20, height - 20);
  cohesionSlider.position(20, height - 40);
  separationSlider.position(20, height - 60);
  // On canvas we create maxBoids
  for (let i = 0; i < initialBoids; i++) {
    flocks.push(new boids(random(width), random(height)));
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  // Reposition sliders to stay within the canvas
  alignmentSlider.position(20, height - 20);
  cohesionSlider.position(20, height - 40);
  separationSlider.position(20, height - 60);
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
  textSize(20);
  text("Boids Simulation", 20, 40);
  text("Boids: " + flocks.length, 20, 70);
  text("Click to add boids", width / 2, 20);
}
