// Player blurprint
class Player {
    constructor(x, y, radius, color) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.powerUp;
        this.velocity = {
            x: 0,
            y: 0
        }
    }

    // Draw a player
    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx.fillStyle = this.color;
        ctx.fill();
    }

    update() {
        this.draw();
        
        const friction = 0.99;
        this.velocity.x *= friction;
        this.velocity.y *= friction;

        // add velocity to player only if the player is within the game screen / canvas screen
        // check collision of player for right & left of game screen
        if(this.x + this.radius + this.velocity.x <= canvas.width && this.x - this.radius + this.velocity.x >= 0){
            this.x += this.velocity.x;
        }else{
            this.velocity.x = 0;
        }

        // check collision of player for top & down of game screen
        if(this.y + this.radius + this.velocity.y <= canvas.height && this.y - this.radius + this.velocity.y >= 0){
            this.y += this.velocity.y;
        }else{
            this.velocity.y = 0;
        }
    }
}


// Projectile blueprint
class Projectile {
    constructor(x, y, radius, color, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
    }

    // Draw a projectile
    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx.fillStyle = this.color;
        ctx.fill();
    }

    update() {
        this.draw();
        this.x = this.x + this.velocity.x * 4;
        this.y = this.y + this.velocity.y * 4;
    }
}

// Enemies blueprint
class Enemies {
    constructor(x, y, radius, color, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
        this.radian = 0;
        this.enemyType = 'Linear';
        this.center = {
            x,
            y
        };

        if(Math.random() < 0.5){
            this.enemyType = 'Homing';

            if(Math.random() < 0.5){
                this.enemyType = 'Spinning';

                if(Math.random() < 0.5){
                    this.enemyType = 'Homing Spinning';
                }
            }
        }
        if(Math.random() < 0.5){
            this.enemyType = 'Homing Spinning';
        }
    }

    // Draw a projectile
    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx.fillStyle = this.color;
        ctx.fill();
    }

    update() {
        this.draw();

        if(this.enemyType === 'Spinning'){
            this.radian += 0.1;
            this.center.x = this.center.x + this.velocity.x;
            this.center.y = this.center.y + this.velocity.y;
    
            this.x = this.center.x + Math.cos(this.radian) * 30;
            this.y = this.center.y + Math.sin(this.radian) * 30;
        }
        else if(this.enemyType === 'Homing'){  // Those enemies who follow player
            const angle = Math.atan2(player.y - this.y, player.x - this.x);
            this.velocity.x = Math.cos(angle);
            this.velocity.y = Math.sin(angle);

            this.x = this.x + this.velocity.x;
            this.y = this.y + this.velocity.y;
        }
        else if(this.enemyType === 'Homing Spinning'){
            this.radian += 0.1;
            
            const angle = Math.atan2(player.y - this.center.y, player.x - this.center.x);
            this.velocity.x = Math.cos(angle);
            this.velocity.y = Math.sin(angle);
            
            this.center.x = this.center.x + this.velocity.x;
            this.center.y = this.center.y + this.velocity.y;
    
            this.x = this.center.x + Math.cos(this.radian) * 30;
            this.y = this.center.y + Math.sin(this.radian) * 30;           
        }
        else{                                 // normal enemies who run towards center of game screen 
            this.x = this.x + this.velocity.x;
            this.y = this.y + this.velocity.y;
        }
    }
}

const friction = 0.97;
// Particle blueprint
class Particle {
    constructor(x, y, radius, color, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
        this.alpha = 1;
    }

    // Draw a projectile
    draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.restore();
    }

    update() {
        this.draw();
        this.velocity.x *= friction;
        this.velocity.y *= friction;
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
        this.alpha -= 0.01;
    }
}

// PowerUps Blueprint
class PowerUp{
    constructor({ position = {x: 0, y: 0}, velocity }){
        this.position = position;
        this.velocity = velocity;
        this.image = new Image();
        this.image.src = './img/lightningBolt.png'; 
        this.radian = 0;

        // to make the powerup flicker so that its easily visible for user
        this.alpha = 1; 
        gsap.to(this, {
            alpha: 0,
            duration: 2,
            repeat: -1
        });
    }

    draw(){
        ctx.save();
        ctx.globalAlpha = this.alpha;   

        // rotate the powerup image
        ctx.translate( // translate the canvas to the position of powerup
            this.position.x + this.image.width / 2,
            this.position.y + this.image.height / 2
        );
        ctx.rotate(this.radian);
        ctx.translate(  // translate canvas back to its initial position 
            -this.position.x - this.image.width / 2,
            -this.position.y - this.image.height / 2
        );
        ctx.drawImage(this.image, this.position.x, this.position.y);    
        ctx.restore();
    }

    update(){
        this.draw();
        this.radian += 0.01;
        this.position.x += this.velocity.x;
    }
}

class BackgroundParticle {
    constructor({ position, radius = 3, color = 'blue' }) {
        this.position = position;
        this.radius = radius;
        this.color = color;
        this.alpha = 1;
    }

    draw(){
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.restore();
    }
}