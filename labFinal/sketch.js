let hamster;
let floor;
let canyonsAmount = 3;
let seedsAmount = 10;
let crowsAmount = 2;
let canyons = [];
let seeds = [];
let crows = [];
let score = 0;
let hamsterDeath = new Audio("./hamsterDeath.mp3");
let crowDeath = new Audio("./crowDeath.mp3");
let seedsEating = new Audio("./seeds.mp3");

function setup() {
    createCanvas(1500, innerHeight);

    floor = {
        x: 0,
        height: 200,
        color: color(10, 100, 10),
        draw: function () {
            fill(this.color);
            rect(this.x, innerHeight - this.height, width, this.height);
        }
    };

    for (let i = 0; i < canyonsAmount; i++) {
        canyons.push({
            x: 250 + i * 400,
            y: innerHeight - floor.height,
            width: 120,
            draw: function () {
                fill(100);
                rect(this.x, this.y, this.width, floor.height);
            }
        });
    }

    for (let i = 0; i < seedsAmount; i++) {
        seeds.push({
            x: 350 + i * 300,
            y: innerHeight - floor.height - 50,
            size: 30,
            random: Math.floor(Math.random() * 50),
            collected: false,

            draw: function () {
                if (this.collected) return;

                fill(210, 180, 140);
                noStroke();
                ellipse(this.x, this.y, this.size * 1.2, this.size);

                fill(160, 130, 100);
                arc(this.x, this.y, this.size * 1.2, this.size, -PI / 4, PI / 4);
            }
        });
    }

    for (let i = 0; i < crowsAmount; i++) {
        crows.push({
            x: 300 + i * 200,
            y: innerHeight - floor.height - 50,
            l: 400 + i * 200,
            r: 700 + i * 200,
            direction: 1,
            random: 0,
            isDead: false,

            draw: function () {
                if (this.isDead) return;

                fill(0);
                ellipse(this.x, this.y, 25, 20);

                ellipse(this.x, this.y - 15, 16, 16);

                fill(255, 204, 0);
                triangle(this.x + 3, this.y - 15, this.x + 10, this.y - 10, this.x + 3, this.y - 10);

                fill(255);
                ellipse(this.x + 4, this.y - 17, 4, 4);
                fill(0);
                ellipse(this.x + 5, this.y - 17, 2, 2);

                fill(0);
                arc(this.x - 12, this.y, 20, 15, 0, PI);
                arc(this.x + 12, this.y, 20, 15, 0, PI);

                stroke(0);
                line(this.x - 5, this.y + 10, this.x - 5, this.y + 17);
                line(this.x + 5, this.y + 10, this.x + 5, this.y + 17);
                noStroke();

                fill(0);
                triangle(this.x, this.y, this.x - 10, this.y + 5, this.x + 10, this.y + 5);
            },
            move: function () {
                if (this.isDead) return;
                this.x += this.random * this.direction;
                if (this.x <= this.l) {
                    this.x += this.l - this.x;
                    this.direction *= -1;
                } else if (this.x >= this.r) {
                    this.x -= this.x - this.r;
                    this.direction *= -1;
                }
            }
        });
    }

    hamster = {
        x: 100,
        y: innerHeight - floor.height,
        width: 40,
        height: 60,
        speedGravity: -5,
        color: "#b92d2d",
        isGrounded: false,
        isDead: false,

        draw: function () {
            fill(230, 200, 180);
            noStroke();
            ellipse(this.x, this.y + 20, 90, 80);

            fill(230, 200, 180);
            ellipse(this.x, this.y - 40, 70, 60);

            fill(255, 200, 220);
            ellipse(this.x - 20, this.y - 65, 20, 20);
            ellipse(this.x + 20, this.y - 65, 20, 20);

            fill(255, 200, 220);
            ellipse(this.x - 15, this.y - 30, 25, 20);
            ellipse(this.x + 15, this.y - 30, 25, 20);

            fill(0);
            ellipse(this.x - 10, this.y - 45, 8, 10);
            ellipse(this.x + 10, this.y - 45, 8, 10);

            fill(255, 150, 170);
            triangle(this.x, this.y - 35, this.x - 5, this.y - 25, this.x + 5, this.y - 25);

            stroke(100);
            strokeWeight(2);
            line(this.x + 5, this.y - 30, this.x + 35, this.y - 35);
            line(this.x + 5, this.y - 25, this.x + 35, this.y - 25);
            line(this.x + 5, this.y - 20, this.x + 35, this.y - 15);
            line(this.x - 5, this.y - 30, this.x - 35, this.y - 35);
            line(this.x - 5, this.y - 25, this.x - 35, this.y - 25);
            line(this.x - 5, this.y - 20, this.x - 35, this.y - 15);

            fill(255, 240, 230);
            ellipse(this.x, this.y + 25, 50, 45);
        },

        gravity: function (floor) {
            if (this.speedGravity < 15) {
                this.speedGravity++;
            }
            this.y += this.speedGravity;
            if (this.isDead) {
                if (this.y > height) {
                    this.y = floor;
                    this.x = 100;
                    this.isDead = false;
                }
            } else if (this.y + this.height > height - floor) {
                this.y = height - floor - this.height;
                this.isGrounded = true;
            } else {
                this.isGrounded = false;
            }
        },

        jump: function () {
            if (this.isGrounded) {
                this.speedGravity = -20;
                this.isGrounded = false;
            }
        },

        moveLeft: function () {
            this.x -= 5;
        },

        moveRight: function () {
            this.x += 5;
        },

        movement: function () {
            if (this.isDead) return;
            if (this.x < -10) this.x = innerWidth + 5;
            if (this.x > innerWidth + 10) this.x = -5;
            if (this.isGrounded && keyIsDown(87)) this.jump();
            if (keyIsDown(68)) this.moveRight();
            if (keyIsDown(65)) this.moveLeft();
        },

        checkCanyon: function () {
            for (let i = 0; i < canyons.length; i++) {
                if (
                    this.y + this.height >= height - floor.height &&
                    this.x - this.width > canyons[i].x &&
                    this.x + this.width < canyons[i].x + canyons[i].width
                ) {
                    this.isGrounded = false;
                    this.isDead = true;
                    this.speedGravity = 3;
                }
            }
        },

        checkSeeds: function () {
            for (let seed of seeds) {
                if (!seed.collected) {
                    let seedX = seed.x + seed.random;
                    let seedY = seed.y;
                    let d = dist(this.x + this.width / 2, this.y + this.height / 2, seedX, seedY);

                    if (d < (seed.size + this.width) / 2) {
                        seed.collected = true;
                        score += 5;
                        seedsEating.play();
                    }
                }
            }
        },

        checkCrows: function () {
            if (this.isDead) return;

            for (let crow of crows) {
                if (crow.isDead) continue;

                if (this.x < crow.x + 75 && this.x + this.width > crow.x && this.y < crow.y + 70 && this.y + this.height > crow.y) {
                    if (this.speedGravity > 0 && this.y + this.height <= crow.y + 20) {
                        crow.isDead = true;
                        this.speedGravity = -10;
                        crowDeath.play();
                    } else {
                        this.isDead = true;
                        this.speedGravity = 3;
                        hamsterDeath.play();
                    }
                    break;
                }
            }
        }
    };
}

function drawScore() {
    fill(0);
    noStroke();
    textSize(25);
    textAlign(LEFT, TOP);
    text("Счёт: " + score, 15, 15);
}

function draw() {
    background("#4dd5ef");
    floor.draw();

    for (let canyon of canyons) {
        canyon.draw();
    }

    for (let seed of seeds) {
        seed.draw();
    }

    for (let crow of crows) {
        crow.random = Math.floor(Math.random() * (7 - 1)) + 1;
        crow.move();
        crow.draw();
    }

    hamster.gravity(floor.height);
    hamster.movement();
    hamster.checkCanyon();
    hamster.checkSeeds();
    hamster.checkCrows();
    hamster.draw();

    drawScore();
}