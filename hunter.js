class Hunter {
  constructor(x, y) {
    this.position = createVector(x, y);
    this.velocity = p5.Vector.random2D();
    this.velocity.setMag(random(2, 4));
    this.acceleration = createVector(0, 0);
    this.maxSpeed = 5;
    this.maxForce = 0.3;
    this.color = color(255, 0, 0); // Red for hunters
    this.isAlive = true;
  }

  show() {
    push();
    translate(this.position.x, this.position.y);
    if (debug) {
      noFill();
      strokeWeight(1);
      stroke(255, 0, 0, 100); // Red debug circle for hunter range
      circle(0, 0, hunterRangeSlider.value() * 2);
    }
    rotate(this.velocity.heading() + PI / 2);
    fill(255, 100, 0);
    stroke(60, 30, 15);
    strokeWeight(1);
    ellipse(0, 0, 16, 32);
    fill(255, 0, 0);
    noStroke();
    ellipse(0, -20, 14, 18);
    fill(40, 40, 40);
    stroke(20, 20, 20);
    strokeWeight(1);
    beginShape();
    vertex(0, -28);
    vertex(-3, -32);
    vertex(0, -35);
    vertex(3, -32);
    endShape(CLOSE);
    triangle(0, -28, -2, -30, 2, -30);
    fill(255, 200, 0);
    stroke(0);
    strokeWeight(0.5);
    ellipse(-3, -22, 4, 4);
    ellipse(3, -22, 4, 4);
    fill(0);
    noStroke();
    ellipse(-3, -22, 2, 2);
    ellipse(3, -22, 2, 2);
    fill(255);
    ellipse(-2.5, -22.5, 0.8, 0.8);
    ellipse(3.5, -22.5, 0.8, 0.8);
    fill(70, 35, 18);
    stroke(50, 25, 12);
    strokeWeight(1);
    push();
    rotate(-0.3);
    ellipse(-12, -8, 18, 35);
    noFill();
    stroke(40, 20, 10);
    for (let i = 0; i < 4; i++) {
      line(-12, -20 + i * 8, -12, -15 + i * 8);
    }
    pop();
    push();
    rotate(0.3);
    ellipse(12, -8, 18, 35);
    noFill();
    stroke(40, 20, 10);
    for (let i = 0; i < 4; i++) {
      line(12, -20 + i * 8, 12, -15 + i * 8);
    }
    pop();
    fill(50, 25, 12);
    noStroke();
    for (let i = 0; i < 3; i++) {
      let angle = -0.4 + i * 0.1;
      push();
      rotate(angle);
      ellipse(-22, -10, 3, 12);
      pop();
    }
    for (let i = 0; i < 3; i++) {
      let angle = 0.4 - i * 0.1;
      push();
      rotate(angle);
      ellipse(22, -10, 3, 12);
      pop();
    }
    fill(60, 30, 15);
    stroke(40, 20, 10);
    strokeWeight(1);
    for (let i = -3; i <= 3; i++) {
      push();
      rotate(i * 0.05);
      ellipse(i * 2, 18, 4, 20);
      pop();
    }
    stroke(20, 20, 20);
    strokeWeight(2);
    line(-4, 12, -6, 18);
    line(-2, 12, -3, 18);
    line(0, 12, -1, 18);
    line(4, 12, 6, 18);
    line(2, 12, 3, 18);
    line(0, 12, 1, 18);
    pop();
  }

  chase(boids) {
    let perception = hunterRangeSlider.value();
    let otherBoids;
    if (boids instanceof QuadTree) {
      let range = new Rectangle(
        this.position.x,
        this.position.y,
        perception,
        perception
      );
      otherBoids = boids.query(range);
    } else {
      otherBoids = boids;
    }
    if (otherBoids.length > 0) {
      let target = null;
      let minDist = Infinity;
      for (let boid of otherBoids) {
        let d = dist(
          this.position.x,
          this.position.y,
          boid.position.x,
          boid.position.y
        );
        if (d < perception && d < minDist) {
          minDist = d;
          target = boid;
        }
      }
      if (target) {
        let desired = p5.Vector.sub(target.position, this.position);
        desired.setMag(this.maxSpeed);
        let steer = p5.Vector.sub(desired, this.velocity);
        steer.limit(this.maxForce * 1.5);
        this.acceleration.add(steer);

        // Check if caught the boid
        if (minDist < 15) {
          target.isAlive = false;
        }
        return true;
      }
    }
    return false;
  }

  wander() {
    let wanderDist = 50;
    let wanderRadius = 20;
    let wanderPoint = this.velocity
      .copy()
      .normalize()
      .mult(wanderDist)
      .add(this.position);
    wanderPoint.add(p5.Vector.random2D().mult(wanderRadius));
    let desired = p5.Vector.sub(wanderPoint, this.position);
    desired.setMag(this.maxSpeed);
    let steer = p5.Vector.sub(desired, this.velocity);
    steer.limit(this.maxForce * 0.5);
    this.acceleration.add(steer);
  }

  separate(hunters) {
    let perception = 50;
    let steering = createVector();
    let total = 0;
    for (let other of hunters) {
      if (other !== this) {
        let d = dist(
          this.position.x,
          this.position.y,
          other.position.x,
          other.position.y
        );
        if (d < perception) {
          let diff = p5.Vector.sub(this.position, other.position);
          diff.div(d * d); // Stronger repulsion closer
          steering.add(diff);
          total++;
        }
      }
    }
    if (total > 0) {
      steering.div(total);
      steering.setMag(this.maxSpeed);
      steering.sub(this.velocity);
      steering.limit(this.maxForce);
    }
    return steering;
  }

  avoid(obstacles) {
    let steering = createVector();
    for (let obstacle of obstacles) {
      let d = dist(
        this.position.x,
        this.position.y,
        obstacle.position.x,
        obstacle.position.y
      );
      if (d < obstacle.radius + 30) {
        let diff = p5.Vector.sub(this.position, obstacle.position);
        diff.div(d);
        steering.add(diff);
      }
    }
    if (steering.mag() > 0) {
      steering.setMag(this.maxSpeed);
      steering.sub(this.velocity);
      steering.limit(this.maxForce * 2);
    }
    this.acceleration.add(steering);
  }

  update() {
    this.velocity.add(this.acceleration);
    this.velocity.limit(this.maxSpeed);
    this.position.add(this.velocity);
    this.acceleration.mult(0);
  }

  edge() {
    if (this.position.x > width) {
      this.position.x = 0;
    } else if (this.position.x < 0) {
      this.position.x = width;
    }
    if (this.position.y > height) {
      this.position.y = 0;
    } else if (this.position.y < 0) {
      this.position.y = height;
    }
  }
}
