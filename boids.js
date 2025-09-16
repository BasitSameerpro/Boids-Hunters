class boids {
  constructor(x, y) {
    // Create an instance of the boid at a random poistion in the canvas
    this.position = createVector(x, y);
    // Steer the boid in a random direction
    this.velocity = p5.Vector.random2D();
    // Set the speed of the boid to a random value between 2 and 4
    this.velocity.setMag(random(2.7, 3.7));
    this.maxVelocity = 6; // Maximum speed allowed for boid

    this.acceleration = createVector(0, 0); // Start with no acceleration. Accerleration will be changes based on the 3 rules
    // this.maxAcceleration = 0.5; // Maximum acceleration allowed for boid
    this.color = color(random(100, 255), random(100, 255), random(100, 255)); // Random color for the boid
    this.maxForce = 0.8;
    this.maxSpeed = 16;
  }
  // what will be displayed on the canvas
  show() {
    // Sets the radius/Diameter of the boid
    strokeWeight(1);
    stroke(this.color); // Sets the outline color of the boid stroke(r, g, b)
    // Set the color of the boid at random in the middle

    // Drawing an eclipse type shape
    fill(this.color);
    circle(this.position.x, this.position.y, 10);
    // Draw rectangle

    push();
    translate(this.position.x, this.position.y);
    rotate(this.velocity.heading() - PI / 2); // Negate the angle by 90 degree to point to the other direction
    fill(this.color);
    rect(-2, 8, 2.5, 6.2);
    pop();
  }

  separation(boids) {
    // This function will steer in the diretion of thr average hposition of the local flockmates
    let perception = 25; // How far the boids can see
    let total = 0; // Total number of boids in the perception radius
    let steering = createVector();
    for (let otherBoids of boids) {
      // Calculate the distance between the boids
      let d = dist(
        this.position.x,
        this.position.y,
        otherBoids.position.x,
        otherBoids.position.y
      );
      // Check for the boid to be not me and check if it is in the perception radius
      if (otherBoids != this && d < perception) {
        let diff = p5.Vector.sub(this.position, otherBoids.position); // Calculate the difference between the two boids
        diff.div(d); // Weight the difference by distance (closer boids have a stronger effect) The further the boids the less the effect
        steering.add(diff); // Add the difference to the steering vector
        total++;
      }
    }
    if (total > 0) {
      steering.div(total); // Get the average velocity of the local flockmates
      steering.setMag(this.maxSpeed);
      steering.sub(this.velocity); // The formula for alignment is steering - current velocity of the boid
      steering.limit(this.maxForce);
    }
    return steering;
  }

  align(boids) {
    // This function will steer in the diretion of thr average heading of local flockmates
    let perception = 50; // How far the boids can see
    let total = 0; // Total number of boids in the perception radius
    let steering = createVector(); // Start with no steering
    for (let otherBoids of boids) {
      // Calculate the distance between the boids
      let d = dist(
        this.position.x,
        this.position.y,
        otherBoids.position.x,
        otherBoids.position.y
      );
      // Check for the boid to be not me and check if it is in the perception radius
      if (otherBoids != this && d < perception) {
        steering.add(otherBoids.velocity);
        total++;
      }
    }
    if (total > 0) {
      steering.div(total); // Get the average velocity of the local flockmates
      steering.sub(this.velocity); // The formula for alignment is steering - current velocity of the boid
      steering.setMag(this.maxSpeed);
      steering.limit(this.maxForce);
    }
    return steering;
  }

  cohesion(boids) {
    // This function will steer in the diretion of thr average hposition of the local flockmates
    let perception = 50; // How far the boids can see
    let total = 0; // Total number of boids in the perception radius
    let steering = createVector();
    for (let otherBoids of boids) {
      // Calculate the distance between the boids
      let d = dist(
        this.position.x,
        this.position.y,
        otherBoids.position.x,
        otherBoids.position.y
      );
      // Check for the boid to be not me and check if it is in the perception radius
      if (otherBoids != this && d < perception) {
        steering.add(otherBoids.position);
        total++;
      }
    }
    if (total > 0) {
      steering.div(total); // Get the average velocity of the local flockmates
      steering.sub(this.position);
      steering.sub(this.velocity); // The formula for alignment is steering - current velocity of the boid
      steering.setMag(this.maxSpeed);
      steering.limit(this.maxForce); // Changes from maxFOrce because it was not working too much
    }
    return steering;
  }

  flock(boids) {
    let alignment = this.align(boids);
    let cohesion = this.cohesion(boids);
    let separation = this.separation(boids);

    alignment.mult(alignmentSlider.value());
    cohesion.mult(cohesionSlider.value());
    separation.mult(separationSlider.value());

    this.acceleration.add(alignment);
    this.acceleration.add(cohesion);
    this.acceleration.add(separation);
  }

  update() {
    // Update the position of the boid based on its velocity and acceleration
    this.position.add(this.velocity);
    this.velocity.add(this.acceleration);
    this.velocity.limit(this.maxSpeed); // Limit the speed of the boid
    this.acceleration.mult(0); // Reset acceleration to 0 each frame
  }

  edge() {
    // If the boid goes off the edge it will appear on the other side of the edge
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
