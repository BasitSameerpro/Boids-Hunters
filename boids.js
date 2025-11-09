class boids {
  constructor(x, y) {
    this.position = createVector(x, y);
    this.velocity = p5.Vector.random2D();

    if (windowWidth < 600) {
      this.velocity.setMag(random(1, 2));
      this.maxForce = 0.3;
      this.maxSpeed = 4;
    } else if (windowWidth < 1100) {
      this.velocity.setMag(random(1.5, 3));
      this.maxForce = 0.4;
      this.maxSpeed = 5;
    } else {
      this.velocity.setMag(random(2, 4));
      this.maxForce = 0.5;
      this.maxSpeed = 6;
    }
    this.maxVelocity = 6;
    this.acceleration = createVector(0, 0);
    this.color = color(random(100, 255), random(100, 255), random(100, 255));
    this.scared = false;
  }

  show() {
    push();
    translate(this.position.x, this.position.y);
    rotate(this.velocity.heading() + PI / 2);

    let displayColor = this.scared ? color(255, 200, 0) : this.color;

    fill(displayColor || color(60, 80, 120));
    noStroke();
    ellipse(0, 0, 12, 24);

    fill(displayColor || color(70, 90, 130));
    circle(0, -15, 9);

    fill(255, 140, 0);
    triangle(0, -19, -2.5, -24, 2.5, -24);

    fill(255);
    if (this.scared) {
      circle(-1.5, -16.5, 3.5);
      fill(0);
      circle(-1.5, -16.5, 2);
    } else {
      circle(-1.5, -16.5, 2.5);
      fill(0);
      circle(-1.5, -16.5, 1.5);
    }

    let wingFlap = sin(frameCount * (this.scared ? 0.5 : 0.3)) * 0.3;
    fill(displayColor || color(50, 70, 110));
    stroke(displayColor || color(40, 60, 100));
    strokeWeight(0.5);

    push();
    rotate(wingFlap);
    ellipse(-6, -3, 9, 18);
    pop();

    push();
    rotate(-wingFlap);
    ellipse(6, -3, 9, 18);
    pop();

    noFill();
    stroke(displayColor || color(40, 60, 100));
    strokeWeight(1.5);
    for (let i = -2; i <= 2; i++) {
      line(i * 2, 12, i * 3, 21);
    }

    pop();
  }

  flee(hunters) {
    let fleeRadius = boidFleeRangeSlider.value(); // Use slider value
    let panicRadius = fleeRadius * 0.5; // Panic zone is half of flee radius
    let steering = createVector();
    let total = 0;

    this.scared = false;

    for (let hunter of hunters) {
      let d = dist(
        this.position.x,
        this.position.y,
        hunter.position.x,
        hunter.position.y
      );

      if (d < fleeRadius) {
        this.scared = true;
        let diff = p5.Vector.sub(this.position, hunter.position);

        if (d < panicRadius) {
          diff.mult(1.3); // Slightly increased panic multiplier
        }

        diff.div(d);
        steering.add(diff);
        total++;
      }
    }

    if (total > 0) {
      steering.div(total);
      steering.setMag(this.maxSpeed * (this.scared ? 1.2 : 1)); // Slightly increased speed boost
      steering.sub(this.velocity);
      steering.limit(this.maxForce * 1.4); // Slightly increased force limit
    }

    return steering;
  }

  separation(boids) {
    let perception = separationRangeSlider.value(); // Use slider value
    let total = 0;
    let steering = createVector();
    for (let otherBoids of boids) {
      let d = dist(
        this.position.x,
        this.position.y,
        otherBoids.position.x,
        otherBoids.position.y
      );
      if (otherBoids != this && d < perception) {
        let diff = p5.Vector.sub(this.position, otherBoids.position);
        diff.div(d);
        steering.add(diff);
        total++;
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

  align(boids) {
    let perception = alignmentRangeSlider.value(); // Use slider value
    let total = 0;
    let steering = createVector();
    for (let otherBoids of boids) {
      let d = dist(
        this.position.x,
        this.position.y,
        otherBoids.position.x,
        otherBoids.position.y
      );
      if (otherBoids != this && d < perception) {
        steering.add(otherBoids.velocity);
        total++;
      }
    }
    if (total > 0) {
      steering.div(total);
      steering.sub(this.velocity);
      steering.setMag(this.maxSpeed);
      steering.limit(this.maxForce);
    }
    return steering;
  }

  cohesion(boids) {
    let perception = cohesionRangeSlider.value(); // Use slider value
    let total = 0;
    let steering = createVector();
    for (let otherBoids of boids) {
      let d = dist(
        this.position.x,
        this.position.y,
        otherBoids.position.x,
        otherBoids.position.y
      );
      if (otherBoids != this && d < perception) {
        steering.add(otherBoids.position);
        total++;
      }
    }
    if (total > 0) {
      steering.div(total);
      steering.sub(this.position);
      steering.sub(this.velocity);
      steering.setMag(this.maxSpeed);
      steering.limit(this.maxForce);
    }
    return steering;
  }

  flock(boids, hunters) {
    let alignment = this.align(boids);
    let cohesion = this.cohesion(boids);
    let separation = this.separation(boids);
    let fear = this.flee(hunters);

    alignment.mult(alignmentSlider.value());
    cohesion.mult(cohesionSlider.value());
    separation.mult(separationSlider.value());
    fear.mult(fearSlider.value()); // Use fear slider value

    this.acceleration.add(alignment);
    this.acceleration.add(cohesion);
    this.acceleration.add(separation);
    this.acceleration.add(fear);
  }

  update() {
    this.position.add(this.velocity);
    this.velocity.add(this.acceleration);
    this.velocity.limit(this.maxSpeed);
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
