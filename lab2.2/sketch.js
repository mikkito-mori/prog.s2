let hamster;
let floor;
let canyonsAmount = 4;
let seedsAmount = 4;
let crowsAmount = 5;
let platformsAmount = 5;
let canyons = [];
let seeds = [];
let crows = [];
let platforms = [];
let score = 0;
let hamsterDeath = new Audio("./hamsterDeath.mp3");
let crowDeath = new Audio("./crowDeath.mp3");
let seedsEating = new Audio("./seeds.mp3");
let backmus = new Audio("./background_music.mp3");
let restartButton;
let gameOver = false;

let cameraOffset = 0;
const cameraThreshold = 300;
const levelWidth = 2500;

let clouds = [];
let grasses = [];
let sun = {
    x: 100,
    y: 100,
    size: 100
};

function setup() {
    createCanvas(1500, innerHeight);
    
    for (let i = 0; i < 10; i++) {
        clouds.push({
            x: random(levelWidth),
            y: random(100, 300),
            width: random(100, 200),
            height: random(50, 80),
            speed: random(0.2, 0.8)
        });
    }
    
    for (let i = 0; i < 50; i++) {
        grasses.push({
            x: random(levelWidth),
            height: random(20, 60),
            color: color(10, 100 + random(50), 10 + random(30))
        });
    }
    
    restartButton = createButton('🔄 Перезапустить');
    restartButton.position(width/2 - 100, height/2 + 100);
    restartButton.size(200, 50);
    restartButton.style('font-size', '20px');
    restartButton.style('background', '#ff5555');
    restartButton.style('color', 'white');
    restartButton.style('border', 'none');
    restartButton.style('border-radius', '10px');
    restartButton.style('cursor', 'pointer');
    restartButton.style('display', 'none');
    restartButton.mousePressed(restartGame);
    
    let soundControls = createDiv('');
    soundControls.id('soundControls');
    soundControls.style('position', 'absolute');
    soundControls.style('top', '10px');
    soundControls.style('right', '10px');
    soundControls.style('display', 'flex');
    soundControls.style('align-items', 'center');
    soundControls.style('gap', '10px');
    soundControls.style('background', 'rgba(255, 255, 255, 0.7)');
    soundControls.style('padding', '5px 10px');
    soundControls.style('border-radius', '20px');
    soundControls.style('box-shadow', '0 2px 5px rgba(0,0,0,0.2)');
    
    let muteButton = createButton('🔊');
    muteButton.id('muteButton');
    muteButton.style('border', 'none');
    muteButton.style('background', 'none');
    muteButton.style('font-size', '20px');
    muteButton.style('cursor', 'pointer');
    muteButton.parent(soundControls);
    
    let volumeSlider = createSlider(0, 1, 1, 0.1);
    volumeSlider.id('volumeSlider');
    volumeSlider.style('width', '100px');
    volumeSlider.style('height', '8px');
    volumeSlider.style('background', '#ddd');
    volumeSlider.style('border-radius', '4px');
    volumeSlider.style('outline', 'none');
    volumeSlider.style('-webkit-appearance', 'none');
    volumeSlider.style('cursor', 'pointer');
    volumeSlider.parent(soundControls);
    
    volumeSlider.elt.style.setProperty('--thumb-color', '#4CAF50');
    volumeSlider.elt.style.setProperty('--track-color', '#ddd');
    volumeSlider.elt.style.setProperty('--thumb-hover-color', '#45a049');
    
    let sliderStyle = document.createElement('style');
    sliderStyle.innerHTML = `
        #volumeSlider {
            -webkit-appearance: none;
            height: 8px;
            background: var(--track-color);
            border-radius: 4px;
            outline: none;
            opacity: 0.7;
            transition: opacity 0.2s;
        }
        #volumeSlider:hover {
            opacity: 1;
        }
        #volumeSlider::-webkit-slider-thumb {
            -webkit-appearance: none;
            width: 16px;
            height: 16px;
            border-radius: 50%;
            background: var(--thumb-color);
            cursor: pointer;
            transition: background 0.2s;
        }
        #volumeSlider::-webkit-slider-thumb:hover {
            background: var(--thumb-hover-color);
        }
        #volumeSlider::-moz-range-thumb {
            width: 16px;
            height: 16px;
            border-radius: 50%;
            background: var(--thumb-color);
            cursor: pointer;
            transition: background 0.2s;
        }
        #volumeSlider::-moz-range-thumb:hover {
            background: var(--thumb-hover-color);
        }
    `;
    document.head.appendChild(sliderStyle);
    
    volumeSlider.input(() => {
        let volume = volumeSlider.value();
        backmus.volume = volume;
        hamsterDeath.volume = volume;
        crowDeath.volume = volume;
        seedsEating.volume = volume;
        
        if (volume > 0.5) {
            muteButton.html('🔊');
        } else if (volume > 0) {
            muteButton.html('🔉');
        } else {
            muteButton.html('🔇');
        }
    });
    
    muteButton.mousePressed(() => {
        if (backmus.volume > 0) {
            backmus.volume = 0;
            crowDeath.volume = 0;
            seedsEating.volume = 0;
            hamsterDeath.volume = 0;
            volumeSlider.value(0);
            muteButton.html('🔇');
        } else {
            backmus.volume = 1;
            crowDeath.volume = 1;
            seedsEating.volume = 1;
            hamsterDeath.volume = 1;
            volumeSlider.value(1);
            muteButton.html('🔊');
        }
    });

    initGame();
}

