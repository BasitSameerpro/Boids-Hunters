class Boid {
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
    this.isAlive = true;

    // LIFE CYCLE ADDED
    this.age = 0;
    this.energy = 100; // full at birth
    this.maxEnergy = 100;
  }

  show() {
    push();
    translate(this.position.x, this.position.y);

    if (debug) {
      noFill();
      strokeWeight(1);
      stroke(0, 255, 0, 100);
      circle(0, 0, alignmentRangeSlider.value() * 2);
      stroke(0, 0, 255, 100);
      circle(0, 0, cohesionRangeSlider.value() * 2);
      stroke(255, 0, 0, 100);
      circle(0, 0, separationRangeSlider.value() * 2);
    }

    rotate(this.velocity.heading() + PI / 2);

    // ENERGY-BASED FADING (they fade out as they die)
    let alpha = map(this.energy, 0, this.maxEnergy, 30, 255);
    let baseColor = this.scared ? color(255, 200, 0) : this.color;
    let displayColor = color(
      red(baseColor),
      green(baseColor),
      blue(baseColor),
      alpha
    );

    // Body
    fill(displayColor);
    noStroke();
    ellipse(0, 0, 12, 24);

    // Head
    fill(displayColor);
    circle(0, -15, 9);

    // Beak
    fill(255, 140, 0);
    triangle(0, -19, -2.5, -24, 2.5, -24);

    // Eyes (bigger when scared OR dying)
    fill(255);
    let eyeSize = this.scared || this.energy < 40 ? 3.8 : 2.5;
    let pupilSize = this.scared || this.energy < 40 ? 2.2 : 1.5;
    circle(-1.5, -16.5, eyeSize);
    fill(0);
    circle(-1.5, -16.5, pupilSize);

    // Wing flap animation
    let wingFlap = sin(frameCount * (this.scared ? 0.5 : 0.3)) * 0.3;
    fill(displayColor);
    stroke(displayColor);
    strokeWeight(0.5);

    push();
    rotate(wingFlap);
    ellipse(-6, -3, 9, 18);
    pop();
    push();
    rotate(-wingFlap);
    ellipse(6, -3, 9, 18);
    pop();

    // Tail feathers
    noFill();
    stroke(displayColor);
    strokeWeight(1.5);
    for (let i = -2; i <= 2; i++) {
      line(i * 2, 12, i * 3, 21);
    }

    pop();
  }

  flee(hunters) {
    let fleeRadius = boidFleeRangeSlider.value();
    let panicRadius = fleeRadius * 0.5;
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
        if (d < panicRadius) diff.mult(1.3);
        diff.div(d);
        steering.add(diff);
        total++;
      }
    }

    if (total > 0) {
      steering.div(total);
      steering.setMag(this.maxSpeed * (this.scared ? 1.2 : 1));
      steering.sub(this.velocity);
      steering.limit(this.maxForce * 1.4);
    }
    return steering;
  }

  separation(boids) {
    let perception = separationRangeSlider.value();
    let otherBoids =
      boids instanceof QuadTree
        ? boids.query(
            new Rectangle(
              this.position.x,
              this.position.y,
              perception,
              perception
            )
          )
        : boids;

    let total = 0;
    let steering = createVector();
    for (let other of otherBoids) {
      let d = dist(
        this.position.x,
        this.position.y,
        other.position.x,
        other.position.y
      );
      if (other != this && d < perception) {
        let diff = p5.Vector.sub(this.position, other.position);
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
    let perception = alignmentRangeSlider.value();
    let otherBoids =
      boids instanceof QuadTree
        ? boids.query(
            new Rectangle(
              this.position.x,
              this.position.y,
              perception,
              perception
            )
          )
        : boids;

    let total = 0;
    let steering = createVector();
    for (let other of otherBoids) {
      let d = dist(
        this.position.x,
        this.position.y,
        other.position.x,
        other.position.y
      );
      if (other != this && d < perception) {
        steering.add(other.velocity);
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

  cohesion(boids) {
    let perception = cohesionRangeSlider.value();
    let otherBoids =
      boids instanceof QuadTree
        ? boids.query(
            new Rectangle(
              this.position.x,
              this.position.y,
              perception,
              perception
            )
          )
        : boids;

    let total = 0;
    let steering = createVector();
    for (let other of otherBoids) {
      let d = dist(
        this.position.x,
        this.position.y,
        other.position.x,
        other.position.y
      );
      if (other != this && d < perception) {
        steering.add(other.position);
        total++;
      }
    }
    if (total > 0) {
      steering.div(total);
      steering.sub(this.position);
      steering.setMag(this.maxSpeed);
      steering.sub(this.velocity);
      steering.limit(this.maxForce);
    }
    return steering;
  }

  flock(boids, hunters, obstacles) {
    let alignment = this.align(boids);
    let cohesion = this.cohesion(boids);
    let separation = this.separation(boids);
    let fear = this.flee(hunters);
    let avoidance = this.avoid(obstacles);

    alignment.mult(alignmentSlider.value());
    cohesion.mult(cohesionSlider.value());
    separation.mult(separationSlider.value());
    fear.mult(fearSlider.value());
    avoidance.mult(5);

    this.acceleration.add(alignment);
    this.acceleration.add(cohesion);
    this.acceleration.add(separation);
    this.acceleration.add(fear);
    this.acceleration.add(avoidance);
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
      if (d < obstacle.radius + 20) {
        let diff = p5.Vector.sub(this.position, obstacle.position);
        diff.div(d);
        steering.add(diff);
      }
    }
    return steering;
  }

  reproduce(boids) {
    let perception = cohesionRangeSlider.value();
    let otherBoids =
      boids instanceof QuadTree
        ? boids.query(
            new Rectangle(
              this.position.x,
              this.position.y,
              perception,
              perception
            )
          )
        : boids;

    // Only reproduce if healthy and in a group
    if (otherBoids.length > 5 && this.energy > 65 && random(1) < 0.0006) {
      let baby = new Boid(
        this.position.x + random(-15, 15),
        this.position.y + random(-15, 15)
      );
      baby.energy = 80;
      this.energy -= 35; // Mother loses energy when giving birth
      return baby;
    }
    return null;
  }

  update() {
    this.position.add(this.velocity);
    this.velocity.add(this.acceleration);
    this.velocity.limit(this.maxSpeed);
    this.acceleration.mult(0);

    // LIFE CYCLE: age & energy drain
    this.age++;
    this.energy -= 0.09; // tweak this for faster/slower death

    // Natural death
    if (this.energy <= 0 || this.age > 2400) {
      // ~40 seconds max
      this.isAlive = false;
    }
  }

  edge() {
    if (this.position.x > width) this.position.x = 0;
    else if (this.position.x < 0) this.position.x = width;
    if (this.position.y > height) this.position.y = 0;
    else if (this.position.y < 0) this.position.y = height;
  }
}
