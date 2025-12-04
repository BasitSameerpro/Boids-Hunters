class Obstacle {
  constructor(x, y, r) {
    this.position = createVector(x, y);
    this.radius = r;
  }
  show() {
    fill(150);
    noStroke();
    ellipse(this.position.x, this.position.y, this.radius * 2, this.radius * 2);
  }
}