function initGame() {
    gameOver = false;
    score = 0;
    canyons = [];
    seeds = [];
    crows = [];
    platforms = [];
    cameraOffset = 0;
    
    floor = {
        x: 0,
        height: 200,
        color: color(10, 100, 10),
        draw: function () {
            for (let x = -width; x < levelWidth + width; x += width) {
                fill(this.color);
                rect(x, innerHeight - this.height, width, this.height);
            }
        }
    };

    let canyonPositions = [];
    let minCanyonGap = 350; 
    let attempts = 0;
    const maxAttempts = 100;

    for (let i = 0; i < canyonsAmount; i++) {
        let validPosition = false;
        let newCanyonX, newCanyonWidth;
        
        while (!validPosition && attempts < maxAttempts) {
            attempts++;
            newCanyonX = 200 + random(levelWidth - 400);
            newCanyonWidth = 100 + random(100);
            
            validPosition = true;
            for (let pos of canyonPositions) {
                if (abs(newCanyonX - pos.x) < minCanyonGap + pos.width/2 + newCanyonWidth/2) {
                    validPosition = false;
                    break;
                }
            }
        }
        
        if (validPosition) {
            canyonPositions.push({
                x: newCanyonX,
                width: newCanyonWidth
            });
            
            canyons.push({
                x: newCanyonX,
                y: innerHeight - floor.height,
                width: newCanyonWidth,
                draw: function () {
                    fill(100);
                    rect(this.x, this.y, this.width, floor.height);
                }
            });
        }
        attempts = 0;
    }

    for (let i = 0; i < seedsAmount; i++) {
        let validPosition = false;
        let newSeedX, newSeedY;
        
        while (!validPosition && attempts < maxAttempts) {
            attempts++;
            newSeedX = 200 + random(levelWidth - 400);
            newSeedY = innerHeight - floor.height - 50 - random(100);
            
            validPosition = true;
            for (let canyon of canyons) {
                if (newSeedX > canyon.x && newSeedX < canyon.x + canyon.width) {
                    validPosition = false;
                    break;
                }
            }
        }
        
        if (validPosition) {
            seeds.push({
                x: newSeedX,
                y: newSeedY,
                size: 20 + random(20),
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
        attempts = 0;
    }

    for (let i = 0; i < crowsAmount; i++) {
        let validPosition = false;
        let crowX, crowY;
        
        while (!validPosition && attempts < maxAttempts) {
            attempts++;
            crowX = 200 + random(levelWidth - 400);
            crowY = 490;
            
            validPosition = true;
            for (let canyon of canyons) {
                if (crowX > canyon.x && crowX < canyon.x + canyon.width) {
                    validPosition = false;
                    break;
                }
            }
        }
        
        if (validPosition) {
            crows.push({
                x: crowX,
                y: crowY,
                l: crowX - 100 - random(100),
                r: crowX + 100 + random(100),
                direction: random() > 0.5 ? 1 : -1,
                random: 1 + random(3),
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
                        this.direction = 1;
                    } else if (this.x >= this.r) {
                        this.direction = -1;
                    }
                }
            });
        }
        attempts = 0;
    }

    for (let i = 0; i < platformsAmount; i++) {
        platforms.push({
            x: 350 + i * 350,
            y: 200 + random(200),
            width: 80 + random(100),
            height: 20,
            color: color(150, 100, 50),
            draw: function() {
                fill(this.color);
                rect(this.x, height - this.height - this.y, this.width, this.height);
                
                fill(120, 80, 40);
                for (let j = 0; j < 5; j++) {
                    rect(this.x + j * (this.width/5), 
                         height - this.height - this.y, 
                         this.width/5 - 2, 
                         this.height/2);
                }
            },
            contains: function(x, y) {
                return x >= this.x && 
                       x <= this.x + this.width && 
                       y >= height - this.height - this.y && 
                       y <= height - this.y;
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
        onPlatform: false,

        draw: function () {
            if (this.isDead) return;
            
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
                if (this.y > height + 100) {
                    gameOver = true;
                    restartButton.style('display', 'block');
                }
            } else {
                this.checkPlatforms();
                
                if (!this.onPlatform && this.y + this.height > height - floor) {
                    this.y = height - floor - this.height;
                    this.isGrounded = true;
                    this.speedGravity = 0;
                }
            }
        },

        checkPlatforms: function() {
            this.onPlatform = false;
            let fallingFromPlatform = true;
            
            for (let platform of platforms) {
                const platformTop = height - platform.height - platform.y;
                const platformBottom = platformTop + platform.height;
                const platformLeft = platform.x;
                const platformRight = platform.x + platform.width;
                
                if (this.x + this.width/2 > platformLeft && 
                    this.x - this.width/2 < platformRight) {
                    
                    if (this.y + this.height >= platformTop && 
                        this.y + this.height <= platformBottom &&
                        this.speedGravity >= 0) {
                        
                        this.y = platformTop - this.height;
                        this.speedGravity = 0;
                        this.isGrounded = true;
                        this.onPlatform = true;
                    }
                    
                    if (this.y + this.height >= platformTop && 
                        this.y <= platformBottom) {
                        fallingFromPlatform = false;
                    }
                }
            }
            
            if (!this.onPlatform && this.isGrounded && fallingFromPlatform) {
                this.isGrounded = false;
            }
        },

        jump: function () {
            if (this.isGrounded) {
                this.speedGravity = -20;
                this.isGrounded = false;
                this.onPlatform = false;
            }
        },

        moveLeft: function () {
            this.x -= 5;
            if (this.onPlatform) {
                let onAnyPlatform = false;
                for (let platform of platforms) {
                    const platformTop = height - platform.height - platform.y;
                    if (this.x > platform.x && 
                        this.x < platform.x + platform.width &&
                        this.y + this.height >= platformTop && 
                        this.y + this.height <= platformTop + platform.height) {
                        onAnyPlatform = true;
                        break;
                    }
                }
                if (!onAnyPlatform) {
                    this.onPlatform = false;
                    this.isGrounded = false;
                }
            }
            
            if (this.x < cameraOffset + cameraThreshold) {
                cameraOffset = this.x - cameraThreshold;
                if (cameraOffset < 0) cameraOffset = 0;
            }
        },

        moveRight: function () {
            this.x += 5;
            if (this.onPlatform) {
                let onAnyPlatform = false;
                for (let platform of platforms) {
                    const platformTop = height - platform.height - platform.y;
                    if (this.x > platform.x && 
                        this.x < platform.x + platform.width &&
                        this.y + this.height >= platformTop && 
                        this.y + this.height <= platformTop + platform.height) {
                        onAnyPlatform = true;
                        break;
                    }
                }
                if (!onAnyPlatform) {
                    this.onPlatform = false;
                    this.isGrounded = false;
                }
            }
            
            if (this.x > cameraOffset + width - cameraThreshold) {
                cameraOffset = this.x - (width - cameraThreshold);
                if (cameraOffset > levelWidth - width) cameraOffset = levelWidth - width;
            }
        },

        movement: function () {
            if (this.isDead) return;
            if (this.x < -10) this.x = levelWidth + 5;
            if (this.x > levelWidth + 10) this.x = -5;
            if (this.isGrounded && keyIsDown(87)) this.jump();
            if (keyIsDown(68)) this.moveRight();
            if (keyIsDown(65)) this.moveLeft();
        },

        checkCanyon: function () {
            if (this.isDead) return;
            
            for (let i = 0; i < canyons.length; i++) {
                if (
                    this.y + this.height >= height - floor.height &&
                    this.x - this.width/2 > canyons[i].x &&
                    this.x + this.width/2 < canyons[i].x + canyons[i].width
                ) {
                    this.die();
                    break;
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
                        score += 10;
                    } else {
                        this.die();
                    }
                    break;
                }
            }
        },
        
        die: function() {
            this.isDead = true;
            this.speedGravity = 3;
            hamsterDeath.play();
        }
    };
}

function restartGame() {
    restartButton.style('display', 'none');
    initGame();
}

function drawScore() {
    fill(255, 255, 255, 180); 
    stroke(0, 100, 0); 
    strokeWeight(2);
    rect(10, 10, 150, 40, 20); 
    
    fill(0, 100, 0); 
    noStroke();
    textSize(18);
    textAlign(LEFT, CENTER);
    text("Счёт:", 25, 30);
    
    fill(255, 255, 200); 
    stroke(0, 100, 0);
    rect(80, 15, 70, 30, 10); 
    
    fill(0); 
    textSize(20);
    textAlign(CENTER, CENTER);
    text(score, 115, 30);
    
    fill(210, 180, 140);
    noStroke();
    ellipse(160, 30, 20, 15);
    fill(160, 130, 100);
    arc(160, 30, 20, 15, -PI/4, PI/4);
}

function drawGameOver() {
    fill(255, 0, 0, 200);
    textSize(60);
    textAlign(CENTER, CENTER);
    text("GAME OVER", width/2, height/2 - 50);
}

function drawBackground() {

    let skyColor1 = color(135, 206, 235); 
    let skyColor2 = color(65, 105, 225);
    for (let y = 0; y < height; y++) {
        let inter = map(y, 0, height, 0, 1);
        let c = lerpColor(skyColor1, skyColor2, inter);
        stroke(c);
        line(0, y, width, y);
    }
    
    
    fill(255, 255, 0);
    noStroke();
    ellipse(sun.x - cameraOffset * 0.2, sun.y, sun.size, sun.size);
    
    fill(255, 255, 255, 200);
    noStroke();
    for (let cloud of clouds) {
        let cloudX = cloud.x - cameraOffset * 0.5;
        if (cloudX + cloud.width > 0 && cloudX < width) {
            ellipse(cloudX, cloud.y, cloud.width, cloud.height);
            ellipse(cloudX + cloud.width/4, cloud.y - cloud.height/2, cloud.width/2, cloud.height);
            ellipse(cloudX - cloud.width/4, cloud.y, cloud.width/2, cloud.height);
        }
        cloud.x += cloud.speed;
        if (cloud.x > levelWidth + cloud.width) {
            cloud.x = -cloud.width;
        }
    }
    
    fill(100, 80, 60);
    beginShape();
    vertex(0 - cameraOffset * 0.3, height - floor.height);
    for (let x = 0; x < levelWidth + 500; x += 100) {
        let y = height - floor.height - 150 - noise(x * 0.01) * 200;
        vertex(x - cameraOffset * 0.3, y);
    }
    vertex(levelWidth + 500 - cameraOffset * 0.3, height - floor.height);
    endShape(CLOSE);
    
    for (let grass of grasses) {
        let grassX = grass.x - cameraOffset * 0.7;
        if (grassX > -50 && grassX < width + 50) {
            fill(grass.color);
            noStroke();
            beginShape();
            vertex(grassX, height - floor.height);
            vertex(grassX + 5, height - floor.height - grass.height * 0.7);
            vertex(grassX + 10, height - floor.height - grass.height);
            vertex(grassX + 5, height - floor.height - grass.height * 0.8);
            vertex(grassX, height - floor.height - grass.height * 0.9);
            endShape();
        }
    }
}

function draw() {
    drawBackground();
    
    push();
    translate(-cameraOffset, 0);
    
    floor.draw();
    
    for (let platform of platforms) {
        platform.draw();
    }

    for (let canyon of canyons) {
        canyon.draw();
    }

    for (let seed of seeds) {
        seed.draw();
    }

    for (let crow of crows) {
        crow.move();
        crow.draw();
    }

    if (!gameOver) {
        hamster.gravity(floor.height);
        hamster.movement();
        hamster.checkCanyon();
        hamster.checkSeeds();
        hamster.checkCrows();
        hamster.draw();
    }
    
    pop();
    
    drawScore();
    
    if (gameOver) {
        drawGameOver();
    }

    backmus.play();
}