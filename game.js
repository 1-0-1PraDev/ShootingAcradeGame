const canvas = document.querySelector("canvas");
const ctx = canvas.getContext('2d');
const scoreEle = document.querySelector('#scoreEle');
const gameOverBx = document.querySelector('.gameOverBx');
const modelGameScore = document.querySelector('.gameScore');
const modelRestartBtn = document.querySelector('.restartBtn');
const startBtn = document.querySelector('.startBtn');
const startGameBx = document.querySelector('.startGameBx');
const volumeUpBtn = document.querySelector("#volumeUpBtn");
const volumeOffBtn = document.querySelector('#volumeOffBtn');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;


let projectiles = [];
let enemies = [];
let particles = [];
let powerups = [];
let backgroundParticles = [];
let frames = 0;
let player;
let score = 0;
let animationId;
let intervalId;
let game = {
    active: false
}


// const powerup = new PowerUp({ 
//     position : {
//         x: 100,
//         y: 100
//     }
// });

// Reinitialize the game
function init() {
    const x = canvas.width / 2;
    const y = canvas.height / 2;
    player = new Player(x, y, 20, '#fff');
    enemies = [];
    projectiles = [];
    particles = [];
    powerups = [];
    backgroundParticles = [];

    game = {
        active: true
    }

    const spacing = 30;
    for (let x = 0; x < canvas.width; x += spacing) {
        for (let y = 0; y < canvas.height; y += spacing) {
            backgroundParticles.push(
                new BackgroundParticle({
                    position: {
                        x: x,
                        y: y
                    },
                    radius: 2,
                    color: 'blue'
                })
            );
        }
    }
    score = 0;
}

function spawnEnemies() {
    intervalId = setInterval(() => {
        const radius = Math.random() * (30 - 4 + 1) + 4;
        let x;
        let y;
        // Making enmey spawns 
        if (Math.random() < 0.5) {
            x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius;
            y = Math.random() * canvas.height;
        } else {
            x = Math.random() * canvas.width;
            y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius;
        }

        const color = `hsl(${Math.random() * 360}, 50%, 50%)`;
        const angle = Math.atan2(canvas.height / 2 - y, canvas.width / 2 - x);
        const velocity = {
            x: Math.cos(angle),
            y: Math.sin(angle)
        }

        enemies.push(new Enemies(x, y, radius, color, velocity));
    }, 1000);
}

function spawnPowerUps() {
    spawnPowerUpId = setInterval(() => {
        powerups.push(new PowerUp({
            position: {
                x: -30,
                y: Math.random() * canvas.height
            },
            velocity: {
                x: Math.random() + 1,
                y: 0
            }
        }))
    }, 6000);
}

function createScoreLabels({ position, score }) {
    const scoreLabel = document.createElement('label');
    scoreLabel.innerHTML = score;
    scoreLabel.style.color = 'white';
    scoreLabel.style.position = 'absolute';
    scoreLabel.style.top = position.y + 'px';
    scoreLabel.style.left = position.x + 'px';
    scoreLabel.style.pointerEvents = 'none';    // to prevent the zoom in inside smartphone devices
    scoreLabel.style.userSelect = 'none';   // make the label unselectable
    document.body.appendChild(scoreLabel);

    gsap.to(scoreLabel, {
        opacity: 0,
        y: -30,
        duration: 0.9,
        onComplete: () => { // whenever animation completes runs this code
            scoreLabel.parentNode.removeChild(scoreLabel);
        }
    });
}



// create instance of Projectile 
// const projectile = new Projectile(
//     canvas.width / 2,
//     canvas.height / 2,
//     5,
//     '#fff',
//     {
//         x: 1,
//         y: 1
//     }
// );

