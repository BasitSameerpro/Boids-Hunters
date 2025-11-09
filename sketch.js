const flocks = [];
const maxBoids = 350;
const maxHunters = 30;
const initialBoids = 20;
let initialHunters = 5;
const hunters = [];
let alignmentSlider, cohesionSlider, separationSlider;
let fearSlider, boidFleeRangeSlider, hunterRangeSlider;
let alignmentRangeSlider, cohesionRangeSlider, separationRangeSlider;

function setup() {
  createCanvas(windowWidth, windowHeight);

  // Force sliders
  alignmentSlider = createSlider(0, 5, 1, 0.1);
  cohesionSlider = createSlider(0, 3, 0.5, 0.1);
  separationSlider = createSlider(0, 5, 1.5, 0.1);
  fearSlider = createSlider(0, 5, 2, 0.1);

  // Range sliders
  alignmentRangeSlider = createSlider(10, 150, 50, 5);
  cohesionRangeSlider = createSlider(10, 150, 50, 5);
  separationRangeSlider = createSlider(10, 100, 25, 5);
  boidFleeRangeSlider = createSlider(50, 200, 120, 5);
  hunterRangeSlider = createSlider(100, 300, 180, 10);

  positionSliders();

  for (let i = 0; i < initialBoids; i++) {
    flocks.push(new boids(random(width), random(height)));
  }
  for (let i = 0; i < initialHunters; i++) {
    hunters.push(new hunter(random(width), random(height)));
  }
}

function positionSliders() {
  // Check if mobile/tablet (width < 768px)
  if (width < 768) {
    // Stack all sliders vertically on the left for mobile
    let startY = height - 180;
    alignmentSlider.position(10, startY);
    cohesionSlider.position(10, startY + 20);
    separationSlider.position(10, startY + 40);
    fearSlider.position(10, startY + 60);
    alignmentRangeSlider.position(10, startY + 80);
    cohesionRangeSlider.position(10, startY + 100);
    separationRangeSlider.position(10, startY + 120);
    boidFleeRangeSlider.position(10, startY + 140);
    hunterRangeSlider.position(10, startY + 160);
  } else {
    // Split layout for larger screens
    // Position force sliders on the left
    alignmentSlider.position(20, height - 20);
    cohesionSlider.position(20, height - 40);
    separationSlider.position(20, height - 60);
    fearSlider.position(20, height - 80);

    // Position range sliders on the right
    let rightX = width - 180;
    alignmentRangeSlider.position(rightX, height - 20);
    cohesionRangeSlider.position(rightX, height - 40);
    separationRangeSlider.position(rightX, height - 60);
    boidFleeRangeSlider.position(rightX, height - 80);
    hunterRangeSlider.position(rightX, height - 100);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);

  // Reposition force sliders on the left
  alignmentSlider.position(20, height - 20);
  cohesionSlider.position(20, height - 40);
  separationSlider.position(20, height - 60);
  fearSlider.position(20, height - 80);

  // Reposition range sliders on the right
  let rightX = width - 180;
  alignmentRangeSlider.position(rightX, height - 20);
  cohesionRangeSlider.position(rightX, height - 40);
  separationRangeSlider.position(rightX, height - 60);
  boidFleeRangeSlider.position(rightX, height - 80);
  hunterRangeSlider.position(rightX, height - 100);
}

// Left click to add boid
function mousePressed() {
  if (flocks.length <= maxBoids) {
    flocks.push(new boids(mouseX, mouseY));
  } else {
    console.log("Max boids reached");
  }
}

// Press 'H' key to add hunter
function keyPressed() {
  let newX = mouseX;
  let newY = mouseY;
  if (key === "h" || key === "H") {
    if (hunters.length < maxHunters) {
      hunters.push(new hunter(newX, newY));
    } else {
      console.log("Max hunters reached");
    }
  }
}

function draw() {
  background(25);

  // Update boids with fear behavior
  flocks.forEach((boid) => {
    boid.flock(flocks, hunters); // Pass hunters to flock method
    boid.update();
    boid.edge();
    boid.show();
  });

  // Update hunters with chase behavior
  hunters.forEach((hunter) => {
    let isHunting = hunter.chase(flocks);

    if (!isHunting) {
      hunter.wander();
    }

    let separation = hunter.separate(hunters);
    separation.mult(0.5);
    hunter.acceleration.add(separation);

    hunter.update();
    hunter.edge();
    hunter.show();
  });

  // Display info
  fill(200);
  textSize(20);
  text("Boids Simulation", 20, 40);
  text("Boids: " + flocks.length, 20, 70);
  text("Hunters: " + hunters.length, 20, 90);
  textSize(15);
  text("Click to add boids", width / 2 - 100, 20);
  text("Press 'H' to add hunter", width / 2 - 100, 40);

  // Left side labels (Forces)
  textSize(10);
  text(
    "Alignment Force",
    alignmentSlider.x * 2 + alignmentSlider.width,
    height - 5
  );
  text(
    "Cohesion Force",
    cohesionSlider.x * 2 + cohesionSlider.width,
    height - 25
  );
  text(
    "Separation Force",
    separationSlider.x * 2 + separationSlider.width,
    height - 45
  );
  text("Fear Force", fearSlider.x * 2 + fearSlider.width, height - 65);

  // Right side labels (Ranges)
  let rightX = width - 180;
  text("Alignment Range", rightX - 100, height - 5);
  text("Cohesion Range", rightX - 100, height - 25);
  text("Separation Range", rightX - 100, height - 45);
  text("Flee Range", rightX - 60, height - 65);
  text("Hunter Chase Range", rightX - 110, height - 85);
}
