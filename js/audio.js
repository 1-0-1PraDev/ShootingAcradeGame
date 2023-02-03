const shootAudio = new Howl({
    src: './audio/Basic_shoot_noise.wav',
    volume: 0.001
});

const damageTakenAudio = new Howl({
    src: './audio/Damage_taken.wav',
    volume: 0.004
});

const explodeAudio = new Howl({
    src: './audio/Explode.wav',
    volume: 0.004
});

const deathAudio =  new Howl({
    src: './audio/Death.wav',
    volume: 0.004
});

const powerUpAudio =  new Howl({
    src: './audio/Powerup_noise.wav',
    volume: 0.004
});

const selectAudio =  new Howl({
    src: './audio/Select.wav',
    volume: 0.004
});

const backgroundAudio =  new Howl({
    src: './audio/Hyper.wav',
    volume: 0.004,
    loop: true
});
