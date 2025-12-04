const flocks = [];
let newBoids = [];
const maxBoids = 350;
const maxHunters = 30;
const initialBoids = 20;
let initialHunters = 5;
const hunters = [];
const obstacles = [];

// Day/Night
let timeOfDay = 0;
let dayDuration = 7200;
let cloudOffset = 0;

function setup() {
  createCanvas(windowWidth, windowHeight);
  setupControls();

  for (let i = 0; i < initialBoids; i++) {
    flocks.push(new Boid(random(width), random(height)));
  }
  for (let i = 0; i < initialHunters; i++) {
    hunters.push(new Hunter(random(width), random(height)));
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  positionControls();
}

function isMouseOverControls() {
  const controls = [
    alignmentSlider,
    cohesionSlider,
    separationSlider,
    fearSlider,
    alignmentRangeSlider,
    cohesionRangeSlider,
    separationRangeSlider,
    boidFleeRangeSlider,
    hunterRangeSlider,
    quadtreeCheckbox,
  ];
  for (let c of controls) {
    if (
      c &&
      mouseX > c.x &&
      mouseX < c.x + c.width &&
      mouseY > c.y &&
      mouseY < c.y + c.height
    )
      return true;
  }
  return false;
}

function mousePressed() {
  if (isMouseOverControls()) return;
  if (flocks.length < maxBoids) flocks.push(new Boid(mouseX, mouseY));
}
function mouseDragged() {
  if (isMouseOverControls()) return;
  obstacles.push(new Obstacle(mouseX, mouseY, 10));
}

let debug = false;
let showQuadtree = false;

function keyPressed() {
  if (key === "h" || key === "H") {
    if (hunters.length < maxHunters) hunters.push(new Hunter(mouseX, mouseY));
  } else if (key === "d" || key === "D") debug = !debug;
  else if (key === "q" || key === "Q") showQuadtree = !showQuadtree;
}

function drawCloud(x, y, s = 1) {
  push();
  translate(x, y);
  ellipse(0, 0, 100 * s, 60 * s);
  ellipse(-40 * s, -10 * s, 80 * s, 50 * s);
  ellipse(40 * s, -10 * s, 80 * s, 50 * s);
  ellipse(-20 * s, 15 * s, 70 * s, 45 * s);
  ellipse(20 * s, 15 * s, 70 * s, 45 * s);
  pop();
}

function drawBackground() {
  timeOfDay = (frameCount / dayDuration) % 1;
  let sunX = width * 0.15 + width * 0.7 * timeOfDay;
  let sunY = height * 0.8 - height * 0.6 * sin(timeOfDay * PI);

  let skyTop, skyBottom, sunColor, sunAlpha;

  if (timeOfDay < 0.25) {
    skyTop = color(255, 180, 100);
    skyBottom = color(135, 206, 250);
    sunColor = color(255, 200, 100);
    sunAlpha = 60;
  } else if (timeOfDay < 0.5) {
    skyTop = color(135, 206, 250);
    skyBottom = color(70, 130, 200);
    sunColor = color(255, 240, 180);
    sunAlpha = 50;
  } else if (timeOfDay < 0.75) {
    skyTop = color(255, 140, 80);
    skyBottom = color(100, 60, 180);
    sunColor = color(255, 100, 50);
    sunAlpha = 70;
  } else {
    skyTop = color(10, 10, 40);
    skyBottom = color(5, 5, 30);
    sunColor = color(240, 240, 255);
    sunAlpha = 40;
  }

  for (let y = 0; y <= height; y++) {
    let n = map(y, 0, height, 0, 1);
    stroke(lerpColor(skyTop, skyBottom, n));
    line(0, y, width, y);
  }

  noStroke();
  fill(sunColor, sunAlpha);
  ellipse(sunX, sunY, 120 + sin(frameCount * 0.02) * 15);

  if (timeOfDay > 0.75 || timeOfDay < 0.1) {
    fill(255, 255, 200, random(100, 255));
    for (let i = 0; i < 80; i++) {
      let sx = (i * 137.5 + frameCount * 0.1) % width;
      let sy = (i * 97.3) % (height * 0.5);
      ellipse(sx, sy, random(1, 3));
    }
  }

  if (timeOfDay >= 0.15 && timeOfDay <= 0.85) {
    cloudOffset += 0.3;
    push();
    translate(cloudOffset % width, 0);
    fill(255, 255, 255, 180);
    noStroke();
    drawCloud(width * 0.2, height * 0.15, 1.2);
    drawCloud(width * 0.7, height * 0.25, 1.5);
    drawCloud(width * 1.3, height * 0.1, 1.0);
    drawCloud(width * 1.8, height * 0.2, 1.3);
    drawCloud(width * -0.4, height * 0.18, 1.1);
    pop();
  }
}

function draw() {
  drawBackground();

  let boundary = new Rectangle(width / 2, height / 2, width / 2, height / 2);
  let qtree = new QuadTree(boundary, 4);
  for (let b of flocks) qtree.insert(b);
  let flockData = getUseQuadtree() ? qtree : flocks;

  for (let o of obstacles) o.show();

  newBoids = [];
  for (let i = flocks.length - 1; i >= 0; i--) {
    let b = flocks[i];

    // Remove dead boids
    if (!b.isAlive) {
      flocks.splice(i, 1);
      continue;
    }

    b.flock(flockData, hunters, obstacles);
    b.update(); // energy drain + age happens here
    b.edge();
    b.show();

    let baby = b.reproduce(flockData);
    if (baby) newBoids.push(baby);
  }
  flocks.push(...newBoids);

  hunters.forEach((h) => {
    let hunting = h.chase(flockData);
    if (!hunting) h.wander();
    h.acceleration.add(h.separate(hunters).mult(0.5));
    h.avoid(obstacles);
    h.update();
    h.edge();
    h.show();
  });

  let textCol =
    timeOfDay > 0.7 || timeOfDay < 0.15 ? color(220) : color(20, 40, 80);
  fill(textCol);
  textSize(20);
  text("Boids Simulation", 20, 40);
  text("Boids: " + flocks.length, 20, 70);
  text("Hunters: " + hunters.length, 20, 90);
  textSize(15);
  text("Click → add boid", width / 2 - 110, 20);
  text("Drag → obstacles", width / 2 - 110, 40);
  text("H → add hunter", width / 2 - 110, 60);
  text("D → debug · Q → quadtree", width / 2 - 110, 80);

  if (debug) {
    fill(textCol);
    text("Debug ON", 20, 110);
  }
  if (showQuadtree) qtree.show();

  drawControlLabels();
}