// Create a animation loop
const animate = () => {
    animationId = requestAnimationFrame(animate);

    // Clear the canvas before drawing anything
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Update the player
    player.update();

    // spawn background particles
    backgroundParticles.forEach(backgroundParticle => {
        backgroundParticle.draw();

        const dist = Math.hypot(player.x - backgroundParticle.position.x, player.y - backgroundParticle.position.y);
        if (dist < 100) {
            backgroundParticle.alpha = 0;
            if (dist > 70) {
                backgroundParticle.alpha = 0.5;
            }
        } else if (dist > 100) {
            backgroundParticle.alpha = 0.1;
        }
    });

    // Spawn a powerup
    for (let powerupInd = powerups.length - 1; powerupInd >= 0; powerupInd--) {
        const powerup = powerups[powerupInd];

        // remove the powerup if the enemy goes off the screen
        if (powerup.position.x > canvas.width) {
            powerups.splice(powerupInd, 1);
        } else {
            powerup.update();
        }

        // when user collapse with powerup or user engalfs powerup
        const dist = Math.hypot(player.x - powerup.position.x, player.y - powerup.position.y);

        // Gain powerup 
        if (dist < powerup.image.height / 2 + player.radius) {
            powerUpAudio.play();

            // remove the powerup once user hits it
            powerups.splice(powerupInd, 1);
            player.powerUp = 'MachineGun';
            player.color = 'cyan';

            // remove powerup after some time
            setTimeout(() => {
                player.powerUp = null;
                player.color = '#fff';
            }, 8000);
        }
    }

    // Machine Gun powerup Code
    if (player.powerUp === 'MachineGun') {
        const angle = Math.atan2(
            mouse.position.x - player.y,
            mouse.position.y - player.x
        );

        const velocity = {
            x: Math.cos(angle),
            y: Math.sin(angle)
        }

        // add projectile after every 2nd frame
        if (frames % 2 === 0) {
            projectiles.push(new Projectile(
                player.x, player.y, 5, 'cyan', velocity
            ));
        }

        if (frames % 8 === 0) {
            shootAudio.play();
        }
    }

    // Render collision particles
    particles.forEach((particle, particleInd) => {
        // if alpha value is equal to zero the particles reappears hence using below condition
        if (particle.alpha <= 0) {
            setTimeout(() => {
                particles.splice(particleInd, 1);
            }, 0);
        } else {
            particle.update();
        }
    });

    projectiles.forEach((projectile, projectileInd) => {
        projectile.update();

        // Removing the projectiles that gone off the size of our canvas screen
        if (projectile.x + projectile.radius < 0 ||
            projectile.x - projectile.radius > canvas.width ||
            projectile.y + projectile.radius < 0 ||
            projectile.y - projectile.radius > canvas.height
        ) {
            setTimeout(() => {
                projectiles.splice(projectileInd, 1);
            }, 0);
        }
    });

    enemies.forEach((enemy, enemyInd) => {
        enemy.update();

        // when enemy collides with player
        const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y);
        if (dist - enemy.radius - player.radius < 1) {
            // show game over popup
            modelGameScore.innerHTML = score;
            gameOverBx.style.display = 'block';
            cancelAnimationFrame(animationId);
            deathAudio.play();
            game.active = false;
            clearInterval(intervalId);
            clearInterval(spawnPowerUpId);
        }

        projectiles.forEach((projectile, projectileInd) => {
            // calculate the distance between every projectile and single enemy
            const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y);
            if (dist - (enemy.radius - projectile.radius) < 1) { // when projectile collides with enemy

                // Create explosion particle on hit
                for (let i = 0; i < enemy.radius * 2; i++) {
                    particles.push(new Particle(projectile.x, projectile.y, Math.random() * 2, enemy.color, {
                        x: (Math.random() - 0.5) * (Math.random() * 8),
                        y: (Math.random() - 0.5) * (Math.random() * 8)
                    }));
                }

                // shrink enemy of particular size
                if (enemy.radius - 10 > 10) {
                    damageTakenAudio.play();
                    // set the score
                    score += 100;
                    scoreEle.innerHTML = score;
                    createScoreLabels({
                        position: {
                            x: projectile.x,
                            y: projectile.y
                        },
                        score: 100
                    });
                    // enemy.radius -= 10;
                    gsap.to(enemy, {
                        radius: enemy.radius - 10
                    });
                    // remove only projectile here
                    setTimeout(() => {
                        projectiles.splice(projectileInd, 1); // removing projectile
                    }, 0);
                } else {
                    explodeAudio.play();
                    // set the score
                    score += 150;  // if enemy gets removed by one shot add extra 50 bonus points
                    scoreEle.innerHTML = score;
                    createScoreLabels({
                        position: {
                            x: projectile.x,
                            y: projectile.y
                        },
                        score: 150
                    });

                    // change background color of backgroundParticle to enemy color
                    backgroundParticles.forEach((backgroundParticle) => {
                        backgroundParticle.color = enemy.color;
                    });

                    setTimeout(() => {
                        enemies.splice(enemyInd, 1);    // removing enemy
                        projectiles.splice(projectileInd, 1); // removing projectile
                    }, 0);
                }
            }
        });
    });

    frames++;
}

