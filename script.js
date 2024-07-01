// Main Menu Scene
class MainMenu extends Phaser.Scene {
    constructor() {
        super('main-menu');
        this.menuMusic = null;
        this.isMuted = false; // Moved the isMuted flag to the constructor
        this.normalModeHighScore = 0;
        this.normalModeHighestWave = 0;
        this.hardModeHighScore = 0;
        this.hardModeHighestWave = 0;
        this.normalModeHighScoreText = null;
        this.normalModeHighestWaveText = null;
        this.hardModeHighScoreText = null;
        this.hardModeHighestWaveText = null;
        this.secretGameImage = null;
        this.canOpenSecretGame = false; // New flag to control secret game access
        this.debugGraphics = null; // Add this line to store the debug graphics object
    }

    preload() {
        this.load.image('abackground', 'https://play.rosebud.ai/assets/start-screen.jpg?1OM9');
        this.load.audio('menu-music', 'https://play.rosebud.ai/assets/MM MUSIC.mp3?9Ran');
        this.load.image('secret-game-image', 'https://play.rosebud.ai/assets/yellow-star.jpg?SMjE');
        
    }

    create(data) {
        if (data && data.isMuted !== undefined) {
            this.isMuted = data.isMuted;
        }
        this.background = this.add.sprite(400, 300, 'abackground');

        // Set the initial scale of the background
        this.background.setScale(1.05);

        // Create a tween to zoom in and out the background
        this.tweens.add({
            targets: this.background,
            scaleX: { from: 1.05, to: 1.08 },
            scaleY: { from: 1.05, to: 1.08 },
            duration: 60000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Add a floating effect to the background
        this.tweens.add({
            targets: this.background,
            y: { from: 300, to: 305 },
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Play menu music as soon as the game is loaded
        this.menuMusic = this.sound.add('menu-music', { loop: true });
        this.menuMusic.setVolume(0.3);
        this.menuMusic.setMute(this.isMuted); // Set the mute state based on the isMuted flag
        this.menuMusic.play();

        // Title
        this.titleText = this.add.text(400, 100, '', { fontSize: '60px', fill: '#ff0000', fontFamily: 'Arial', fontStyle: 'bold' }).setOrigin(0.5, -1.3);
        this.createFloatingTextEffect(this.titleText);

        // "Click here to begin" text
        const clickToBeginText = this.add.text(400, 250, 'CLICK TO BEGIN', { fontSize: '32px', fill: '#ff0000', fontFamily: 'Arial', fontStyle: 'bold' }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        this.createFloatingTextEffect(clickToBeginText);
        clickToBeginText.on('pointerdown', () => {
            clickToBeginText.setVisible(false);
            this.showMenuOptions();
            this.canOpenSecretGame = true; // Allow secret game access after showing menu options
        });

        // Add click event listener to the entire scene to activate "Click here to begin"
        this.input.on('pointerdown', () => {
            if (!this.menuOptions.length) {
                clickToBeginText.setVisible(false);
                this.showMenuOptions();
                this.canOpenSecretGame = true; // Allow secret game access after showing menu options
            }
        });

        this.menuOptions = [];
        this.currentOption = 0;

        // Instructions text
        this.instructionsText = this.add.text(160, 350, 'Instructions:\n\n' +
            'Use ARROW KEYS to move.\n' +
            'Dodge enemies.\n' +
            'Collect awards!\n' +
            'Press SPACE to start or reset the game.\n' +
            'Press Numpad0 to PAUSE/UNPAUSE.\n' +
            'Press I to close this menu.',
            { fontSize: '16px', fill: '#ffffff', fontFamily: 'Arial', fontStyle: 'bold' }
        ).setOrigin(0.5).setVisible(false);
        this.createFloatingTextEffect(this.instructionsText);

        // Bottom text
        this.bottomText = this.add.text(400, 580, '', { fontSize: '16px', fill: '#ffffff', fontFamily: 'Arial', fontStyle: 'bold' }).setOrigin(0.5);
        this.createFloatingTextEffect(this.bottomText);

        // Music toggle text
        this.musicToggleText = this.add.text(770, 590, this.isMuted ? 'Music: OFF' : 'Music: ON', { fontSize: '16px', fill: '#ffffff', fontFamily: 'Arial', fontStyle: 'bold' }).setOrigin(1, 1).setInteractive({ useHandCursor: true });
        this.musicToggleText.on('pointerdown', this.toggleMusic, this);

        // Load high scores and highest waves from localStorage
        this.loadHighScoresAndWaves();

        // Create text objects for displaying high scores and highest waves
        this.createHighScoreAndWaveTexts();

        // Add the secret game image
        this.secretGameImage = this.add.image(400, 150, 'secret-game-image').setOrigin(0.6, 1.8).setScale(1.5).setInteractive({ useHandCursor: true });
        this.secretGameImage.on('pointerdown', this.startSecretGame, this);

        // Apply the same tween effect to the secret game image
        this.tweens.add({
            targets: this.secretGameImage,
            scaleX: { from: 1.5, to: 1.53 },
            scaleY: { from: 1.5, to: 1.53 },
            duration: 60000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        this.tweens.add({
            targets: this.secretGameImage,
            y: { from: 150, to: 155 },
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Create the debug graphics object
        this.debugGraphics = this.physics.world.createDebugGraphic();
        this.debugGraphics.setVisible(false); // Initially hide the debug graphics

        // Add a key listener to toggle the debug graphics visibility
        this.input.keyboard.on('keydown-D', () => {
            this.debugGraphics.setVisible(!this.debugGraphics.visible);
        });

        // Add a key listener to refresh the entire game when Numpad 2 is pressed
        this.input.keyboard.on('keydown-NUMPAD_TWO', this.refreshGame, this);
    }

    refreshGame() {
        // Refresh the entire game
        window.location.reload();
    }

    startSecretGame() {
        if (this.canOpenSecretGame) { // Check if secret game access is allowed
            this.menuMusic.stop(); // Stop the menu music when the secret game is loaded
            this.scene.start('secret-game', { isMuted: this.isMuted }); // Pass the isMuted flag as a parameter
        }
    }

    createFloatingTextEffect(text) {
        const tween = this.tweens.add({
            targets: text,
            y: text.y - 5,
            duration: 1000,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1
        });
    }

    showMenuOptions() {
        this.menuOptions = [
            this.add.text(400, 300, 'Normal Mode', { fontSize: '32px', fill: '#ffffff', fontFamily: 'Arial', fontStyle: 'bold' }).setOrigin(0.5).setInteractive({ useHandCursor: true }),
            this.add.text(400, 350, 'Hard Mode', { fontSize: '32px', fill: '#ffffff', fontFamily: 'Arial', fontStyle: 'bold' }).setOrigin(0.5).setInteractive({ useHandCursor: true }),
            this.add.text(400, 400, 'Instructions', { fontSize: '32px', fill: '#ffffff', fontFamily: 'Arial', fontStyle: 'bold' }).setOrigin(0.5).setInteractive({ useHandCursor: true }),
        ];

        this.menuOptions[this.currentOption].setFill('#ff0000');

        this.menuOptions.forEach((option, index) => {
            option.on('pointerover', () => {
                this.menuOptions[this.currentOption].setFill('#ffffff').setStroke('#ffffff', 0);
                this.currentOption = index;
                this.menuOptions[this.currentOption].setFill('#ff0000').setStroke('#ffffff', 0);
            });

            option.on('pointerdown', () => {
                this.selectOption(index);
            });
        });

        this.normalModeHighScoreText.setVisible(true);
        this.normalModeHighestWaveText.setVisible(true);
        this.hardModeHighScoreText.setVisible(true);
        this.hardModeHighestWaveText.setVisible(true);
    }

    loadHighScoresAndWaves() {
        const storedNormalModeHighScore = localStorage.getItem('normalModeHighScore');
        this.normalModeHighScore = storedNormalModeHighScore ? parseInt(storedNormalModeHighScore, 10) : 0;

        const storedNormalModeHighestWave = localStorage.getItem('normalModeHighestWave');
        this.normalModeHighestWave = storedNormalModeHighestWave ? parseInt(storedNormalModeHighestWave, 10) : 1;

        const storedHardModeHighScore = localStorage.getItem('hardModeHighScore');
        this.hardModeHighScore = storedHardModeHighScore ? parseInt(storedHardModeHighScore, 10) : 0;

        const storedHardModeHighestWave = localStorage.getItem('hardModeHighestWave');
        this.hardModeHighestWave = storedHardModeHighestWave ? parseInt(storedHardModeHighestWave, 10) : 1;
    }

    createHighScoreAndWaveTexts() {
        this.normalModeHighScoreText = this.add.text(400, 450, `Normal Mode High Score: ${this.formatTime(this.normalModeHighScore)}`, { fontSize: '16px', fill: '#00ff00', fontFamily: 'Arial', fontStyle: 'bold' }).setOrigin(0.5).setVisible(false);
        this.createFloatingTextEffect(this.normalModeHighScoreText);
        this.normalModeHighestWaveText = this.add.text(400, 470, `Normal Mode Highest Wave: ${this.normalModeHighestWave}`, { fontSize: '16px', fill: '#00ff00', fontFamily: 'Arial', fontStyle: 'bold' }).setOrigin(0.5).setVisible(false);
        this.createFloatingTextEffect(this.normalModeHighestWaveText);
        this.hardModeHighScoreText = this.add.text(400, 510, `Hard Mode High Score: ${this.formatTime(this.hardModeHighScore)}`, { fontSize: '16px', fill: '#00ff00', fontFamily: 'Arial', fontStyle: 'bold' }).setOrigin(0.5).setVisible(false);
        this.createFloatingTextEffect(this.hardModeHighScoreText);
        this.hardModeHighestWaveText = this.add.text(400, 530, `Hard Mode Highest Wave: ${this.hardModeHighestWave}`, { fontSize: '16px', fill: '#00ff00', fontFamily: 'Arial', fontStyle: 'bold' }).setOrigin(0.5).setVisible(false);
        this.createFloatingTextEffect(this.hardModeHighestWaveText);
    }

    selectOption(index) {
        // Do not stop the music when selecting the "Instructions" option
        if (index === 2) {
            this.instructionsText.setVisible(!this.instructionsText.visible);
        } else {
            this.menuMusic.stop();
            this.cleanupScene();
            if (index === 0) {
                this.scene.start('normal-mode', { isMuted: this.isMuted }); // Pass the isMuted flag as a parameter
            } else if (index === 1) {
                this.scene.start('hard-mode', { isMuted: this.isMuted }); // Pass the isMuted flag as a parameter
            }
        }
    }

    cleanupScene() {
        // Cleanup code goes here
    }

    toggleMusic() {
        this.isMuted = !this.isMuted;
        this.menuMusic.setMute(this.isMuted);
        this.musicToggleText.setText(this.isMuted ? 'Music: OFF' : 'Music: ON');
    }

    formatTime(millis) {
        const minutes = Math.floor(millis / 60000);
        const seconds = Math.floor((millis % 60000) / 1000);
        const milliseconds = Math.floor((millis % 1000) / 10);
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}:${milliseconds.toString().padStart(2, '0')}`;
    }
}

class Asteroid extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture, frame) {
        super(scene, x, y, texture, frame);
        scene.add.existing(this);
        scene.physics.add.existing(this);
        const scale = Phaser.Math.FloatBetween(0.03, 0.09);
         this.hbScale = 0.8;
        this.setScale(scale);
        this.body.setSize(this.width * this.hbScale, this.height * this.hbScale);
        this.body.setVelocity(0, 0);
        this.body.setCollideWorldBounds(true);
        this.body.setBounce(1);
        this.rotationSpeed = Phaser.Math.Between(50, 200);
        this.isSpinning = false;
    }

    start(spawnFromTop) {
        const velocityY = spawnFromTop ? Phaser.Math.Between(120, 180) : Phaser.Math.Between(-180, -120);
        this.body.setVelocity(Phaser.Math.Between(-180, 120), velocityY);
        this.isSpinning = true;
    }

    preUpdate(time, delta) {
        if (this.isSpinning) {
            this.angle += this.rotationSpeed * delta / 1000;
        }
    }

    stopSpinning() {
        this.isSpinning = false;
        this.rotationSpeed = 0;
    }
}

class HardModeAsteroid extends Asteroid {
    start(spawnFromTop) {
        const velocityY = spawnFromTop ? Phaser.Math.Between(240, 300) : Phaser.Math.Between(-300, -240);
        this.body.setVelocity(Phaser.Math.Between(-300, 240), velocityY);
        this.isSpinning =true;
    }

    preUpdate(time, delta) {
        if (this.isSpinning) {
            this.angle += this.rotationSpeed * delta / 1000;
        }
    }
}

class PowerUp extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture, frame) {
        super(scene, x, y, texture, frame);
        scene.add.existing(this);
        scene.physics.add.existing(this);
        const scale = 0.0625;
         this.hbScale = 0.8;
        this.setScale(scale);
        this.body.setSize(this.width * this.hbScale, this.height * this.hbScale);
        this.body.setVelocity(0, 0);
        this.body.setCollideWorldBounds(true);
        this.body.setBounce(1);
    }

    start(spawnFromTop) {
        const velocityY = spawnFromTop ? Phaser.Math.Between(100, 200) : Phaser.Math.Between(-200, -100);
        this.body.setVelocity(Phaser.Math.Between(-100, 100), velocityY);
    }
}

class SlowdownPowerUp extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture, frame) {
        super(scene, x, y, texture, frame);
        scene.add.existing(this);
        scene.physics.add.existing(this);
        const scale = 0.0625;
        this.hbScale = 0.8;
        this.setScale(scale);
        this.body.setSize(this.width * this.hbScale, this.height * this.hbScale);
        this.body.setVelocity(0, 0);
        this.body.setCollideWorldBounds(true);
        this.body.setBounce(1);
    }

    start(spawnFromTop) {
        const velocityY = spawnFromTop ? Phaser.Math.Between(100, 200) : Phaser.Math.Between(-200, -100);
        this.body.setVelocity(Phaser.Math.Between(-100, 100), velocityY);
    }
}

class ShieldPowerUp extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture, frame) {
        super(scene, x, y, texture, frame);
        scene.add.existing(this);
        scene.physics.add.existing(this);
        const scale = 0.0625;
        this.hbScale = 0.8;
        this.setScale(scale);
        this.body.setSize(this.width * this.hbScale, this.height * this.hbScale);
        this.body.setVelocity(0, 0);
        this.body.setCollideWorldBounds(true);
        this.body.setBounce(1);
    }

    start(spawnFromTop) {
        const velocityY = spawnFromTop ? Phaser.Math.Between(100, 200) : Phaser.Math.Between(-200, -100);
        this.body.setVelocity(Phaser.Math.Between(-100, 100), velocityY);
    }
}

class Spaceship extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture, frame) {
        super(scene, x, y, texture, frame);
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.normalScale = 0.5;
        this.hbScale = 1;
        this.setScale(this.normalScale);
        this.body.setSize(this.width * this.hbScale, this.height * this.hbScale);
        this.body.setCollideWorldBounds(true);
        this.cursors = scene.input.keyboard.createCursorKeys();
        this.speed = 210;
        this.powerupActive = false;
        this.health = 100;
        this.normalTexture = texture;
        this.slowdownActive = false;
        this.shieldActive = false;
        this.slowdownKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
    }

    boostSpeed() {
        this.powerupActive = true;
        this.speed *= 1.6;
        const newScale = 1;
        if (this.scene instanceof SecretGame) {
            this.setTexture('gold-tiles');
        } else {
            this.setTexture('gold-tile');
        }
        this.setScale(newScale);
        this.body.setSize(this.width * newScale, this.height * newScale);
        this.scene.time.delayedCall(5000, () => {
            this.speed /= 1.6;
            this.powerupActive = false;
            if (!this.scene.gameOver) {
                this.setTexture(this.normalTexture);
                this.setScale(this.normalScale);
                this.body.setSize(this.width * this.hbScale, this.height * this.hbScale);
            }
        });
    }

    slowdownAsteroids() {
        if (!this.slowdownActive) {
            this.slowdownActive = true;
            this.scene.physics.world.bodies.entries.forEach(body => {
                if (body.gameObject instanceof Asteroid) {
                    body.setVelocity(body.velocity.x * 0.5, body.velocity.y * 0.5);
                }
            });
            this.scene.time.delayedCall(5000, () => {
                this.scene.physics.world.bodies.entries.forEach(body => {
                    if (body.gameObject instanceof Asteroid) {
                        body.setVelocity(body.velocity.x * 2, body.velocity.y * 2);
                    }
                });
                this.slowdownActive = false;
            });
        }
    }

    activateShield() {
        this.shieldActive = true;
        if (this.scene instanceof SecretGame) {
            this.setTexture('shielded-spaceships');
        } else {
            this.setTexture('shielded-spaceship');
        }
        const newScale = this.normalScale * 2;
        this.setScale(newScale);
        this.hbScale = 1;
        this.body.setSize(this.width * newScale, this.height * newScale);
        this.speed *= 0.7;
        this.scene.time.delayedCall(5000, () => {
            this.shieldActive = false;
            this.setTexture(this.normalTexture);
            this.setScale(this.normalScale);
            this.body.setSize(this.width * this.hbScale, this.height * this.hbScale);
            this.speed /= 0.7;
        });
        const shieldPickupSound = this.scene.sound.add('shield-pickup-sound', { volume: 0.2 });
        shieldPickupSound.play();
    }

    deactivateShield() {
        this.shieldActive = false;
        this.setTexture(this.normalTexture);
        this.setScale(this.normalScale);
        this.body.setSize(this.width * this.normalScale, this.height * this.normalScale);
    }

    moveShip() {
        if (this.cursors.left.isDown) {
            this.body.setVelocityX(-this.speed);
        } else if (this.cursors.right.isDown) {
            this.body.setVelocityX(this.speed);
        } else {
            this.body.setVelocityX(0);
        }

        if (this.cursors.up.isDown) {
            this.body.setVelocityY(-this.speed);
        } else if (this.cursors.down.isDown) {
            this.body.setVelocityY(this.speed);
        } else {
            this.body.setVelocityY(0);
        }

        if (Phaser.Input.Keyboard.JustDown(this.slowdownKey)) {
            this.slowdownAsteroids();
        }
    }

    reset() {
        this.body.setVelocity(0, 0);
        this.powerupActive = false;
        this.speed = 210;
        this.setTexture(this.normalTexture);
        this.setScale(this.normalScale);
        this.body.setSize(this.width * this.normalScale, this.height * this.normalScale);
    }
}
        // Add the secret game scene
class SecretGame extends Phaser.Scene {
    constructor() {
        super('secret-game');
        this.asteroids = [];
                this.powerUps = [];
                this.slowdownPowerUps = [];
                this.shieldPowerUps = [];
                this.spaceship = null;
                this.score = 0;
                this.gameOverText = null;
                this.resetText = null;
                this.powerupTimer = null;
                this.powerupText = null;
                this.slowdownPowerupText = null;
                this.shieldPowerupText = null;
                this.gameOver = false;
                this.gameStarted = false;
                this.asteroidsTimer = 0;
                this.powerupsTimer = 0;
                this.alternateSpawn = true;
                this.highScore = 0;
                this.highScoreText = null;
                this.timeText = null;
                this.countdownText = null;
                this.waveCounter = 1;
                this.waveText = null;
                this.highestWaveText = null;
                this.highestWave = 1;
                this.gameOverTimeText = null;
                this.gameOverWaveText = null;
                this.isPaused = false;
                this.pauseText = null;
                this.pauseInstructionText = null;
                this.backgroundMusic = null;
                this.isMuted = false;
                this.toggleMusicText = null;
                this.powerupSound = null;
                this.deathSound = null;
                this.pauseSound = null;
                this.waveSound = null;
                 this.debugGraphics = null; // Add this line to store the debug graphics object
                }stopAllAsteroids() {
    this.physics.world.bodies.entries.forEach(body => {
        if (body.gameObject instanceof Asteroid) {
            body.gameObject.stopSpinning();
        }
    });
            }
toggleMusic() {
    this.isMuted = !this.isMuted;
    this.backgroundMusic.setMute(this.isMuted);
    this.musicToggleText.setText(this.isMuted ? 'Music: OFF' : 'Music: ON');
}
            preload() {
                this.load.image('sasteroid', 'https://play.rosebud.ai/assets/KRAMER ASS.png?lFUi');
                this.load.image('spower-up', 'https://play.rosebud.ai/assets/that coke speed1.png?bAwV');
                this.load.image('sslowdown-power-up', 'https://play.rosebud.ai/assets/JERRY.png?gtc5');
                this.load.image('spaceships', 'https://play.rosebud.ai/assets/Seinfeld game.png?EQW2');
                this.load.image('gold-tiles', 'https://play.rosebud.ai/assets/jerry speed.png?2wwB');
                this.load.image('sbackground', 'https://play.rosebud.ai/assets/create a dark stage background.png?GQx0');
                this.load.image('sshield', 'https://play.rosebud.ai/assets/SHIELD.png?8cXv');
                this.load.image('shielded-spaceships', 'https://play.rosebud.ai/assets/SEINFELD POWER.png?43Ru');
                this.load.audio('background-musics', 'https://play.rosebud.ai/assets/DOOMfeld.mp3?wmGA');
                this.load.audio('apowerup-sound', 'https://play.rosebud.ai/assets/Seinfeld speed.mp3?pVAg');
                this.load.audio('sdeath-sound', 'https://play.rosebud.ai/assets/no soup die.mp3?OTTp');
                this.load.audio('spause-sound', 'https://play.rosebud.ai/assets/PAUSE SEIN.mp3?BvA8');
                this.load.audio('swave-sound', 'https://play.rosebud.ai/assets/seinfeld pop.mp3?iZ8Q');
                this.load.audio('shield-pickup-sound', 'https://play.rosebud.ai/assets/SHIELD SOUND.mp3?oP93');
                this.load.audio('smetal-dagger-hit', 'https://play.rosebud.ai/assets/seinfeld dies.mp3?tYbb');
                this.load.audio('sslowdown-sound', 'https://play.rosebud.ai/assets/Slow down.mp3?gkYo');
            }

             create(data) {
        if (data && data.isMuted !== undefined) {
            this.isMuted = data.isMuted;
        }
                this.background =this.add.image(400, 300, 'sbackground');
                this.background.setDisplaySize(1000, 650);
                
this.musicToggleText = this.add.text(770, 590, this.isMuted ? 'Music: OFF' : 'Music: ON', { fontSize: '16px', fill: '#ffffff' }).setFontStyle('bold').setOrigin(1, 1).setInteractive({ useHandCursor: true }).setDepth(1000);
this.musicToggleText.on('pointerdown', this.toggleMusic, this);
                this.createSpaceship();
                this.createAsteroids(6); 
                this.createPowerUps(1);
                this.createSlowdownPowerUps(0);
                this.createShieldPowerUps(0);
                this.createPowerupText();
                this.createSlowdownPowerupText();
                const storedHardModeHighScore = localStorage.getItem('hardModeHighScore');
this.highScore = storedHardModeHighScore ? parseInt(storedHardModeHighScore, 0) : 0;

const storedHardModeHighestWave = localStorage.getItem('hardModeHighestWave');
this.highestWave = storedHardModeHighestWave ? parseInt(storedHardModeHighestWave, 0) : 0;
                this.createGameOverText();
                this.createResetText();
                this.createStartText();
                this.createHighScoreText();
                this.createTimeText();
                this.shieldPowerupText = this.add.text(this.game.config.width / 2, 80, '', { fontSize: '24px', fill: '#800080' }).setFontStyle('bold').setOrigin(0.5, 0).setDepth(1000); // Initialize shieldPowerupText
                this.createCountdownText();
                this.createWaveText();
                this.createHighestWaveText();
                this.createGameOverTimeText();
                this.createGameOverWaveText();
                this.createPauseText();
                this.createPauseInstructionText();
                this.createToggleMusicText();
                this.createInstructionsText();
                this.backgroundMusic = this.sound.add('background-musics', { loop: true });
                if (!this.isMuted) {
                    this.backgroundMusic.play();
                }
                this.backgroundMusic.setVolume(0.2);
                 this.powerupSound = this.sound.add('apowerup-sound');
    this.powerupSound.setVolume(1); // Set the desired volume level
                this.deathSound = this.sound.add('sdeath-sound');
                this.deathSound.setVolume(1);
                this.pauseSound = this.sound.add('spause-sound');
                this.pauseSound.setVolume(0.4);
                this.waveSound = this.sound.add('swave-sound');
                this.waveSound.setVolume(1);
                this.slowdownSound = this.sound.add('sslowdown-sound');
this.slowdownSound.setVolume(1);

 // Create the debug graphics object
        this.debugGraphics = this.physics.world.createDebugGraphic();
        this.debugGraphics.setVisible(false); // Initially hide the debug graphics
          // Add a key listener to refresh the entire game when Numpad 2 is pressed
        this.input.keyboard.on('keydown-NUMPAD_TWO', this.refreshGame, this);

        // Add a key listener to toggle the debug graphics visibility
        this.input.keyboard.on('keydown-D', () => {
            this.debugGraphics.setVisible(!this.debugGraphics.visible);
        });


                this.physics.add.overlap(this.spaceship, this.asteroids, this.handleShipCollision, null, this, (ship, asteroid) => {
                    const shipBounds = ship.getBounds();
                    const asteroidBounds = asteroid.getBounds();
                    const overlap = Phaser.Geom.Intersects.RectangleToRectangle(shipBounds, asteroidBounds);

                   

                    return Phaser.Geom.Intersects.RectangleToRectangle(shipBounds, asteroidBounds);
                });
                

                this.physics.add.overlap(this.spaceship, this.powerUps, this.handlePowerUpCollision, null, this);
                this.physics.add.overlap(this.spaceship, this.slowdownPowerUps, this.handleSlowdownPowerUpCollision, null, this);
                this.physics.add.overlap(this.spaceship, this.shieldPowerUps, this.handleShieldPowerUpCollision, null, this);  // Add overlap for shield power-ups

                this.input.keyboard.on('keydown-SPACE', this.handleSpaceKey, this);
                this.input.keyboard.on('keydown-LEFT', this.handleArrowKey, this);
                this.input.keyboard.on('keydown-RIGHT', this.handleArrowKey, this);
                this.input.keyboard.on('keydown-UP', this.handleArrowKey, this);
                this.input.keyboard.on('keydown-DOWN', this.handleArrowKey, this);
                this.input.keyboard.on('keydown-NUMPAD_ZERO', this.handlePauseKey, this);
                this.input.keyboard.on('keydown-NUMPAD_ONE', this.handleMuteKey, this); 
                this.input.keyboard.on('keydown-I', this.handleInstructionsKey, this);
                this.input.keyboard.on('keydown-NUMPAD_TWO', this.returnToMainMenu, this); // Add key for returning to main menu
                // Define the zoom in and out effect using tweens
    this.tweens.add({
        targets: this.background,
        scale: 1.9, // Zoom in scale
        duration: 135, // Duration of zoom in effect
        yoyo: true,
        repeat: -1 // Repeat indefinitely
    });

    // Define the slight shaking motion effect
    this.tweens.add({
        targets: this.background,
        y: '-=2', // Move up slightly
        duration: 135,
        yoyo: true,
        repeat: -1 // Repeat indefinitely
    });

            }
            refreshGame() {
                // Refresh the entire game
                window.location.reload();
            }

            returnToMainMenu() {
    this.backgroundMusic.stop(); // Stop the background music
    this.scene.start('main-menu');
}

            handleInstructionsKey() {
                if (this.isPaused) {
                    this.instructionsText.setVisible(!this.instructionsText.visible);
                }
            }

            handleShipCollision(ship, asteroid) {
    if (ship.shieldActive) {
        asteroid.destroy();
        // Add a check to play the sound only once
        
            
            // Play the splosion sound
            const asteroidDestroySound = this.sound.add('smetal-dagger-hit', { volume: 1 });
            asteroidDestroySound.play();
        // Don't disable the shield until its duration is over
    } else {
        const shipBounds = ship.getBounds();
        const asteroidBounds = asteroid.getBounds();

        const isColliding = Phaser.Geom.Intersects.RectangleToRectangle(shipBounds, asteroidBounds);

       if (isColliding) {
    this.gameOver = true;
    this.physics.pause();
    this.backgroundMusic.stop();
    this.deathSound.play();
    this.gameOverTimeText.setText(`Tiem: ${this.formatTime(this.score)}`);
    this.gameOverWaveText.setText(`Werv: ${this.waveCounter}`);
    this.gameOverText.setText('DADGUMMIT! YA FRIGGIN DIED').setFontStyle('bold').setFontFamily('Arial').setColor('#39FF14').setDepth(1000);
    this.resetText.setText('I bet you eat crayons. (PRESS SPACE)').setFontStyle('bold').setFontFamily('Arial').setColor('#ff0000').setDepth(1000);
    this.updateHighScore();
    this.updateHighestWave();
     this.stopAllAsteroids();
    
}

        
    }
}

            updateHighestWave() {
                if (this.waveCounter > this.highestWave) {
                    this.highestWave = this.waveCounter;
                    this.highestWaveText.setText(`Highest Werv: ${this.highestWave}`);
                    localStorage.setItem('hardModeHighestWave', this.highestWave.toString());
                }
            }

            handlePowerUpCollision(ship, powerUp) {
            if (!ship.powerupActive && !ship.shieldActive) { // Check if neither power-up is active
                ship.boostSpeed();
                this.powerupTimer = 5;
                powerUp.disableBody(true, true);
                this.powerupSound.play();
            }
        }

            handleSlowdownPowerUpCollision(ship, slowdownPowerUp) {
                if (!ship.slowdownActive) {
                    ship.slowdownAsteroids();
                    this.slowdownPowerupTimer = 5;
                    slowdownPowerUp.disableBody(true, true);
this.slowdownSound.play();
                }
            }

           handleShieldPowerUpCollision(ship, shieldPowerUp) {
            if (!ship.powerupActive && !ship.shieldActive) { // Check if neither power-up is active
                ship.activateShield();
                this.shieldPowerupTimer = 5;
                shieldPowerUp.disableBody(true, true);
                // Play shield power-up pickup sound
                const shieldPickupSound = this.sound.add('shield-pickup-sound', { volume: 1 });
                shieldPickupSound.play();
            }
        }

            createAsteroids(count) {
    this.asteroids = [];
    if (this.waveSound) {
        this.waveSound.play();
    } else {
        console.error("Wave sound not loaded or initialized.");
    }

    for (let i = 0; i < count; i++) {
        let x, y;
        do {
            x = Phaser.Math.Between(0, this.game.config.width);
            y = Phaser.Math.Between(0, this.game.config.height);
        } while (Phaser.Math.Distance.Between(x, y, this.spaceship.x, this.spaceship.y) < 220); // Ensure asteroid spawns at least 200 pixels away from the spaceship

        const spawnFromTop = this.alternateSpawn;
        const asteroid = new this.asteroidClass(this, x, y, 'sasteroid');
        this.asteroids.push(asteroid);
        this.physics.add.existing(asteroid);
        this.physics.add.overlap(this.spaceship, asteroid, this.handleShipCollision, null, this);
        this.alternateSpawn = !this.alternateSpawn;
    }
}

createSpaceship() {
    this.spaceship = new Spaceship(this, this.game.config.width / 2, this.game.config.height / 2, 'spaceships');
    if (this.scene.key === 'secret-game') {
        this.spaceship.speed = 250; // Adjust the speed value as needed
        class HardModeAsteroid extends Asteroid {
            start(spawnFromTop) {
                const velocityY = spawnFromTop ? Phaser.Math.Between(240, 300) : Phaser.Math.Between(-300, -240);
                this.body.setVelocity(Phaser.Math.Between(-300, 240), velocityY);
                this.isSpinning = true; // Set the spinning flag to true when the round starts
            }

            preUpdate(time, delta) {
                if (this.isSpinning) {
                    this.angle += this.rotationSpeed * delta / 1000; // Update the rotation angle based on the rotation speed and delta time
                }
            }
        }
        this.asteroidClass = HardModeAsteroid;
    }
}

            createPowerUps(count) {
                this.powerUps = [];
                for (let i = 0; i < count; i++) {
                    const x = Phaser.Math.Between(0, this.game.config.width);
                    const spawnFromTop = this.alternateSpawn;
                    const y = spawnFromTop ? -100 : this.game.config.height + 100;
                    const powerUp = new PowerUp(this, x, y, 'spower-up');
                    this.powerUps.push(powerUp);
                    this.physics.add.existing(powerUp);
                    this.alternateSpawn = !this.alternateSpawn;
                }
            }

            createSlowdownPowerUps(count) {
                this.slowdownPowerUps = [];
                for (let i = 0; i < count; i++) {
                    const x = Phaser.Math.Between(0, this.game.config.width);
                    const spawnFromTop = this.alternateSpawn;
                    const y = spawnFromTop ? -100 : this.game.config.height + 100;
                    const slowdownPowerUp = new SlowdownPowerUp(this, x, y, 'sslowdown-power-up');
                    this.slowdownPowerUps.push(slowdownPowerUp);
                    this.physics.add.existing(slowdownPowerUp);
                    this.alternateSpawn = !this.alternateSpawn;
                }
            }

            createShieldPowerUps(count) {
                this.shieldPowerUps = [];
                for (let i = 0; i < count; i++) {
                    const x = Phaser.Math.Between(0, this.game.config.width);
                    const spawnFromTop = this.alternateSpawn;
                    const y = spawnFromTop ? -100 : this.game.config.height + 100;
                    const shieldPowerUp = new ShieldPowerUp(this, x, y, 'sshield');
                    this.shieldPowerUps.push(shieldPowerUp);
                    this.physics.add.existing(shieldPowerUp);
                    this.alternateSpawn = !this.alternateSpawn;
                }
            }

            createInstructionsText() {
                this.instructionsText = this.add.text(this.game.config.width / 2, this.game.config.height / 2, 
                    'If you got this far you dont need the damn instructions. \n\n' +
                    
                     'Press Numpad2 to return to Main Menu.\n' +
                    'Press I to close this menu.', 
                    { fontSize: '16px', fill: '#ff0000' }
                ).setFontStyle('bold').setOrigin(0.5,-0.6).setVisible(false);
            }

            handlePauseKey(event) {
                if (!this.gameOver) {
                    if (!this.isPaused) {
                        if (event.code === 'Numpad0') {
                            this.pauseGame();
                        } else if (event.code === 'KeyI') {
                            this.showInstructions();
                        }
                    } else {
                        if (event.code === 'Numpad0') {
                            this.resumeGame();
                        }
                    }
                }
            }

            showInstructions() {
                this.pauseText.setVisible(false);
                this.pauseInstructionText.setVisible(false);
                this.instructionsText.setVisible(true);
            }

            createPowerupText() {
                this.powerupText = this.add.text(this.game.config.width / 2, 16, '', { fontSize: '24px', fill: '#00ff00' }).setFontStyle('bold').setOrigin(0.5, 0).setDepth(1000);
            }

            createSlowdownPowerupText() {
                this.slowdownPowerupText = this.add.text(this.game.config.width / 2, 48, '', { fontSize: '24px', fill: '#ff0000' }).setFontStyle('bold').setOrigin(0.5, 0).setDepth(1000);
            }

            createGameOverText() {
                this.gameOverText = this.add.text(this.game.config.width / 2, this.game.config.height / 2 + 100, '', { fontSize: '48px', fill: '#00ff00' }).setOrigin(0.5).setDepth(1000);
            }

            createResetText() {
                this.resetText = this.add.text(this.game.config.width / 2, this.game.config.height / 2 + 150, '', { fontSize: '24px', fill: '#00ff00' }).setOrigin(0.5).setDepth(1000);
            }

            createStartText() {
                this.startText = this.add.text(this.game.config.width / 2, this.game.config.height / 2 - 100, 'Move to start!', { fontSize: '32px', fill: '#ffffff' }).setFontStyle('bold').setOrigin(0.5).setDepth(1000);
                this.arrowKeysText = this.add.text(this.game.config.width / 2, this.game.config.height / 2 - 50, '(Use ARROW KEYS to move.)', { fontSize: '24px', fill: '#ff0000' }).setOrigin(0.5).setDepth(1000);
            }

            createHighScoreText() {
                this.highScoreText = this.add.text(this.game.config.width / 2, this.game.config.height - 48, `High Scer: ${this.formatTime(this.highScore)}`, { fontSize: '12px', fill: '#ff0000' }).setFontStyle('bold').setOrigin(0.5, 0).setDepth(1000);
            }

           createTimeText() {
                this.timeText = this.add.text(this.game.config.width / 2, this.game.config.height - 24, `Tiem: 00:00:00`, { fontSize: '16px', fill: '#ff0000' }).setFontStyle('bold').setOrigin(0.5, 38.4).setDepth(1000);
            }

            createCountdownText() {
                this.countdownText = this.add.text(this.game.config.width / 2, this.game.config.height / 2, '', { fontSize: '30px', fill: '#ff0000' }).setFontStyle('bold').setOrigin(0.5, 4).setDepth(1000);
            }

            createWaveText() {
            // Positioning just above the high score text
            this.waveText = this.add.text(this.game.config.width / 2, this.game.config.height - 70, `Werv: ${this.waveCounter}`, { fontSize: '34px', fill: '#ff0000' }).setFontStyle('bold').setOrigin(-1.3, -0.3).setDepth(1000);
        }

        createHighestWaveText() {
            // Positioning just above the wave text
            this.highestWaveText = this.add.text(this.game.config.width / 2, this.game.config.height - 90, `Highest Werv: ${this.highestWave}`, { fontSize: '18px', fill: '#ff0000' }).setOrigin(0.5, -3.3).setDepth(1000);
        }

        createHighScoreText() {
            // Keeping the high score text at the bottom middle of the screen
            this.highScoreText = this.add.text(this.game.config.width / 2, this.game.config.height - 50, `Highest Scer: ${this.formatTime(this.highScore)}`, { fontSize: '17px', fill: '#ff0000' }).setOrigin(0.5, -2).setDepth(1000);
        }


            createGameOverTimeText() {
                this.gameOverTimeText = this.add.text(this.game.config.width / 2, this.game.config.height / 2 - 50, '', { fontSize: '24px', fill: '#ff0000' }).setOrigin(0.5).setFontStyle('bold').setDepth(1000);
            }

            createGameOverWaveText() {
                this.gameOverWaveText = this.add.text(this.game.config.width / 2, this.game.config.height / 2, '', { fontSize: '24px', fill: '#ff0000' }).setOrigin(0.5).setFontStyle('bold').setDepth(1000);
            }

            createPauseText() {
                this.pauseText = this.add.text(this.game.config.width / 2, this.game.config.height / 2, 'Puase', { fontSize: '220px', fill: '#ff0000' }).setOrigin(0.5).setFontStyle('bold').setVisible(false).setDepth(1000);
                this.pauseInstructionText = this.add.text(this.game.config.width / 2, this.game.config.height / 2 + 30, 
                    'Press I for Instructions', 
                    { fontSize: '28px', fill: '#ffffff' }
                ).setOrigin(0.5).setVisible(false);
            }

            createPauseInstructionText() {
                this.pauseInstructionText = this.add.text(10, this.game.config.height - 24, 'Numpad0 = PerZD', { fontSize: '13px', fill: '#ff0000' }).setFontStyle('bold').setVisible(true).setDepth(1000);
            }

            createToggleMusicText() {
                this.toggleMusicText = this.add.text(this.game.config.width - 10, this.game.config.height - 10, '', { fontSize: '13px', fill: '#ff0000' }).setFontStyle('bold').setOrigin(1, 1).setDepth(1000);
            }

            handleMuteKey() {
                this.isMuted = !this.isMuted;
                this.backgroundMusic.setMute(this.isMuted);
            }

            handleSpaceKey() {
                if (this.gameOver) {
                    this.resetGame();
                }
            }

            handleArrowKey() {
                if (!this.gameStarted && !this.isPaused) {
                    this.startGame();
                }
            }

            handlePauseKey() {
                if (!this.gameOver) {
                    if (!this.isPaused) {
                        this.pauseGame();
                    } else {
                        this.resumeGame();
                    }
                }
            }

            pauseGame() {
                this.isPaused = true;
                this.physics.pause();
                this.pauseText.setVisible(true);
                this.pauseInstructionText.setText('Numpad0 = Unpause Numpad2 = Main Menu').setVisible(true);
                this.instructionsText.setVisible(false);
                this.pauseSound.play();
            }

            resumeGame() {
                this.isPaused = false;
                this.physics.resume();
                this.pauseText.setVisible(false);
                this.pauseInstructionText.setText('Press Numpad0 to PAUSE').setVisible(true);
                this.instructionsText.setVisible(false);
                this.pauseSound.play();
            }

            resetGame() {
                this.scene.restart();
                this.gameOver = false;
                this.gameStarted = false;
                this.score = 0;
                this.powerupTimer = null;
                this.slowdownPowerupTimer = null;
                this.asteroidsTimer = 0;
                this.powerupsTimer = 0;
                this.alternateSpawn = true;
                this.countdownTimer = null;
                this.waveCounter = 1;
                this.resumeGame();
            }

            startGame() {
                this.gameStarted = true;
                this.startText.setVisible(false);
                this.arrowKeysText.setVisible(false);
                this.resetText.setText('');

                this.asteroids.forEach(asteroid => asteroid.start(this.alternateSpawn));
                this.powerUps.forEach(powerUp => powerUp.start(!this.alternateSpawn));
                this.slowdownPowerUps.forEach(slowdownPowerUp => slowdownPowerUp.start(!this.alternateSpawn));
                this.shieldPowerUps.forEach(shieldPowerUp => shieldPowerUp.start(!this.alternateSpawn));  // Start shield power-ups
                this.alternateSpawn = !this.alternateSpawn;
            }

            formatTime(millis) {
                const minutes = Math.floor(millis / 60000);
                const seconds = Math.floor((millis % 60000) / 1000);
                const milliseconds = Math.floor((millis % 1000) / 10);
                return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}:${milliseconds.toString().padStart(2, '0')}`;
            }

            updateHighScore() {
                if (this.score > this.highScore) {
                    this.highScore = this.score;
                    this.highScoreText.setText(`High Score: ${this.formatTime(this.highScore)}`);
                     localStorage.setItem('hardModeHighScore', this.highScore.toString());
                }
            }

            update(time, delta) {
            if (this.gameStarted && !this.gameOver && !this.isPaused) {
                this.spaceship.moveShip();

                this.score += delta;
                this.timeText.setText(`Time: ${this.formatTime(this.score)}`);

                this.asteroidsTimer += delta;
                if (this.asteroidsTimer >= 7000) {
                    if (!this.countdownTimer) {
                        this.countdownTimer = 3000;
                    }
                }

                if (this.countdownTimer) {
                    this.countdownTimer -= delta;
                    const countdownSeconds = Math.ceil(this.countdownTimer / 1000);
                    this.countdownText.setText(`Next Wave Incoming: ${countdownSeconds}`);

                    if (this.countdownTimer <= 0) {
                        this.countdownTimer = null;
                        this.countdownText.setText('');
                        this.asteroidsTimer = 0;
                        this.createAsteroids(3);
                        this.asteroids.forEach(asteroid => asteroid.start(this.alternateSpawn));
                        this.alternateSpawn = !this.alternateSpawn;
                        this.waveCounter++;
                        this.waveText.setText(`Wave: ${this.waveCounter}`);
                        if (this.waveCounter >= 5 && (this.waveCounter - 5) % 5 === 0) {
                            // Start shield power-ups on wave 3 and every 3 waves after that
                            this.createShieldPowerUps(1);
                            this.shieldPowerUps.forEach(shieldPowerUp => shieldPowerUp.start(!this.alternateSpawn));
                            this.physics.add.overlap(this.spaceship, this.shieldPowerUps, this.handleShieldPowerUpCollision, null, this);
                        }
                    }
                }

                this.powerupsTimer += delta;
                if (this.powerupsTimer >= 8000) {
                    this.powerupsTimer = 0;
                    this.createPowerUps(1);
                    this.createSlowdownPowerUps(1);
                    this.powerUps.forEach(powerUp => powerUp.start(!this.alternateSpawn));
                    this.slowdownPowerUps.forEach(slowdownPowerUp => slowdownPowerUp.start(!this.alternateSpawn));
                    this.physics.add.overlap(this.spaceship, this.powerUps, this.handlePowerUpCollision, null, this);
                    this.physics.add.overlap(this.spaceship, this.slowdownPowerUps, this.handleSlowdownPowerUpCollision, null, this);
                }

                if (this.powerupTimer > 0) {
                    this.powerupText.setText(`Speed Power-Up: ${this.powerupTimer.toFixed(1)} sec`);
                    this.powerupTimer -= delta / 800;
                } else {
                    this.powerupText.setText('');
                }

                if (this.slowdownPowerupTimer > 0) {
                    this.slowdownPowerupText.setText(`Slowdown Power-up: ${this.slowdownPowerupTimer.toFixed(1)} sec`);
                    this.slowdownPowerupTimer -= delta / 1000;
                } else {
                    this.slowdownPowerupText.setText('');
                }

                if (this.shieldPowerupTimer > 0) {
                    this.shieldPowerupText.setText(`Shield Power-Up: ${this.shieldPowerupTimer.toFixed(1)} sec`);
                    this.shieldPowerupTimer -= delta / 1000;
                } else {
                    this.shieldPowerupText.setText('');
                }
            }
        }}
    

       // Normal Mode Game Scene
        class NormalMode extends Phaser.Scene {
            constructor() {
                super('normal-mode');
                this.asteroids = [];
                this.powerUps = [];
                this.slowdownPowerUps = [];
                this.shieldPowerUps = [];
                this.spaceship = null;
                this.score = 0;
                this.gameOverText = null;
                this.resetText = null;
                this.powerupTimer = null;
                this.powerupText = null;
                this.slowdownPowerupText = null;
                this.shieldPowerupText = null;
                this.gameOver = false;
                this.gameStarted = false;
                this.asteroidsTimer = 0;
                this.powerupsTimer = 0;
                this.alternateSpawn = true;
                this.highScore = 0;
                this.highScoreText = null;
                this.timeText = null;
                this.countdownText = null;
                this.waveCounter = 1;
                this.waveText = null;
                this.highestWaveText = null;
                this.highestWave = 1;
                this.gameOverTimeText = null;
                this.gameOverWaveText = null;
                this.isPaused = false;
                this.pauseText = null;
                this.pauseInstructionText = null;
                this.backgroundMusic = null;
                this.isMuted = false;
                this.toggleMusicText = null;
                this.powerupSound = null;
                this.deathSound = null;
                this.pauseSound = null;
                this.waveSound = null;
                this.slowdownSound = null; // Add this line
                this.debugGraphics = null; // Add this line to store the debug graphics object
    
                
                
            }stopAllAsteroids() {
    this.physics.world.bodies.entries.forEach(body => {
        if (body.gameObject instanceof Asteroid) {
            body.gameObject.stopSpinning();
        }
    });
}
            toggleMusic() {
    this.isMuted = !this.isMuted;
    this.backgroundMusic.setMute(this.isMuted);
    this.musicToggleText.setText(this.isMuted ? 'Music: OFF' : 'Music: ON');
}

            preload() {
                this.load.image('asteroid', 'https://play.rosebud.ai/assets/spikey red ball.png?OSSI');
                this.load.image('power-up', 'https://play.rosebud.ai/assets/award3.png?XUO7');
                this.load.image('slowdown-power-up', 'https://play.rosebud.ai/assets/spikes.png?PtGJ');
                this.load.image('spaceship', 'https://play.rosebud.ai/assets/54e593a8-7f75-48dc-a19a-feb20e9e384e.png?foTt');
                this.load.image('gold-tile', 'https://play.rosebud.ai/assets/gold_tile_32.png?RmBs');
                this.load.image('bbackground', 'https://play.rosebud.ai/assets/create a dark stage background.png?GQx0');
                this.load.image('shield', 'https://play.rosebud.ai/assets/purple shield.png?y5HT');
                this.load.image('shielded-spaceship', 'https://play.rosebud.ai/assets/54e593a8-7f75-48dc-a19a-feb20e9e384e2.png?ycim');
                this.load.audio('background-music', 'https://play.rosebud.ai/assets/BGMB.mp3?ZrVI');
                this.load.audio('powerup-sound', 'https://play.rosebud.ai/assets/SPEED2.mp3?2ry4');
                this.load.audio('death-sound', 'https://play.rosebud.ai/assets/splosion.mp3?bHiP');
                this.load.audio('pause-sound', 'https://play.rosebud.ai/assets/WAV_Coin_Collect.wav.wav?p94g');
                this.load.audio('wave-sound', 'https://play.rosebud.ai/assets/WAV_Enemy_Stomped_On.wav.wav?HWdM');
                this.load.audio('shield-pickup-sound', 'https://play.rosebud.ai/assets/sword-slash-with-metal-shield-impact-185433.mp3?d5p3');
                this.load.audio('metal-dagger-hit', 'https://play.rosebud.ai/assets/splosion.mp3?bHiP');
                this.load.audio('slowdown-sound', 'https://play.rosebud.ai/assets/Slowdown.mp3?F44a'); // Add this line
            }

             create(data) {
        if (data && data.isMuted !== undefined) {
            this.isMuted = data.isMuted;
        }
                this.background = this.add.image(0.2,0, 'bbackground').setOrigin(0);
this.background.setDisplaySize(800, 650);
this.musicToggleText = this.add.text(770, 590, this.isMuted ? 'Music: OFF' : 'Music: ON', { fontSize: '16px', fill: '#ffffff' }).setFontStyle('bold').setOrigin(1, 1).setInteractive({ useHandCursor: true }).setDepth(1000);
this.musicToggleText.on('pointerdown', this.toggleMusic, this);
                this.createSpaceship();
                this.createAsteroids(5);
                this.createPowerUps(2);
                this.createSlowdownPowerUps(1);
                this.createShieldPowerUps(0);
                this.createPowerupText();
                this.createSlowdownPowerupText();
                const storedNormalModeHighScore = localStorage.getItem('normalModeHighScore');
this.highScore = storedNormalModeHighScore ? parseInt(storedNormalModeHighScore, 0) : 0;

const storedNormalModeHighestWave = localStorage.getItem('normalModeHighestWave');
this.highestWave = storedNormalModeHighestWave ? parseInt(storedNormalModeHighestWave, 0) : 0;
                this.createGameOverText();
                this.createResetText();
                this.createStartText();
                this.createHighScoreText();
                this.createTimeText();
                this.shieldPowerupText = this.add.text(this.game.config.width / 2, 80, '', { fontSize: '24px', fill: '#800080' }).setFontStyle('bold').setOrigin(0.5, 0).setDepth(1000); // Initialize shieldPowerupText
                this.createCountdownText();
                this.createWaveText();
                this.createHighestWaveText();
                this.createGameOverTimeText();
                this.createGameOverWaveText();
                this.createPauseText();
                this.createPauseInstructionText();
                this.createToggleMusicText();
                this.createInstructionsText();
                this.backgroundMusic = this.sound.add('background-music', { loop: true });
                if (!this.isMuted) {
                    this.backgroundMusic.play();
                }
                this.backgroundMusic.setVolume(0.2);
                this.powerupSound = this.sound.add('powerup-sound');
                this.powerupSound.setVolume(1);
                this.deathSound = this.sound.add('death-sound');
                this.deathSound.setVolume(0.35);
                this.pauseSound = this.sound.add('pause-sound');
                this.pauseSound.setVolume(0.1);
                this.waveSound = this.sound.add('wave-sound');
                this.waveSound.setVolume(0.2);
                this.slowdownSound = this.sound.add('slowdown-sound'); // Add this line
                this.slowdownSound.setVolume(0.8); // Set the volume for the slowdown sound

                this.physics.add.overlap(this.spaceship, this.asteroids, this.handleShipCollision, null, this, (ship, asteroid) => {
                    const shipBounds = ship.getBounds();
                    const asteroidBounds = asteroid.getBounds();
                    const overlap = Phaser.Geom.Intersects.RectangleToRectangle(shipBounds, asteroidBounds);

                    shipBounds.inflate(15);// ship collision increase for closer collision
                    asteroidBounds.inflate(15);

                    return Phaser.Geom.Intersects.RectangleToRectangle(shipBounds, asteroidBounds);
                });
// Create the debug graphics object
        this.debugGraphics = this.physics.world.createDebugGraphic();
        this.debugGraphics.setVisible(false); // Initially hide the debug graphics
          // Add a key listener to refresh the entire game when Numpad 2 is pressed
        this.input.keyboard.on('keydown-NUMPAD_TWO', this.refreshGame, this);

        // Add a key listener to toggle the debug graphics visibility
        this.input.keyboard.on('keydown-D', () => {
            this.debugGraphics.setVisible(!this.debugGraphics.visible);
        });
                this.physics.add.overlap(this.spaceship, this.powerUps, this.handlePowerUpCollision, null, this);
                this.physics.add.overlap(this.spaceship, this.slowdownPowerUps, this.handleSlowdownPowerUpCollision, null, this);
                this.physics.add.overlap(this.spaceship, this.shieldPowerUps, this.handleShieldPowerUpCollision, null, this);  // Add overlap for shield power-ups

                this.input.keyboard.on('keydown-SPACE', this.handleSpaceKey, this);
                this.input.keyboard.on('keydown-LEFT', this.handleArrowKey, this);
                this.input.keyboard.on('keydown-RIGHT', this.handleArrowKey, this);
                this.input.keyboard.on('keydown-UP', this.handleArrowKey, this);
                this.input.keyboard.on('keydown-DOWN', this.handleArrowKey, this);
                this.input.keyboard.on('keydown-NUMPAD_ZERO', this.handlePauseKey, this);
                this.input.keyboard.on('keydown-NUMPAD_ONE', this.handleMuteKey, this); 
                this.input.keyboard.on('keydown-I', this.handleInstructionsKey, this);
                this.input.keyboard.on('keydown-NUMPAD_TWO', this.returnToMainMenu, this); // Add key for returning to main menu
                
    

    // Define the slight shaking motion effect
    this.tweens.add({
        targets: this.background,
        y: '-=3', // Move up slightly
        duration: 714.5,
        yoyo: true,
        repeat: -1 // Repeat indefinitely
    });

            }refreshGame() {
                // Refresh the entire game
                window.location.reload();
            }

            returnToMainMenu() {
    this.backgroundMusic.stop(); // Stop the background music
    this.scene.start('main-menu');
}
            handleInstructionsKey() {
                if (this.isPaused) {
                    this.instructionsText.setVisible(!this.instructionsText.visible);
                }
            }

            handleShipCollision(ship, asteroid) {
    if (ship.shieldActive) {
        asteroid.destroy();
        // Add a check to play the sound only once
         {
            
            // Play the splosion sound
            const asteroidDestroySound = this.sound.add('metal-dagger-hit', { volume: 0.24});
            asteroidDestroySound.play();
        }
        // Don't disable the shield until its duration is over
    } else {
        const shipBounds = ship.getBounds();
        const asteroidBounds = asteroid.getBounds();

        const isColliding = Phaser.Geom.Intersects.RectangleToRectangle(shipBounds, asteroidBounds);

        if (isColliding) {
            this.gameOver = true;
            this.physics.pause();
            this.backgroundMusic.stop();
            this.deathSound.play();
            this.gameOverTimeText.setText(`Time: ${this.formatTime(this.score)}`);
            this.gameOverWaveText.setText(`Wave: ${this.waveCounter}`);
            this.gameOverText.setText('Game Over').setFontStyle('bold').setFontFamily('Arial').setColor('#ff0000');
            this.resetText.setText('Press SPACE to reset.');
            this.updateHighScore();
            this.updateHighestWave();
            if (this.gameOver) {
        
        this.stopAllAsteroids();
            
            }
        }

        
    }
}

            updateHighestWave() {
                if (this.waveCounter > this.highestWave) {
                    this.highestWave = this.waveCounter;
                    this.highestWaveText.setText(`Highest Wave: ${this.highestWave}`);
                    localStorage.setItem('normalModeHighestWave', this.highestWave.toString());
                }
            }

            handlePowerUpCollision(ship, powerUp) {
            if (!ship.powerupActive && !ship.shieldActive) { // Check if neither power-up is active
                ship.boostSpeed();
                this.powerupTimer = 5;
                powerUp.disableBody(true, true);
                this.powerupSound.play();
            }
        }

            handleSlowdownPowerUpCollision(ship, slowdownPowerUp) {
                if (!ship.slowdownActive) {
                    ship.slowdownAsteroids();
                    this.slowdownPowerupTimer = 5;
                    slowdownPowerUp.disableBody(true, true);
                    this.slowdownSound.play(); // Play the slowdown sound
                }
            }

           handleShieldPowerUpCollision(ship, shieldPowerUp) {
            if (!ship.powerupActive && !ship.shieldActive) { // Check if neither power-up is active
                ship.activateShield();
                this.shieldPowerupTimer = 5;
                shieldPowerUp.disableBody(true, true);
                // Play shield power-up pickup sound
                const shieldPickupSound = this.sound.add('shield-pickup-sound', { volume: 1 });
                shieldPickupSound.play();
            }
        }

            createSpaceship() {
                this.spaceship = new Spaceship(this, this.game.config.width / 2, this.game.config.height / 2, 'spaceship');
            }

            createAsteroids(count) {
            this.asteroids = [];
            if (this.waveSound) {
                this.waveSound.play();
            } else {
                console.error("Wave sound not loaded or initialized.");
            }

            for (let i = 0; i < count; i++) {
                let x, y;
                do {
                    x = Phaser.Math.Between(0, this.game.config.width);
                    y = Phaser.Math.Between(0, this.game.config.height);
                } while (Phaser.Math.Distance.Between(x, y, this.spaceship.x, this.spaceship.y) < 200); // Ensure asteroid spawns at least 200 pixels away from the spaceship

                const spawnFromTop = this.alternateSpawn;
                const asteroid = new Asteroid(this, x, y, 'asteroid');
                this.asteroids.push(asteroid);
                this.physics.add.existing(asteroid);
                this.physics.add.overlap(this.spaceship, asteroid, this.handleShipCollision, null, this);
                this.alternateSpawn = !this.alternateSpawn;
            }}

            createPowerUps(count) {
                this.powerUps = [];
                for (let i = 0; i < count; i++) {
                    const x = Phaser.Math.Between(0, this.game.config.width);
                    const spawnFromTop = this.alternateSpawn;
                    const y = spawnFromTop ? -100 : this.game.config.height + 100;
                    const powerUp = new PowerUp(this, x, y, 'power-up');
                    this.powerUps.push(powerUp);
                    this.physics.add.existing(powerUp);
                    this.alternateSpawn = !this.alternateSpawn;
                }
            }

            createSlowdownPowerUps(count) {
                this.slowdownPowerUps = [];
                for (let i = 0; i < count; i++) {
                    const x = Phaser.Math.Between(0, this.game.config.width);
                    const spawnFromTop = this.alternateSpawn;
                    const y = spawnFromTop ? -100 : this.game.config.height + 100;
                    const slowdownPowerUp = new SlowdownPowerUp(this, x, y, 'slowdown-power-up');
                    this.slowdownPowerUps.push(slowdownPowerUp);
                    this.physics.add.existing(slowdownPowerUp);
                    this.alternateSpawn = !this.alternateSpawn;
                }
            }

            createShieldPowerUps(count) {
                this.shieldPowerUps = [];
                for (let i = 0; i < count; i++) {
                    const x = Phaser.Math.Between(0, this.game.config.width);
                    const spawnFromTop = this.alternateSpawn;
                    const y = spawnFromTop ? -100 : this.game.config.height + 100;
                    const shieldPowerUp = new ShieldPowerUp(this, x, y, 'shield');
                    this.shieldPowerUps.push(shieldPowerUp);
                    this.physics.add.existing(shieldPowerUp);
                    this.alternateSpawn = !this.alternateSpawn;
                }
            }

            createInstructionsText() {
                this.instructionsText = this.add.text(this.game.config.width / 2, this.game.config.height / 2, 
                    'Instructions:\n\n' +
                    'Use ARROW KEYS to move.\n' +
                    'Dodge enemies.\n' +
                    'Collect Power-Ups!\n' +
                    'Press SPACE to start or reset the game.\n' +
                    'Press Numpad0 to PAUSE/UNPAUSE.\n' +
                    'Press Numpad1 to toggle music.\n' +
                     'Press Numpad2 to return to Main Menu.\n' +
                    'Press I to close this menu.', 
                    { fontSize: '16px', fill: '#ffffff' }
                ).setFontStyle('bold').setOrigin(0.5,-0.6).setVisible(false);
            }

            handlePauseKey(event) {
                if (!this.gameOver) {
                    if (!this.isPaused) {
                        if (event.code === 'Numpad0') {
                            this.pauseGame();
                        } else if (event.code === 'KeyI') {
                            this.showInstructions();
                        }
                    } else {
                        if (event.code === 'Numpad0') {
                            this.resumeGame();
                        }
                    }
                }
            }

            showInstructions() {
                this.pauseText.setVisible(false);
                this.pauseInstructionText.setVisible(false);
                this.instructionsText.setVisible(true);
            }

            createPowerupText() {
                this.powerupText = this.add.text(this.game.config.width / 2, 16, '', { fontSize: '24px', fill: '#00ff00' }).setFontStyle('bold').setOrigin(0.5, 0).setDepth(1000);
            }

            createSlowdownPowerupText() {
                this.slowdownPowerupText = this.add.text(this.game.config.width / 2, 48, '', { fontSize: '24px', fill: '#ff0000' }).setFontStyle('bold').setOrigin(0.5, 0).setDepth(1000);
            }

            createGameOverText() {
                this.gameOverText = this.add.text(this.game.config.width / 2, this.game.config.height / 2 + 100, '', { fontSize: '48px', fill: '#00ff00' }).setOrigin(0.5).setDepth(1000);
            }

            createResetText() {
                this.resetText = this.add.text(this.game.config.width / 2, this.game.config.height / 2 + 150, '', { fontSize: '24px', fill: '#00ff00' }).setOrigin(0.5).setDepth(1000);
            }

            createStartText() {
                this.startText = this.add.text(this.game.config.width / 2, this.game.config.height / 2 - 100, 'Move to start!', { fontSize: '32px', fill: '#ff0000' }).setFontStyle('bold').setOrigin(0.5).setDepth(1000);
                this.arrowKeysText = this.add.text(this.game.config.width / 2, this.game.config.height / 2 - 50, '(Use ARROW KEYS to move.)', { fontSize: '24px', fill: '#00ff00' }).setOrigin(0.5).setDepth(1000);
            }

            createHighScoreText() {
                this.highScoreText = this.add.text(this.game.config.width / 2, this.game.config.height - 48, `High Score: ${this.formatTime(this.highScore)}`, { fontSize: '12px', fill: '#00ff00' }).setFontStyle('bold').setOrigin(0.5, 0).setDepth(1000);
            }

           createTimeText() {
                this.timeText = this.add.text(this.game.config.width / 2, this.game.config.height - 24, `Time: 00:00:00`, { fontSize: '16px', fill: '#ffffff' }).setFontStyle('bold').setOrigin(0.5, 38.4).setDepth(1000);
            }

            createCountdownText() {
                this.countdownText = this.add.text(this.game.config.width / 2, this.game.config.height / 2, '', { fontSize: '30px', fill: '#ff0000' }).setFontStyle('bold').setOrigin(0.5, 4).setDepth(1000);
            }

            createWaveText() {
            // Positioning just above the high score text
            this.waveText = this.add.text(this.game.config.width / 2, this.game.config.height - 70, `Wave: ${this.waveCounter}`, { fontSize: '34px', fill: '#ffffff' }).setFontStyle('bold').setOrigin(-1.5, -0.3).setDepth(1000);
        }

        createHighestWaveText() {
            // Positioning just above the wave text
            this.highestWaveText = this.add.text(this.game.config.width / 2, this.game.config.height - 90, `Highest Wave: ${this.highestWave}`, { fontSize: '18px', fill: '#00ff00' }).setOrigin(0.5, -3.3).setDepth(1000);
        }

        createHighScoreText() {
            // Keeping the high score text at the bottom middle of the screen
            this.highScoreText = this.add.text(this.game.config.width / 2, this.game.config.height - 50, `Best Time: ${this.formatTime(this.highScore)}`, { fontSize: '17px', fill: '#00ff00' }).setOrigin(0.5, -2).setDepth(1000);
        }


            createGameOverTimeText() {
                this.gameOverTimeText = this.add.text(this.game.config.width / 2, this.game.config.height / 2 - 50, '', { fontSize: '24px', fill: '#FFD700' }).setOrigin(0.5).setFontStyle('bold').setDepth(1000);
            }

            createGameOverWaveText() {
                this.gameOverWaveText = this.add.text(this.game.config.width / 2, this.game.config.height / 2, '', { fontSize: '24px', fill: '#FFD700' }).setOrigin(0.5).setFontStyle('bold').setDepth(1000);
            }

            createPauseText() {
                this.pauseText = this.add.text(this.game.config.width / 2, this.game.config.height / 2, 'PAUSED', { fontSize: '220px', fill: '#ff0000' }).setOrigin(0.5).setFontStyle('bold').setVisible(false).setDepth(1000);
                this.pauseInstructionText = this.add.text(this.game.config.width / 2, this.game.config.height / 2 + 30, 
                    'Press I for Instructions', 
                    { fontSize: '28px', fill: '#ffffff' }
                ).setOrigin(0.5).setVisible(false);
            }

            createPauseInstructionText() {
                this.pauseInstructionText = this.add.text(10, this.game.config.height - 24, 'Press Numpad0 to PAUSE', { fontSize: '13px', fill: '#ffffff' }).setFontStyle('bold').setVisible(true).setDepth(1000);
            }

            createToggleMusicText() {
                this.toggleMusicText = this.add.text(this.game.config.width - 10, this.game.config.height - 10, '', { fontSize: '13px', fill: '#ff0000' }).setFontStyle('bold').setOrigin(1, 1).setDepth(1000);
            }

            handleMuteKey() {
                this.isMuted = !this.isMuted;
                this.backgroundMusic.setMute(this.isMuted);
            }

            handleSpaceKey() {
                if (this.gameOver) {
                    this.resetGame();
                }
            }

            handleArrowKey() {
                if (!this.gameStarted && !this.isPaused) {
                    this.startGame();
                }
            }

            handlePauseKey() {
                if (!this.gameOver) {
                    if (!this.isPaused) {
                        this.pauseGame();
                    } else {
                        this.resumeGame();
                    }
                }
            }

            pauseGame() {
                this.isPaused = true;
                this.physics.pause();
                this.pauseText.setVisible(true);
                this.pauseInstructionText.setText('Numpad0 = Unpause Numpad2 = Main Menu').setVisible(true);
                this.instructionsText.setVisible(false);
                this.pauseSound.play();
            }

            resumeGame() {
                this.isPaused = false;
                this.physics.resume();
                this.pauseText.setVisible(false);
                this.pauseInstructionText.setText('Press Numpad0 to PAUSE').setVisible(true);
                this.instructionsText.setVisible(false);
                this.pauseSound.play();
            }

            resetGame() {
                this.scene.restart();
                this.gameOver = false;
                this.gameStarted = false;
                this.score = 0;
                this.powerupTimer = null;
                this.slowdownPowerupTimer = null;
                this.asteroidsTimer = 0;
                this.powerupsTimer = 0;
                this.alternateSpawn = true;
                this.countdownTimer = null;
                this.waveCounter = 1;
                this.resumeGame();
            }

            startGame() {
                this.gameStarted = true;
                this.startText.setVisible(false);
                this.arrowKeysText.setVisible(false);
                this.resetText.setText('');

                this.asteroids.forEach(asteroid => asteroid.start(this.alternateSpawn));
                this.powerUps.forEach(powerUp => powerUp.start(!this.alternateSpawn));
                this.slowdownPowerUps.forEach(slowdownPowerUp => slowdownPowerUp.start(!this.alternateSpawn));
                this.shieldPowerUps.forEach(shieldPowerUp => shieldPowerUp.start(!this.alternateSpawn));  // Start shield power-ups
                this.alternateSpawn = !this.alternateSpawn;
            }

            formatTime(millis) {
                const minutes = Math.floor(millis / 60000);
                const seconds = Math.floor((millis % 60000) / 1000);
                const milliseconds = Math.floor((millis % 1000) / 10);
                return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}:${milliseconds.toString().padStart(2, '0')}`;
            }

            updateHighScore() {
                if (this.score > this.highScore) {
                    this.highScore = this.score;
                    this.highScoreText.setText(`High Score: ${this.formatTime(this.highScore)}`);
                     localStorage.setItem('normalModeHighScore', this.highScore.toString());
                }
            }

            update(time, delta) {
            if (this.gameStarted && !this.gameOver && !this.isPaused) {
                this.spaceship.moveShip();

                this.score += delta;
                this.timeText.setText(`Time: ${this.formatTime(this.score)}`);

                this.asteroidsTimer += delta;
                if (this.asteroidsTimer >= 7000) {
                    if (!this.countdownTimer) {
                        this.countdownTimer = 3000;
                    }
                }

                if (this.countdownTimer) {
                    this.countdownTimer -= delta;
                    const countdownSeconds = Math.ceil(this.countdownTimer / 1000);
                    this.countdownText.setText(`Next Wave Incoming: ${countdownSeconds}`);

                    if (this.countdownTimer <= 0) {
                        this.countdownTimer = null;
                        this.countdownText.setText('');
                        this.asteroidsTimer = 0;
                        this.createAsteroids(2);
                        this.asteroids.forEach(asteroid => asteroid.start(this.alternateSpawn));
                        this.alternateSpawn = !this.alternateSpawn;
                        this.waveCounter++;
                        this.waveText.setText(`Wave: ${this.waveCounter}`);
                        if (this.waveCounter >= 3 && (this.waveCounter - 2) % 2 === 0) {
                            // Start shield power-ups on wave 3 and every 3 waves after that
                            this.createShieldPowerUps(1);
                            this.shieldPowerUps.forEach(shieldPowerUp => shieldPowerUp.start(!this.alternateSpawn));
                            this.physics.add.overlap(this.spaceship, this.shieldPowerUps, this.handleShieldPowerUpCollision, null, this);
                        }
                    }
                }

                this.powerupsTimer += delta;
                if (this.powerupsTimer >= 15000) {
                    this.powerupsTimer = 0;
                    this.createPowerUps(1);
                    this.createSlowdownPowerUps(1);
                    this.powerUps.forEach(powerUp => powerUp.start(!this.alternateSpawn));
                    this.slowdownPowerUps.forEach(slowdownPowerUp => slowdownPowerUp.start(!this.alternateSpawn));
                    this.physics.add.overlap(this.spaceship, this.powerUps, this.handlePowerUpCollision, null, this);
                    this.physics.add.overlap(this.spaceship, this.slowdownPowerUps, this.handleSlowdownPowerUpCollision, null, this);
                }

                if (this.powerupTimer > 0) {
                    this.powerupText.setText(`Speed Power-Up: ${this.powerupTimer.toFixed(1)} sec`);
                    this.powerupTimer -= delta / 1000;
                } else {
                    this.powerupText.setText('');
                }

                if (this.slowdownPowerupTimer > 0) {
                    this.slowdownPowerupText.setText(`Slowdown Power-up: ${this.slowdownPowerupTimer.toFixed(1)} sec`);
                    this.slowdownPowerupTimer -= delta / 1000;
                } else {
                    this.slowdownPowerupText.setText('');
                }

                if (this.shieldPowerupTimer > 0) {
                    this.shieldPowerupText.setText(`Shield Power-Up: ${this.shieldPowerupTimer.toFixed(1)} sec`);
                    this.shieldPowerupTimer -= delta / 1000;
                } else {
                    this.shieldPowerupText.setText('');
                }
            }
        }}
        
        // Hard Mode Game Scene
        class HardMode extends Phaser.Scene {
    constructor() {
        super('hard-mode');
        this.asteroids = [];
                this.powerUps = [];
                this.slowdownPowerUps = [];
                this.shieldPowerUps = [];
                this.spaceship = null;
                this.score = 0;
                this.gameOverText = null;
                this.resetText = null;
                this.powerupTimer = null;
                this.powerupText = null;
                this.slowdownPowerupText = null;
                this.shieldPowerupText = null;
                this.gameOver = false;
                this.gameStarted = false;
                this.asteroidsTimer = 0;
                this.powerupsTimer = 0;
                this.alternateSpawn = true;
                this.highScore = 0;
                this.highScoreText = null;
                this.timeText = null;
                this.countdownText = null;
                this.waveCounter = 1;
                this.waveText = null;
                this.highestWaveText = null;
                this.highestWave = 1;
                this.gameOverTimeText = null;
                this.gameOverWaveText = null;
                this.isPaused = false;
                this.pauseText = null;
                this.pauseInstructionText = null;
                this.backgroundMusic = null;
                this.isMuted = false;
                this.toggleMusicText = null;
                this.powerupSound = null;
                this.deathSound = null;
                this.pauseSound = null;
                this.waveSound = null;
                 this.debugGraphics = null; // Add this line to store the debug graphics object
                }stopAllAsteroids() {
    this.physics.world.bodies.entries.forEach(body => {
        if (body.gameObject instanceof Asteroid) {
            body.gameObject.stopSpinning();
        }
    });
            }
toggleMusic() {
    this.isMuted = !this.isMuted;
    this.backgroundMusic.setMute(this.isMuted);
    this.musicToggleText.setText(this.isMuted ? 'Music: OFF' : 'Music: ON');
}
            preload() {
                this.load.image('asteroidh', 'https://play.rosebud.ai/assets/Death ball.png?HzpH');
                this.load.image('power-up', 'https://play.rosebud.ai/assets/blue air.png?Erl6');
                this.load.image('slowdown-power-up', 'https://play.rosebud.ai/assets/spikes.png?PtGJ');
                this.load.image('spaceshiph', 'https://play.rosebud.ai/assets/greeeeenm.png?QpBM');
                this.load.image('gold-tile', 'https://play.rosebud.ai/assets/gold_tile_32.png?RmBs');
                this.load.image('cbackground', 'https://play.rosebud.ai/assets/NEW BG.png?L83r');
                this.load.image('shield', 'https://play.rosebud.ai/assets/purple shield.png?y5HT');
                this.load.image('shielded-spaceship', 'https://play.rosebud.ai/assets/54e593a8-7f75-48dc-a19a-feb20e9e384e2.png?ycim');
                this.load.audio('background-musich', 'https://play.rosebud.ai/assets/DNB LOOP BGM.mp3?p0Sv');
                this.load.audio('powerup-sound', 'https://play.rosebud.ai/assets/SPEED2.mp3?2ry4');
                this.load.audio('death-sound', 'https://play.rosebud.ai/assets/splosion.mp3?bHiP');
                this.load.audio('pause-sound', 'https://play.rosebud.ai/assets/WAV_Coin_Collect.wav.wav?p94g');
                this.load.audio('wave-sound', 'https://play.rosebud.ai/assets/WAV_Enemy_Stomped_On.wav.wav?HWdM');
                this.load.audio('shield-pickup-sound', 'https://play.rosebud.ai/assets/sword-slash-with-metal-shield-impact-185433.mp3?d5p3');
                this.load.audio('metal-dagger-hit', 'https://play.rosebud.ai/assets/splosion.mp3?bHiP');
                this.load.audio('slowdown-sound', 'https://play.rosebud.ai/assets/Slowdown.mp3?F44a');
            }

             create(data) {
        if (data && data.isMuted !== undefined) {
            this.isMuted = data.isMuted;
        }
                this.background =this.add.image(400, 300, 'cbackground');
                this.background.setDisplaySize(800, 800);
                
this.musicToggleText = this.add.text(770, 590, this.isMuted ? 'Music: OFF' : 'Music: ON', { fontSize: '16px', fill: '#ffffff' }).setFontStyle('bold').setOrigin(1, 1).setInteractive({ useHandCursor: true }).setDepth(1000);
this.musicToggleText.on('pointerdown', this.toggleMusic, this);
                this.createSpaceship();
                this.createAsteroids(6); 
                this.createPowerUps(1);
                this.createSlowdownPowerUps(0);
                this.createShieldPowerUps(0);
                this.createPowerupText();
                this.createSlowdownPowerupText();
                const storedHardModeHighScore = localStorage.getItem('hardModeHighScore');
this.highScore = storedHardModeHighScore ? parseInt(storedHardModeHighScore, 0) : 0;

const storedHardModeHighestWave = localStorage.getItem('hardModeHighestWave');
this.highestWave = storedHardModeHighestWave ? parseInt(storedHardModeHighestWave, 0) : 0;
                this.createGameOverText();
                this.createResetText();
                this.createStartText();
                this.createHighScoreText();
                this.createTimeText();
                this.shieldPowerupText = this.add.text(this.game.config.width / 2, 80, '', { fontSize: '24px', fill: '#800080' }).setFontStyle('bold').setOrigin(0.5, 0).setDepth(1000); // Initialize shieldPowerupText
                this.createCountdownText();
                this.createWaveText();
                this.createHighestWaveText();
                this.createGameOverTimeText();
                this.createGameOverWaveText();
                this.createPauseText();
                this.createPauseInstructionText();
                this.createToggleMusicText();
                this.createInstructionsText();
                this.backgroundMusic = this.sound.add('background-musich', { loop: true });
                if (!this.isMuted) {
                    this.backgroundMusic.play();
                }
                this.backgroundMusic.setVolume(0.2);
                this.powerupSound = this.sound.add('powerup-sound');
                this.powerupSound.setVolume(1);
                this.deathSound = this.sound.add('death-sound');
                this.deathSound.setVolume(0.35);
                this.pauseSound = this.sound.add('pause-sound');
                this.pauseSound.setVolume(0.1);
                this.waveSound = this.sound.add('wave-sound');
                this.waveSound.setVolume(0.2);
                this.slowdownSound = this.sound.add('slowdown-sound');
this.slowdownSound.setVolume(0.8);

 // Create the debug graphics object
        this.debugGraphics = this.physics.world.createDebugGraphic();
        this.debugGraphics.setVisible(false); // Initially hide the debug graphics
          // Add a key listener to refresh the entire game when Numpad 2 is pressed
        this.input.keyboard.on('keydown-NUMPAD_TWO', this.refreshGame, this);

        // Add a key listener to toggle the debug graphics visibility
        this.input.keyboard.on('keydown-D', () => {
            this.debugGraphics.setVisible(!this.debugGraphics.visible);
        });

                this.physics.add.overlap(this.spaceship, this.asteroids, this.handleShipCollision, null, this, (ship, asteroid) => {
                    const shipBounds = ship.getBounds();
                    const asteroidBounds = asteroid.getBounds();
                    const overlap = Phaser.Geom.Intersects.RectangleToRectangle(shipBounds, asteroidBounds);

                    shipBounds.inflate(15);
                    asteroidBounds.inflate(15);

                    return Phaser.Geom.Intersects.RectangleToRectangle(shipBounds, asteroidBounds);
                });
                

                this.physics.add.overlap(this.spaceship, this.powerUps, this.handlePowerUpCollision, null, this);
                this.physics.add.overlap(this.spaceship, this.slowdownPowerUps, this.handleSlowdownPowerUpCollision, null, this);
                this.physics.add.overlap(this.spaceship, this.shieldPowerUps, this.handleShieldPowerUpCollision, null, this);  // Add overlap for shield power-ups

                this.input.keyboard.on('keydown-SPACE', this.handleSpaceKey, this);
                this.input.keyboard.on('keydown-LEFT', this.handleArrowKey, this);
                this.input.keyboard.on('keydown-RIGHT', this.handleArrowKey, this);
                this.input.keyboard.on('keydown-UP', this.handleArrowKey, this);
                this.input.keyboard.on('keydown-DOWN', this.handleArrowKey, this);
                this.input.keyboard.on('keydown-NUMPAD_ZERO', this.handlePauseKey, this);
                this.input.keyboard.on('keydown-NUMPAD_ONE', this.handleMuteKey, this); 
                this.input.keyboard.on('keydown-I', this.handleInstructionsKey, this);
                this.input.keyboard.on('keydown-NUMPAD_TWO', this.returnToMainMenu, this); // Add key for returning to main menu
                // Define the zoom in and out effect using tweens
    this.tweens.add({
        targets: this.background,
        scale: 1.28, // Zoom in scale
        duration: 169.6, // Duration of zoom in effect
        yoyo: true,
        repeat: -1 // Repeat indefinitely
    });

    // Define the slight shaking motion effect
    this.tweens.add({
        targets: this.background,
        y: '-=1.1', // Move up slightly
        duration: 678.4,
        yoyo: true,
        repeat: -1 // Repeat indefinitely
    });

            }refreshGame() {
                // Refresh the entire game
                window.location.reload();
            }

            returnToMainMenu() {
    this.backgroundMusic.stop(); // Stop the background music
    this.scene.start('main-menu');
}

            handleInstructionsKey() {
                if (this.isPaused) {
                    this.instructionsText.setVisible(!this.instructionsText.visible);
                }
            }

            handleShipCollision(ship, asteroid) {
    if (ship.shieldActive) {
        asteroid.destroy();
        // Add a check to play the sound only once
        
            
            // Play the splosion sound
            const asteroidDestroySound = this.sound.add('metal-dagger-hit', { volume: 0.24 });
            asteroidDestroySound.play();
        // Don't disable the shield until its duration is over
    } else {
        const shipBounds = ship.getBounds();
        const asteroidBounds = asteroid.getBounds();

        const isColliding = Phaser.Geom.Intersects.RectangleToRectangle(shipBounds, asteroidBounds);

       if (isColliding) {
    this.gameOver = true;
    this.physics.pause();
    this.backgroundMusic.stop();
    this.deathSound.play();
    this.gameOverTimeText.setText(`Time: ${this.formatTime(this.score)}`);
    this.gameOverWaveText.setText(`Wave: ${this.waveCounter}`);
    this.gameOverText.setText('Game Over').setFontStyle('bold').setFontFamily('Arial').setColor('#ff0000');
    this.resetText.setText('Press SPACE to reset.');
    this.updateHighScore();
    this.updateHighestWave();
     this.stopAllAsteroids();
    
}

        
    }
}

            updateHighestWave() {
                if (this.waveCounter > this.highestWave) {
                    this.highestWave = this.waveCounter;
                    this.highestWaveText.setText(`Highest Wave: ${this.highestWave}`);
                    localStorage.setItem('hardModeHighestWave', this.highestWave.toString());
                }
            }

            handlePowerUpCollision(ship, powerUp) {
            if (!ship.powerupActive && !ship.shieldActive) { // Check if neither power-up is active
                ship.boostSpeed();
                this.powerupTimer = 5;
                powerUp.disableBody(true, true);
                this.powerupSound.play();
            }
        }

            handleSlowdownPowerUpCollision(ship, slowdownPowerUp) {
                if (!ship.slowdownActive) {
                    ship.slowdownAsteroids();
                    this.slowdownPowerupTimer = 5;
                    slowdownPowerUp.disableBody(true, true);
this.slowdownSound.play();
                }
            }

           handleShieldPowerUpCollision(ship, shieldPowerUp) {
            if (!ship.powerupActive && !ship.shieldActive) { // Check if neither power-up is active
                ship.activateShield();
                this.shieldPowerupTimer = 5;
                shieldPowerUp.disableBody(true, true);
                // Play shield power-up pickup sound
                const shieldPickupSound = this.sound.add('shield-pickup-sound', { volume: 1 });
                shieldPickupSound.play();
            }
        }

            createAsteroids(count) {
    this.asteroids = [];
    if (this.waveSound) {
        this.waveSound.play();
    } else {
        console.error("Wave sound not loaded or initialized.");
    }

    for (let i = 0; i < count; i++) {
        let x, y;
        do {
            x = Phaser.Math.Between(0, this.game.config.width);
            y = Phaser.Math.Between(0, this.game.config.height);
        } while (Phaser.Math.Distance.Between(x, y, this.spaceship.x, this.spaceship.y) < 220); // Ensure asteroid spawns at least 200 pixels away from the spaceship

        const spawnFromTop = this.alternateSpawn;
        const asteroid = new this.asteroidClass(this, x, y, 'asteroidh');
        this.asteroids.push(asteroid);
        this.physics.add.existing(asteroid);
        this.physics.add.overlap(this.spaceship, asteroid, this.handleShipCollision, null, this);
        this.alternateSpawn = !this.alternateSpawn;
    }
}

createSpaceship() {
    this.spaceship = new Spaceship(this, this.game.config.width / 2, this.game.config.height / 2, 'spaceshiph');
    if (this.scene.key === 'hard-mode') {
        this.spaceship.speed = 250; // Adjust the speed value as needed
        class HardModeAsteroid extends Asteroid {
            start(spawnFromTop) {
                const velocityY = spawnFromTop ? Phaser.Math.Between(240, 300) : Phaser.Math.Between(-300, -240);
                this.body.setVelocity(Phaser.Math.Between(-300, 240), velocityY);
                this.isSpinning = true; // Set the spinning flag to true when the round starts
            }

            preUpdate(time, delta) {
                if (this.isSpinning) {
                    this.angle += this.rotationSpeed * delta / 1000; // Update the rotation angle based on the rotation speed and delta time
                }
            }
        }
        this.asteroidClass = HardModeAsteroid;
    }
}

            createPowerUps(count) {
                this.powerUps = [];
                for (let i = 0; i < count; i++) {
                    const x = Phaser.Math.Between(0, this.game.config.width);
                    const spawnFromTop = this.alternateSpawn;
                    const y = spawnFromTop ? -100 : this.game.config.height + 100;
                    const powerUp = new PowerUp(this, x, y, 'power-up');
                    this.powerUps.push(powerUp);
                    this.physics.add.existing(powerUp);
                    this.alternateSpawn = !this.alternateSpawn;
                }
            }

            createSlowdownPowerUps(count) {
                this.slowdownPowerUps = [];
                for (let i = 0; i < count; i++) {
                    const x = Phaser.Math.Between(0, this.game.config.width);
                    const spawnFromTop = this.alternateSpawn;
                    const y = spawnFromTop ? -100 : this.game.config.height + 100;
                    const slowdownPowerUp = new SlowdownPowerUp(this, x, y, 'slowdown-power-up');
                    this.slowdownPowerUps.push(slowdownPowerUp);
                    this.physics.add.existing(slowdownPowerUp);
                    this.alternateSpawn = !this.alternateSpawn;
                }
            }

            createShieldPowerUps(count) {
                this.shieldPowerUps = [];
                for (let i = 0; i < count; i++) {
                    const x = Phaser.Math.Between(0, this.game.config.width);
                    const spawnFromTop = this.alternateSpawn;
                    const y = spawnFromTop ? -100 : this.game.config.height + 100;
                    const shieldPowerUp = new ShieldPowerUp(this, x, y, 'shield');
                    this.shieldPowerUps.push(shieldPowerUp);
                    this.physics.add.existing(shieldPowerUp);
                    this.alternateSpawn = !this.alternateSpawn;
                }
            }

            createInstructionsText() {
                this.instructionsText = this.add.text(this.game.config.width / 2, this.game.config.height / 2, 
                    'Instructions:\n\n' +
                    'Use ARROW KEYS to move.\n' +
                    'Dodge enemies.\n' +
                    'Collect Power-Ups!\n' +
                    'Press SPACE to start or reset the game.\n' +
                    'Press Numpad0 to PAUSE/UNPAUSE.\n' +
                     'Press Numpad2 to return to Main Menu.\n' +
                    'Press I to close this menu.', 
                    { fontSize: '16px', fill: '#ffffff' }
                ).setFontStyle('bold').setOrigin(0.5,-0.6).setVisible(false);
            }

            handlePauseKey(event) {
                if (!this.gameOver) {
                    if (!this.isPaused) {
                        if (event.code === 'Numpad0') {
                            this.pauseGame();
                        } else if (event.code === 'KeyI') {
                            this.showInstructions();
                        }
                    } else {
                        if (event.code === 'Numpad0') {
                            this.resumeGame();
                        }
                    }
                }
            }

            showInstructions() {
                this.pauseText.setVisible(false);
                this.pauseInstructionText.setVisible(false);
                this.instructionsText.setVisible(true);
            }

            createPowerupText() {
                this.powerupText = this.add.text(this.game.config.width / 2, 16, '', { fontSize: '24px', fill: '#00ff00' }).setFontStyle('bold').setOrigin(0.5, 0).setDepth(1000);
            }

            createSlowdownPowerupText() {
                this.slowdownPowerupText = this.add.text(this.game.config.width / 2, 48, '', { fontSize: '24px', fill: '#ff0000' }).setFontStyle('bold').setOrigin(0.5, 0).setDepth(1000);
            }

            createGameOverText() {
                this.gameOverText = this.add.text(this.game.config.width / 2, this.game.config.height / 2 + 100, '', { fontSize: '48px', fill: '#00ff00' }).setOrigin(0.5).setDepth(1000);
            }

            createResetText() {
                this.resetText = this.add.text(this.game.config.width / 2, this.game.config.height / 2 + 150, '', { fontSize: '24px', fill: '#00ff00' }).setOrigin(0.5).setDepth(1000);
            }

            createStartText() {
                this.startText = this.add.text(this.game.config.width / 2, this.game.config.height / 2 - 100, 'Move to start!', { fontSize: '32px', fill: '#ffffff' }).setFontStyle('bold').setOrigin(0.5).setDepth(1000);
                this.arrowKeysText = this.add.text(this.game.config.width / 2, this.game.config.height / 2 - 50, '(Use ARROW KEYS to move.)', { fontSize: '24px', fill: '#00ff00' }).setOrigin(0.5).setDepth(1000);
            }

            createHighScoreText() {
                this.highScoreText = this.add.text(this.game.config.width / 2, this.game.config.height - 48, `High Score: ${this.formatTime(this.highScore)}`, { fontSize: '12px', fill: '#00ff00' }).setFontStyle('bold').setOrigin(0.5, 0).setDepth(1000);
            }

           createTimeText() {
                this.timeText = this.add.text(this.game.config.width / 2, this.game.config.height - 24, `Time: 00:00:00`, { fontSize: '16px', fill: '#ffffff' }).setFontStyle('bold').setOrigin(0.5, 38.4).setDepth(1000);
            }

            createCountdownText() {
                this.countdownText = this.add.text(this.game.config.width / 2, this.game.config.height / 2, '', { fontSize: '30px', fill: '#ffffff' }).setFontStyle('bold').setOrigin(0.5, 4).setDepth(1000);
            }

            createWaveText() {
            // Positioning just above the high score text
            this.waveText = this.add.text(this.game.config.width / 2, this.game.config.height - 70, `Wave: ${this.waveCounter}`, { fontSize: '34px', fill: '#ffffff' }).setFontStyle('bold').setOrigin(-1.5, -0.3).setDepth(1000);
        }

        createHighestWaveText() {
            // Positioning just above the wave text
            this.highestWaveText = this.add.text(this.game.config.width / 2, this.game.config.height - 90, `Highest Wave: ${this.highestWave}`, { fontSize: '18px', fill: '#00ff00' }).setOrigin(0.5, -3.3).setDepth(1000);
        }

        createHighScoreText() {
            // Keeping the high score text at the bottom middle of the screen
            this.highScoreText = this.add.text(this.game.config.width / 2, this.game.config.height - 50, `Best Time: ${this.formatTime(this.highScore)}`, { fontSize: '17px', fill: '#00ff00' }).setOrigin(0.5, -2).setDepth(1000);
        }


            createGameOverTimeText() {
                this.gameOverTimeText = this.add.text(this.game.config.width / 2, this.game.config.height / 2 - 50, '', { fontSize: '24px', fill: '#FFD700' }).setOrigin(0.5).setFontStyle('bold').setDepth(1000);
            }

            createGameOverWaveText() {
                this.gameOverWaveText = this.add.text(this.game.config.width / 2, this.game.config.height / 2, '', { fontSize: '24px', fill: '#FFD700' }).setOrigin(0.5).setFontStyle('bold').setDepth(1000);
            }

            createPauseText() {
                this.pauseText = this.add.text(this.game.config.width / 2, this.game.config.height / 2, 'PAUSED', { fontSize: '220px', fill: '#ff0000' }).setOrigin(0.5).setFontStyle('bold').setVisible(false).setDepth(1000);
                this.pauseInstructionText = this.add.text(this.game.config.width / 2, this.game.config.height / 2 + 30, 
                    'Press I for Instructions', 
                    { fontSize: '28px', fill: '#ffffff' }
                ).setOrigin(0.5).setVisible(false);
            }

            createPauseInstructionText() {
                this.pauseInstructionText = this.add.text(10, this.game.config.height - 24, 'Numpad0 = PAUSE', { fontSize: '13px', fill: '#ffffff' }).setFontStyle('bold').setVisible(true).setDepth(1000);
            }

            createToggleMusicText() {
                this.toggleMusicText = this.add.text(this.game.config.width - 10, this.game.config.height - 10, '', { fontSize: '13px', fill: '#ff0000' }).setFontStyle('bold').setOrigin(1, 1).setDepth(1000);
            }

            handleMuteKey() {
                this.isMuted = !this.isMuted;
                this.backgroundMusic.setMute(this.isMuted);
            }

            handleSpaceKey() {
                if (this.gameOver) {
                    this.resetGame();
                }
            }

            handleArrowKey() {
                if (!this.gameStarted && !this.isPaused) {
                    this.startGame();
                }
            }

            handlePauseKey() {
                if (!this.gameOver) {
                    if (!this.isPaused) {
                        this.pauseGame();
                    } else {
                        this.resumeGame();
                    }
                }
            }

            pauseGame() {
                this.isPaused = true;
                this.physics.pause();
                this.pauseText.setVisible(true);
                this.pauseInstructionText.setText('Numpad0 = Unpause Numpad2 = Main Menu').setVisible(true);
                this.instructionsText.setVisible(false);
                this.pauseSound.play();
            }

            resumeGame() {
                this.isPaused = false;
                this.physics.resume();
                this.pauseText.setVisible(false);
                this.pauseInstructionText.setText('Press Numpad0 to PAUSE').setVisible(true);
                this.instructionsText.setVisible(false);
                this.pauseSound.play();
            }

            resetGame() {
                this.scene.restart();
                this.gameOver = false;
                this.gameStarted = false;
                this.score = 0;
                this.powerupTimer = null;
                this.slowdownPowerupTimer = null;
                this.asteroidsTimer = 0;
                this.powerupsTimer = 0;
                this.alternateSpawn = true;
                this.countdownTimer = null;
                this.waveCounter = 1;
                this.resumeGame();
            }

            startGame() {
                this.gameStarted = true;
                this.startText.setVisible(false);
                this.arrowKeysText.setVisible(false);
                this.resetText.setText('');

                this.asteroids.forEach(asteroid => asteroid.start(this.alternateSpawn));
                this.powerUps.forEach(powerUp => powerUp.start(!this.alternateSpawn));
                this.slowdownPowerUps.forEach(slowdownPowerUp => slowdownPowerUp.start(!this.alternateSpawn));
                this.shieldPowerUps.forEach(shieldPowerUp => shieldPowerUp.start(!this.alternateSpawn));  // Start shield power-ups
                this.alternateSpawn = !this.alternateSpawn;
            }

            formatTime(millis) {
                const minutes = Math.floor(millis / 60000);
                const seconds = Math.floor((millis % 60000) / 1000);
                const milliseconds = Math.floor((millis % 1000) / 10);
                return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}:${milliseconds.toString().padStart(2, '0')}`;
            }

            updateHighScore() {
                if (this.score > this.highScore) {
                    this.highScore = this.score;
                    this.highScoreText.setText(`High Score: ${this.formatTime(this.highScore)}`);
                     localStorage.setItem('hardModeHighScore', this.highScore.toString());
                }
            }

            update(time, delta) {
            if (this.gameStarted && !this.gameOver && !this.isPaused) {
                this.spaceship.moveShip();

                this.score += delta;
                this.timeText.setText(`Time: ${this.formatTime(this.score)}`);

                this.asteroidsTimer += delta;
                if (this.asteroidsTimer >= 7000) {
                    if (!this.countdownTimer) {
                        this.countdownTimer = 3000;
                    }
                }

                if (this.countdownTimer) {
                    this.countdownTimer -= delta;
                    const countdownSeconds = Math.ceil(this.countdownTimer / 1000);
                    this.countdownText.setText(`Next Wave Incoming: ${countdownSeconds}`);

                    if (this.countdownTimer <= 0) {
                        this.countdownTimer = null;
                        this.countdownText.setText('');
                        this.asteroidsTimer = 0;
                        this.createAsteroids(3);
                        this.asteroids.forEach(asteroid => asteroid.start(this.alternateSpawn));
                        this.alternateSpawn = !this.alternateSpawn;
                        this.waveCounter++;
                        this.waveText.setText(`Wave: ${this.waveCounter}`);
                        if (this.waveCounter >= 5 && (this.waveCounter - 5) % 5 === 0) {
                            // Start shield power-ups on wave 3 and every 3 waves after that
                            this.createShieldPowerUps(1);
                            this.shieldPowerUps.forEach(shieldPowerUp => shieldPowerUp.start(!this.alternateSpawn));
                            this.physics.add.overlap(this.spaceship, this.shieldPowerUps, this.handleShieldPowerUpCollision, null, this);
                        }
                    }
                }

                this.powerupsTimer += delta;
                if (this.powerupsTimer >= 20000) {
                    this.powerupsTimer = 0;
                    this.createPowerUps(1);
                    this.createSlowdownPowerUps(1);
                    this.powerUps.forEach(powerUp => powerUp.start(!this.alternateSpawn));
                    this.slowdownPowerUps.forEach(slowdownPowerUp => slowdownPowerUp.start(!this.alternateSpawn));
                    this.physics.add.overlap(this.spaceship, this.powerUps, this.handlePowerUpCollision, null, this);
                    this.physics.add.overlap(this.spaceship, this.slowdownPowerUps, this.handleSlowdownPowerUpCollision, null, this);
                }

                if (this.powerupTimer > 0) {
                    this.powerupText.setText(`Speed Power-Up: ${this.powerupTimer.toFixed(1)} sec`);
                    this.powerupTimer -= delta / 1000;
                } else {
                    this.powerupText.setText('');
                }

                if (this.slowdownPowerupTimer > 0) {
                    this.slowdownPowerupText.setText(`Slowdown Power-up: ${this.slowdownPowerupTimer.toFixed(1)} sec`);
                    this.slowdownPowerupTimer -= delta / 1000;
                } else {
                    this.slowdownPowerupText.setText('');
                }

                if (this.shieldPowerupTimer > 0) {
                    this.shieldPowerupText.setText(`Shield Power-Up: ${this.shieldPowerupTimer.toFixed(1)} sec`);
                    this.shieldPowerupTimer -= delta / 1000;
                } else {
                    this.shieldPowerupText.setText('');
                }
            }
        }}
        

   // Dodger Mode Game Scene
class DodgerMode extends Phaser.Scene {
    constructor() {
        super('dodger-mode');
        this.asteroids = [];
        this.powerUps = [];
        this.slowdownPowerUps = [];
        this.shieldPowerUps = [];
        this.spaceship = null;
        this.score = 0;
        this.gameOverText = null;
        this.resetText = null;
        this.powerupTimer = null;
        this.powerupText = null;
        this.slowdownPowerupText = null;
        this.shieldPowerupText = null;
        this.gameOver = false;
        this.gameStarted = false;
        this.asteroidsTimer = 0;
        this.powerupsTimer = 0;
        this.alternateSpawn = true;
        this.highScore = 0;
        this.highScoreText = null;
        this.timeText = null;
        this.countdownText = null;
        this.waveCounter = 1;
        this.waveText = null;
        this.highestWaveText = null;
        this.highestWave = 1;
        this.gameOverTimeText = null;
        this.gameOverWaveText = null;
        this.isPaused = false;
        this.pauseText = null;
        this.pauseInstructionText = null;
        this.backgroundMusic = null;
        this.isMuted = false;
        this.toggleMusicText = null;
        this.powerupSound = null;
        this.deathSound = null;
        this.pauseSound = null;
        this.waveSound = null;
        this.debugGraphics = null; // Add this line to store the debug graphics object
    }

    stopAllAsteroids() {
        this.physics.world.bodies.entries.forEach(body => {
            if (body.gameObject instanceof Asteroid) {
                body.gameObject.stopSpinning();
            }
        });
    }

    toggleMusic() {
        this.isMuted = !this.isMuted;
        this.backgroundMusic.setMute(this.isMuted);
        this.musicToggleText.setText(this.isMuted ? 'Music: OFF' : 'Music: ON');
    }

    preload() {
        this.load.image('asteroid', 'https://play.rosebud.ai/assets/Death ball.png?HzpH');
        this.load.image('power-up', 'https://play.rosebud.ai/assets/blue air.png?Erl6');
        this.load.image('slowdown-power-up', 'https://play.rosebud.ai/assets/spikes.png?PtGJ');
        this.load.image('spaceship', 'https://play.rosebud.ai/assets/greeeeenm.png?QpBM');
        this.load.image('gold-tile', 'https://play.rosebud.ai/assets/gold_tile_32.png?RmBs');
        this.load.image('cbackground', 'https://play.rosebud.ai/assets/NEW BG.png?L83r');
        this.load.image('shield', 'https://play.rosebud.ai/assets/purple shield.png?y5HT');
        this.load.image('shielded-spaceship', 'https://play.rosebud.ai/assets/54e593a8-7f75-48dc-a19a-feb20e9e384e2.png?ycim');
        this.load.audio('background-music', 'https://play.rosebud.ai/assets/DNB LOOP BGM.mp3?p0Sv');
        this.load.audio('powerup-sound', 'https://play.rosebud.ai/assets/SPEED2.mp3?2ry4');
        this.load.audio('death-sound', 'https://play.rosebud.ai/assets/splosion.mp3?bHiP');
        this.load.audio('pause-sound', 'https://play.rosebud.ai/assets/WAV_Coin_Collect.wav.wav?p94g');
        this.load.audio('wave-sound', 'https://play.rosebud.ai/assets/WAV_Enemy_Stomped_On.wav.wav?HWdM');
        this.load.audio('shield-pickup-sound', 'https://play.rosebud.ai/assets/sword-slash-with-metal-shield-impact-185433.mp3?d5p3');
        this.load.audio('metal-dagger-hit', 'https://play.rosebud.ai/assets/splosion.mp3?bHiP');
        this.load.audio('slowdown-sound', 'https://play.rosebud.ai/assets/Slowdown.mp3?F44a');
    }

    create(data) {
        if (data && data.isMuted !== undefined) {
            this.isMuted = data.isMuted;
        }
        this.background = this.add.image(400, 300, 'cbackground');
        this.background.setDisplaySize(800, 800);

        this.musicToggleText = this.add.text(770, 590, this.isMuted ? 'Music: OFF' : 'Music: ON', { fontSize: '16px', fill: '#ffffff' }).setFontStyle('bold').setOrigin(1, 1).setInteractive({ useHandCursor: true }).setDepth(1000);
        this.musicToggleText.on('pointerdown', this.toggleMusic, this);

        this.createSpaceship();
        this.createAsteroids(6);
        this.createPowerUps(1);
        this.createSlowdownPowerUps(0);
        this.createShieldPowerUps(0);
        this.createPowerupText();
        this.createSlowdownPowerupText();

        const storedDodgerModeHighScore = localStorage.getItem('dodgerModeHighScore');
        this.highScore = storedDodgerModeHighScore ? parseInt(storedDodgerModeHighScore, 10) : 0;

        const storedDodgerModeHighestWave = localStorage.getItem('dodgerModeHighestWave');
        this.highestWave = storedDodgerModeHighestWave ? parseInt(storedDodgerModeHighestWave, 10) : 1;

        this.createGameOverText();
        this.createResetText();
        this.createStartText();
        this.createHighScoreText();
        this.createTimeText();
        this.shieldPowerupText = this.add.text(this.game.config.width / 2, 80, '', { fontSize: '24px', fill: '#800080' }).setFontStyle('bold').setOrigin(0.5, 0).setDepth(1000); // Initialize shieldPowerupText
        this.createCountdownText();
        this.createWaveText();
        this.createHighestWaveText();
        this.createHighScoreText();
        this.createGameOverTimeText();
        this.createGameOverWaveText();
        this.createPauseText();
        this.createPauseInstructionText();
        this.createToggleMusicText();
        this.createInstructionsText();

        this.backgroundMusic = this.sound.add('background-music', { loop: true });
        if (!this.isMuted) {
            this.backgroundMusic.play();
        }
        this.backgroundMusic.setVolume(0.2);

        this.powerupSound = this.sound.add('powerup-sound');
        this.powerupSound.setVolume(1);

        this.deathSound = this.sound.add('death-sound');
        this.deathSound.setVolume(0.35);

        this.pauseSound = this.sound.add('pause-sound');
        this.pauseSound.setVolume(0.1);

        this.waveSound = this.sound.add('wave-sound');
        this.waveSound.setVolume(0.2);

        this.slowdownSound = this.sound.add('slowdown-sound');
        this.slowdownSound.setVolume(0.8);

        // Create the debug graphics object
        this.debugGraphics = this.physics.world.createDebugGraphic();
        this.debugGraphics.setVisible(false); // Initially hide the debug graphics

        // Add a key listener to refresh the entire game when Numpad 2 is pressed
        this.input.keyboard.on('keydown-NUMPAD_TWO', this.refreshGame, this);

        // Add a key listener to toggle the debug graphics visibility
        this.input.keyboard.on('keydown-D', () => {
            this.debugGraphics.setVisible(!this.debugGraphics.visible);
        });

        this.physics.add.overlap(this.spaceship, this.asteroids, this.handleShipCollision, null, this, (ship, asteroid) => {
            const shipBounds = ship.getBounds();
            const asteroidBounds = asteroid.getBounds();
            const overlap = Phaser.Geom.Intersects.RectangleToRectangle(shipBounds, asteroidBounds);

            shipBounds.inflate(15);
            asteroidBounds.inflate(15);

            return Phaser.Geom.Intersects.RectangleToRectangle(shipBounds, asteroidBounds);
        });

        this.physics.add.overlap(this.spaceship, this.powerUps, this.handlePowerUpCollision, null, this);
        this.physics.add.overlap(this.spaceship, this.slowdownPowerUps, this.handleSlowdownPowerUpCollision, null, this);
        this.physics.add.overlap(this.spaceship, this.shieldPowerUps, this.handleShieldPowerUpCollision, null, this);

        this.input.keyboard.on('keydown-SPACE', this.handleSpaceKey, this);
        this.input.keyboard.on('keydown-LEFT', this.handleArrowKey, this);
        this.input.keyboard.on('keydown-RIGHT', this.handleArrowKey, this);
        this.input.keyboard.on('keydown-UP', this.handleArrowKey, this);
        this.input.keyboard.on('keydown-DOWN', this.handleArrowKey, this);
        this.input.keyboard.on('keydown-NUMPAD_ZERO', this.handlePauseKey, this);
        this.input.keyboard.on('keydown-NUMPAD_ONE', this.handleMuteKey, this);
        this.input.keyboard.on('keydown-I', this.handleInstructionsKey, this);
        this.input.keyboard.on('keydown-NUMPAD_TWO', this.returnToMainMenu, this);
    }

    refreshGame() {
        // Refresh the entire game
        window.location.reload();
    }

    returnToMainMenu() {
        this.backgroundMusic.stop(); // Stop the background music
        this.scene.start('main-menu');
    }

    handleInstructionsKey() {
        if (this.isPaused) {
            this.instructionsText.setVisible(!this.instructionsText.visible);
        }
    }

    handleShipCollision(ship, asteroid) {
        if (ship.shieldActive) {
            asteroid.destroy();
            // Add a check to play the sound only once
            if (!this.asteroidDestroySound) {
                this.asteroidDestroySound = true;
                // Play the splosion sound
                const asteroidDestroySound = this.sound.add('metal-dagger-hit', { volume: 0.24 });
                asteroidDestroySound.play();
            }
            // Don't disable the shield until its duration is over
        } else {
            const shipBounds = ship.getBounds();
            const asteroidBounds = asteroid.getBounds();

            const isColliding = Phaser.Geom.Intersects.RectangleToRectangle(shipBounds, asteroidBounds);

            if (isColliding) {
                this.gameOver = true;
                this.physics.pause();
                this.backgroundMusic.stop();
                this.deathSound.play();
                this.gameOverTimeText.setText(`Time: ${this.formatTime(this.score)}`);
                this.gameOverWaveText.setText(`Wave: ${this.waveCounter}`);
                this.gameOverText.setText('Game Over').setFontStyle('bold').setFontFamily('Arial').setColor('#ff0000');
                this.resetText.setText('Press SPACE to reset.');
                this.updateHighScore();
                this.updateHighestWave();
                this.stopAllAsteroids();
            }
        }
    }

    updateHighestWave() {
        if (this.waveCounter > this.highestWave) {
            this.highestWave = this.waveCounter;
            this.highestWaveText.setText(`Highest Wave: ${this.highestWave}`);
            localStorage.setItem('dodgerModeHighestWave', this.highestWave.toString());
        }
    }

    handlePowerUpCollision(ship, powerUp) {
        if (!ship.powerupActive && !ship.shieldActive) { // Check if neither power-up is active
            ship.boostSpeed();
            this.powerupTimer = 5;
            powerUp.disableBody(true, true);
            this.powerupSound.play();
        }
    }

    handleSlowdownPowerUpCollision(ship, slowdownPowerUp) {
        if (!ship.slowdownActive) {
            ship.slowdownAsteroids();
            this.slowdownPowerupTimer = 5;
            slowdownPowerUp.disableBody(true, true);
            this.slowdownSound.play();
        }
    }

    handleShieldPowerUpCollision(ship, shieldPowerUp) {
        if (!ship.powerupActive && !ship.shieldActive) { // Check if neither power-up is active
            ship.activateShield();
            this.shieldPowerupTimer = 5;
            shieldPowerUp.disableBody(true, true);
            // Play shield power-up pickup sound
            const shieldPickupSound = this.sound.add('shield-pickup-sound', { volume: 1 });
            shieldPickupSound.play();
        }
    }

    createAsteroids(count) {
        this.asteroids = [];
        if (this.waveSound) {
            this.waveSound.play();
        } else {
            console.error("Wave sound not loaded or initialized.");
        }

        for (let i = 0; i < count; i++) {
            let x, y;
            do {
                x = Phaser.Math.Between(0, this.game.config.width);
                y = Phaser.Math.Between(0, this.game.config.height);
            } while (Phaser.Math.Distance.Between(x, y, this.spaceship.x, this.spaceship.y) < 220); // Ensure asteroid spawns at least 200 pixels away from the spaceship

            const spawnFromTop = this.alternateSpawn;
            const asteroid = new Asteroid(this, x, y, 'asteroid');
            this.asteroids.push(asteroid);
            this.physics.add.existing(asteroid);
            this.physics.add.overlap(this.spaceship, asteroid, this.handleShipCollision, null, this);
            this.alternateSpawn = !this.alternateSpawn;
        }
    }

    createSpaceship() {
        this.spaceship = new Spaceship(this, this.game.config.width / 2, this.game.config.height / 2, 'spaceship');
    }

    createPowerUps(count) {
        this.powerUps = [];
        for (let i = 0; i < count; i++) {
            const x = Phaser.Math.Between(0, this.game.config.width);
            const spawnFromTop = this.alternateSpawn;
            const y = spawnFromTop ? -100 : this.game.config.height + 100;
            const powerUp = new PowerUp(this, x, y, 'power-up');
            this.powerUps.push(powerUp);
            this.physics.add.existing(powerUp);
            this.alternateSpawn = !this.alternateSpawn;
        }
    }

    createSlowdownPowerUps(count) {
        this.slowdownPowerUps = [];
        for (let i = 0; i < count; i++) {
            const x = Phaser.Math.Between(0, this.game.config.width);
            const spawnFromTop = this.alternateSpawn;
            const y = spawnFromTop ? -100 : this.game.config.height + 100;
            const slowdownPowerUp = new SlowdownPowerUp(this, x, y, 'slowdown-power-up');
            this.slowdownPowerUps.push(slowdownPowerUp);
            this.physics.add.existing(slowdownPowerUp);
            this.alternateSpawn = !this.alternateSpawn;
        }
    }

    createShieldPowerUps(count) {
        this.shieldPowerUps = [];
        for (let i = 0; i < count; i++) {
            const x = Phaser.Math.Between(0, this.game.config.width);
            const spawnFromTop = this.alternateSpawn;
            const y = spawnFromTop ? -100 : this.game.config.height + 100;
            const shieldPowerUp = new ShieldPowerUp(this, x, y, 'shield');
            this.shieldPowerUps.push(shieldPowerUp);
            this.physics.add.existing(shieldPowerUp);
            this.alternateSpawn = !this.alternateSpawn;
        }
    }

    createInstructionsText() {
        this.instructionsText = this.add.text(this.game.config.width / 2, this.game.config.height / 2, 
            'Instructions:\n\n' +
            'Use ARROW KEYS to move.\n' +
            'Dodge enemies.\n' +
            'Collect Power-Ups!\n' +
            'Press SPACE to start or reset the game.\n' +
            'Press Numpad0 to PAUSE/UNPAUSE.\n' +
            'Press Numpad2 to return to Main Menu.\n' +
            'Press I to close this menu.', 
            { fontSize: '16px', fill: '#ffffff' }
        ).setFontStyle('bold').setOrigin(0.5,-0.6).setVisible(false);
    }

    handlePauseKey(event) {
        if (!this.gameOver) {
            if (!this.isPaused) {
                if (event.code === 'Numpad0') {
                    this.pauseGame();
                } else if (event.code === 'KeyI') {
                    this.showInstructions();
                }
            } else {
                if (event.code === 'Numpad0') {
                    this.resumeGame();
                }
            }
        }
    }

    showInstructions() {
        this.pauseText.setVisible(false);
        this.pauseInstructionText.setVisible(false);
        this.instructionsText.setVisible(true);
    }

    createPowerupText() {
        this.powerupText = this.add.text(this.game.config.width / 2, 16, '', { fontSize: '24px', fill: '#00ff00' }).setFontStyle('bold').setOrigin(0.5, 0).setDepth(1000);
    }

    createSlowdownPowerupText() {
        this.slowdownPowerupText = this.add.text(this.game.config.width / 2, 48, '', { fontSize: '24px', fill: '#ff0000' }).setFontStyle('bold').setOrigin(0.5, 0).setDepth(1000);
    }

    createGameOverText() {
        this.gameOverText = this.add.text(this.game.config.width / 2, this.game.config.height / 2 + 100, '', { fontSize: '48px', fill: '#00ff00' }).setOrigin(0.5).setDepth(1000);
    }

    createResetText() {
        this.resetText = this.add.text(this.game.config.width / 2, this.game.config.height / 2 + 150, '', { fontSize: '24px', fill: '#00ff00' }).setOrigin(0.5).setDepth(1000);
    }

    createStartText() {
        this.startText = this.add.text(this.game.config.width / 2, this.game.config.height / 2 - 100, 'Move to start!', { fontSize: '32px', fill: '#ffffff' }).setFontStyle('bold').setOrigin(0.5).setDepth(1000);
        this.arrowKeysText = this.add.text(this.game.config.width / 2, this.game.config.height / 2 - 50, '(Use ARROW KEYS to move.)', { fontSize: '24px', fill: '#00ff00' }).setOrigin(0.5).setDepth(1000);
    }

    createHighScoreText() {
        this.highScoreText = this.add.text(this.game.config.width / 2, this.game.config.height - 48, `High Score: ${this.formatTime(this.highScore)}`, { fontSize: '12px', fill: '#00ff00' }).setFontStyle('bold').setOrigin(0.5, 0).setDepth(1000);
    }

    createTimeText() {
        this.timeText = this.add.text(this.game.config.width / 2, this.game.config.height - 24, `Time: 00:00:00`, { fontSize: '16px', fill: '#ffffff' }).setFontStyle('bold').setOrigin(0.5, 38.4).setDepth(1000);
    }

    createCountdownText() {
        this.countdownText = this.add.text(this.game.config.width / 2, this.game.config.height / 2, '', { fontSize: '30px', fill: '#ffffff' }).setFontStyle('bold').setOrigin(0.5, 4).setDepth(1000);
    }

    createWaveText() {
        // Positioning just above the high score text
        this.waveText = this.add.text(this.game.config.width / 2, this.game.config.height - 70, `Wave: ${this.waveCounter}`, { fontSize: '34px', fill: '#ffffff' }).setFontStyle('bold').setOrigin(-1.5, -0.3).setDepth(1000);
    }

    createHighestWaveText() {
        // Positioning just above the wave text
        this.highestWaveText = this.add.text(this.game.config.width / 2, this.game.config.height - 90, `Highest Wave: ${this.highestWave}`, { fontSize: '18px', fill: '#00ff00' }).setOrigin(0.5, -3.3).setDepth(1000);
    }

    createHighScoreText() {
        // Keeping the high score text at the bottom middle of the screen
        this.highScoreText = this.add.text(this.game.config.width / 2, this.game.config.height - 50, `Best Time: ${this.formatTime(this.highScore)}`, { fontSize: '17px', fill: '#00ff00' }).setOrigin(0.5, -2).setDepth(1000);
    }

    createGameOverTimeText() {
        this.gameOverTimeText = this.add.text(this.game.config.width / 2, this.game.config.height / 2 - 50, '', { fontSize: '24px', fill: '#FFD700' }).setOrigin(0.5).setFontStyle('bold').setDepth(1000);
    }

    createGameOverWaveText() {
        this.gameOverWaveText = this.add.text(this.game.config.width / 2, this.game.config.height / 2, '', { fontSize: '24px', fill: '#FFD700' }).setOrigin(0.5).setFontStyle('bold').setDepth(1000);
    }

    createPauseText() {
        this.pauseText = this.add.text(this.game.config.width / 2, this.game.config.height / 2, 'PAUSED', { fontSize: '220px', fill: '#ff0000' }).setOrigin(0.5).setFontStyle('bold').setVisible(false).setDepth(1000);
        this.pauseInstructionText = this.add.text(this.game.config.width / 2, this.game.config.height / 2 + 30, 
            'Press I for Instructions', 
            { fontSize: '28px', fill: '#ffffff' }
        ).setOrigin(0.5).setVisible(false);
    }

    createPauseInstructionText() {
        this.pauseInstructionText = this.add.text(10, this.game.config.height - 24, 'Numpad0 = PAUSE', { fontSize: '13px', fill: '#ffffff' }).setFontStyle('bold').setVisible(true).setDepth(1000);
    }

    createToggleMusicText() {
        this.toggleMusicText = this.add.text(this.game.config.width - 10, this.game.config.height - 10, '', { fontSize: '13px', fill: '#ff0000' }).setFontStyle('bold').setOrigin(1, 1).setDepth(1000);
    }

    handleMuteKey() {
        this.isMuted = !this.isMuted;
        this.backgroundMusic.setMute(this.isMuted);
    }

    handleSpaceKey() {
        if (this.gameOver) {
            this.resetGame();
        }
    }

    handleArrowKey() {
        if (!this.gameStarted && !this.isPaused) {
            this.startGame();
        }
    }

    handlePauseKey() {
        if (!this.gameOver) {
            if (!this.isPaused) {
                this.pauseGame();
            } else {
                this.resumeGame();
            }
        }
    }

    pauseGame() {
        this.isPaused = true;
        this.physics.pause();
        this.pauseText.setVisible(true);
        this.pauseInstructionText.setText('Numpad0 = Unpause Numpad2 = Main Menu').setVisible(true);
        this.instructionsText.setVisible(false);
        this.pauseSound.play();
    }

    resumeGame() {
        this.isPaused = false;
        this.physics.resume();
        this.pauseText.setVisible(false);
        this.pauseInstructionText.setText('Press Numpad0 to PAUSE').setVisible(true);
        this.instructionsText.setVisible(false);
        this.pauseSound.play();
    }

    resetGame() {
        this.scene.restart();
        this.gameOver = false;
        this.gameStarted = false;
        this.score = 0;
        this.powerupTimer = null;
        this.slowdownPowerupTimer = null;
        this.shieldPowerupTimer = null; // Reset shieldPowerupTimer
        this.asteroidsTimer = 0;
        this.powerupsTimer = 0;
        this.alternateSpawn = true;
        this.countdownTimer = null;
        this.waveCounter = 1;
        this.resumeGame();
    }

    startGame() {
        this.gameStarted = true;
        this.startText.setVisible(false);
        this.arrowKeysText.setVisible(false);
        this.resetText.setText('');

        this.asteroids.forEach(asteroid => asteroid.start(this.alternateSpawn));
        this.powerUps.forEach(powerUp => powerUp.start(!this.alternateSpawn));
        this.slowdownPowerUps.forEach(slowdownPowerUp => slowdownPowerUp.start(!this.alternateSpawn));
        this.shieldPowerUps.forEach(shieldPowerUp => shieldPowerUp.start(!this.alternateSpawn));
        this.alternateSpawn = !this.alternateSpawn;
    }

    formatTime(millis) {
        const minutes = Math.floor(millis / 60000);
        const seconds = Math.floor((millis % 60000) / 1000);
        const milliseconds = Math.floor((millis % 1000) / 10);
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}:${milliseconds.toString().padStart(2, '0')}`;
    }

    updateHighScore() {
        if (this.score > this.highScore) {
            this.highScore = this.score;
            this.highScoreText.setText(`High Score: ${this.formatTime(this.highScore)}`);
            localStorage.setItem('dodgerModeHighScore', this.highScore.toString());
        }
    }

    update(time, delta) {
        if (this.gameStarted && !this.gameOver && !this.isPaused) {
            this.spaceship.moveShip();

            this.score += delta;
            this.timeText.setText(`Time: ${this.formatTime(this.score)}`);

            this.asteroidsTimer += delta;
            if (this.asteroidsTimer >= 7000) {
                if (!this.countdownTimer) {
                    this.countdownTimer = 3000;
                }
            }

            if (this.countdownTimer) {
                this.countdownTimer -= delta;
                const countdownSeconds = Math.ceil(this.countdownTimer / 1000);
                this.countdownText.setText(`Next Wave Incoming: ${countdownSeconds}`);

                if (this.countdownTimer <= 0) {
                    this.countdownTimer = null;
                    this.countdownText.setText('');
                    this.asteroidsTimer = 0;
                    this.createAsteroids(3);
                    this.asteroids.forEach(asteroid => asteroid.start(this.alternateSpawn));
                    this.alternateSpawn = !this.alternateSpawn;
                    this.waveCounter++;
                    this.waveText.setText(`Wave: ${this.waveCounter}`);
                    if (this.waveCounter >= 5 && (this.waveCounter - 5) % 5 === 0) {
                        this.createShieldPowerUps(1);
                        this.shieldPowerUps.forEach(shieldPowerUp => shieldPowerUp.start(!this.alternateSpawn));
                        this.physics.add.overlap(this.spaceship, this.shieldPowerUps, this.handleShieldPowerUpCollision, null, this);
                    }
                }
            }

            this.powerupsTimer += delta;
            if (this.powerupsTimer >= 20000) {
                this.powerupsTimer = 0;
                this.createPowerUps(1);
                this.createSlowdownPowerUps(1);
                this.powerUps.forEach(powerUp => powerUp.start(!this.alternateSpawn));
                this.slowdownPowerUps.forEach(slowdownPowerUp => slowdownPowerUp.start(!this.alternateSpawn));
                this.physics.add.overlap(this.spaceship, this.powerUps, this.handlePowerUpCollision, null, this);
                this.physics.add.overlap(this.spaceship, this.slowdownPowerUps, this.handleSlowdownPowerUpCollision, null, this);
            }

            if (this.powerupTimer > 0) {
                this.powerupText.setText(`Speed Power-Up: ${this.powerupTimer.toFixed(1)} sec`);
                this.powerupTimer -= delta / 1000;
            } else {
                this.powerupText.setText('');
            }

            if (this.slowdownPowerupTimer > 0) {
                this.slowdownPowerupText.setText(`Slowdown Power-up: ${this.slowdownPowerupTimer.toFixed(1)} sec`);
                this.slowdownPowerupTimer -= delta / 1000;
            } else {
                this.slowdownPowerupText.setText('');
            }

            if (this.shieldPowerupTimer > 0) {
                this.shieldPowerupText.setText(`Shield Power-Up: ${this.shieldPowerupTimer.toFixed(1)} sec`);
                this.shieldPowerupTimer -= delta / 1000;
            } else {
                this.shieldPowerupText.setText('');
            }
        }
    }
}

const config = {
    type: Phaser.AUTO,
    parent: 'renderDiv',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 }
        }
    },
    scene: [MainMenu, NormalMode, HardMode,SecretGame, DodgerMode]
};

window.phaserGame = new Phaser.Game(config);