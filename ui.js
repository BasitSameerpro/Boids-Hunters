let alignmentSlider, cohesionSlider, separationSlider, fearSlider;
let alignmentRangeSlider, cohesionRangeSlider, separationRangeSlider;
let boidFleeRangeSlider, hunterRangeSlider;
let quadtreeCheckbox;
let useQuadtree = true;

function setupControls() {
  alignmentSlider = createSlider(0, 5, 1, 0.1);
  cohesionSlider = createSlider(0, 3, 0.5, 0.1);
  separationSlider = createSlider(0, 5, 1.5, 0.1);
  fearSlider = createSlider(0, 5, 2, 0.1);

  alignmentRangeSlider = createSlider(10, 150, 50, 5);
  cohesionRangeSlider = createSlider(10, 150, 50, 5);
  separationRangeSlider = createSlider(10, 100, 25, 5);
  boidFleeRangeSlider = createSlider(50, 200, 120, 5);
  hunterRangeSlider = createSlider(100, 300, 180, 10);

  quadtreeCheckbox = createCheckbox("Use Quadtree", true);
  quadtreeCheckbox.changed(() => (useQuadtree = quadtreeCheckbox.checked()));

  positionControls();
}

function positionControls() {
  if (width < 768) {
    let y = height - 180;
    alignmentSlider.position(10, y);
    cohesionSlider.position(10, y + 20);
    separationSlider.position(10, y + 40);
    fearSlider.position(10, y + 60);
    alignmentRangeSlider.position(10, y + 80);
    cohesionRangeSlider.position(10, y + 100);
    separationRangeSlider.position(10, y + 120);
    boidFleeRangeSlider.position(10, y + 140);
    hunterRangeSlider.position(10, y + 160);
    quadtreeCheckbox.position(10, y + 180);
  } else {
    alignmentSlider.position(20, height - 20);
    cohesionSlider.position(20, height - 40);
    separationSlider.position(20, height - 60);
    fearSlider.position(20, height - 80);

    let rx = width - 180;
    alignmentRangeSlider.position(rx, height - 20);
    cohesionRangeSlider.position(rx, height - 40);
    separationRangeSlider.position(rx, height - 60);
    boidFleeRangeSlider.position(rx, height - 80);
    hunterRangeSlider.position(rx, height - 100);
    quadtreeCheckbox.position(rx, height - 120);
  }
}

function drawControlLabels() {
  textSize(10);
  fill(255);
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

  let rx = width - 180;
  text("Alignment Range", rx - 100, height - 5);
  text("Cohesion Range", rx - 100, height - 25);
  text("Separation Range", rx - 100, height - 45);
  text("Flee Range", rx - 60, height - 65);
  text("Hunter Range", rx - 110, height - 85);
}

function getUseQuadtree() {
  return useQuadtree;
}