// when user click on the volume button
volumeUpBtn.addEventListener('click', () => {
    backgroundAudio.pause();
    volumeOffBtn.style.display = 'block';
    volumeUpBtn.style.display = 'none';
});

volumeOffBtn.addEventListener('click', () => {
    if (audioInitialized) {
        backgroundAudio.play();
    }
    volumeOffBtn.style.display = 'none';
    volumeUpBtn.style.display = 'block';
});


function shoot({x, y}){
    if (game.active) {
        // shoot projectiles on click
        const angle = Math.atan2(
            y - player.y,
            x - player.x
        );

        const velocity = {
            x: Math.cos(angle),
            y: Math.sin(angle)
        }

        // play shoot audio
        shootAudio.play();

        projectiles.push(new Projectile(
            player.x,
            player.y,
            5,
            '#fff',
            {
                x: velocity.x,
                y: velocity.y
            }
        ))
    }
}

let audioInitialized = false;
// when user presses on some key on window
window.addEventListener("click", (e) => {
    // if background audio is not playing
    if (!backgroundAudio.playing() && !audioInitialized) {
        backgroundAudio.play();
        audioInitialized = true;
    }
    shoot({x: e.clientX, y: e.clientY});
});

// Handle smarphone controls
window.addEventListener('touchstart', (e) => {
    shoot({x: e.touches[0].clientX, y: e.touches[0].clientY });
    mouse.position.x = e.touches[0].clientX;
    mouse.position.y = e.touches[0].clientY;
});

window.addEventListener('touchmove', (e) => {
    mouse.position.x = e.touches[0].clientX;
    mouse.position.y = e.touches[0].clientY;
});

const mouse = {
    position: {
        x: 0,
        y: 0
    }
};

window.addEventListener('mousemove', (e) => {
    mouse.position.x = e.clientX;
    mouse.position.y = e.clientY;
});

// when user clicks restart button
modelRestartBtn.addEventListener('click', () => {
    selectAudio.play();
    init();
    animate();
    // hide the model
    gameOverBx.style.display = 'none';
    scoreEle.innerHTML = score;
    spawnEnemies();
    spawnPowerUps();
});

// when user clicks start button
startBtn.addEventListener('click', () => {
    selectAudio.play();
    init();
    animate();
    spawnEnemies();
    spawnPowerUps();
    // hide the start model
    startGameBx.style.display = 'none'
});

// 
window.addEventListener('keydown', (e) => {
    switch (e.key) {
        case 'ArrowRight':
            player.velocity.x += 1;
            break;

        case 'ArrowLeft':
            player.velocity.x -= 1;
            break;

        case 'ArrowUp':
            player.velocity.y -= 1;
            break;

        case 'ArrowDown':
            player.velocity.y += 1;
            break;
    }
});

window.addEventListener('resize', () => {
    canvas.width = innerWidth;
    canvas.height = innerHeight;

    init();
});

// when user starts game but switch to another tab we want to clear interval 
document.addEventListener('visibilityChange', () => {
    if(document.hidden){
        // clear spawn enemy interval id
        clearInterval(intervalId);
        clearInterval(spawnPowerUpId);
    }else{
        spawnEnemies();
        spawnPowerUps();
    }
});

