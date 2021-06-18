import Phaser from 'phaser'

import { GameBackground, GameOver } from '../consts/SceneKeys'
import * as Colors from '../consts/Colors'
import { PressStart2P } from '../consts/Fonts'
import * as AudioKeys from '../consts/AudioKeys'

const GameState = {
    Running: 'running',
    PlayerWon: 'player-won',
    AIWon: 'ai-won'
};

export default class Game extends Phaser.Scene
{
    init()
    {
        this.gameState = GameState.Running;
        this.paddleRightVelocity = new Phaser.Math.Vector2(0, 0);
        this.leftScore = 0;
        this.rightScore = 0;
        this.paused = false;
    }

    preload()
    {
        
    }

    create()
    {
        this.physics.world.setBounds(-100, 0, 1000, 500);

        this.scene.run(GameBackground);
        this.scene.sendToBack(GameBackground);

        this.ball = this.add.circle(400,250, 10, Colors.White, 1);
        this.physics.add.existing(this.ball);
        this.ball.body.setCircle(10);
        this.ball.body.setBounce(1, 1);
        this.ball.body.setCollideWorldBounds(true, 1, 1);
        this.ball.body.setMaxSpeed(500);

        this.time.delayedCall(1000, () => {
            this.resetball();
        });

        this.paddleleft = this.add.rectangle(50, 250, 30, 100, Colors.White, 1);
        this.physics.add.existing(this.paddleleft, true);

        this.paddleright = this.add.rectangle(750, 250, 30, 100, Colors.White, 1);
        this.physics.add.existing(this.paddleright, true);

        this.physics.add.collider(this.paddleleft, this.ball, this.handlePaddleBallCollision, undefined, this);
        this.physics.add.collider(this.paddleright, this.ball, this.handlePaddleBallCollision, undefined, this);

        this.physics.world.on('worldbounds', this.handleBallWorldBoundsCollision, this);
        this.ball.body.onWorldBounds = true;

        this.cursors = this.input.keyboard.createCursorKeys();

        const scorestyle = {
            fontSize: 48,
            fontFamily: PressStart2P
        };
        this.leftScoreLabel = this.add.text(300, 125, '0', scorestyle).setOrigin(0.5, 0.5);
        this.rightScoreLabel = this.add.text(500, 375, '0', scorestyle).setOrigin(0.5);
    }

    update()
    {   
        if (this.paused || this.gameState != GameState.Running)
        {
            return;
        }
        this.processPlayerInput();
        this.updateAI();
        this.checkScore();
    }

    processPlayerInput()
    {
        if (this.cursors.up.isDown)
        {
            this.paddleleft.y -= 10;
            this.paddleleft.body.updateFromGameObject();
        }
        else if (this.cursors.down.isDown)
        {
            this.paddleleft.y += 10;
            this.paddleleft.body.updateFromGameObject();
        }
    }

    checkScore()
    {
        const x = this.ball.x;
        const leftBounds = -30;
        const rightBounds = 830;
        if (x >= leftBounds && x <= rightBounds)
        {
            return;
        }

        if (this.ball.x < leftBounds)
        {
            // scored on the left side
            this.incrementRightScore();
        }
        else if (this.ball.x > rightBounds)
        {
            // scored on the right side
            this.incrementLeftScore();
        }

        const maxScore = 7;
        if (this.rightScore >= maxScore)
        {
            // Player wins
            this.gameState = GameState.PlayerWon;
        }
        else if (this.leftScore >= maxScore)
        {
            // AI wins
            this.gameState = GameState.AIWon;
        }

        if (this.gameState === GameState.Running)
        {
            this.resetball();
        }
        else
        {
            this.ball.active = false;
            this.physics.world.remove(this.ball.body);

            this.scene.stop(GameBackground);
            
            // Show game over/win screen
            this.scene.start(GameOver, {
                leftScore: this.leftScore,
                rightScore: this.rightScore
            });
        }
    }

    updateAI()
    {
        const diff = this.ball.y - this.paddleright.y;
        if (Math.abs(diff) < 10)
        {
            return;
        }

        const aiSpeed = 3;
        if (diff < 0)
        {
            // ball is above paddle
            this.paddleRightVelocity.y = -aiSpeed;
            if (this.paddleRightVelocity.y < -10)
            {
                this.paddleRightVelocity.y = -10;
            }
        }
        else if (diff > 0)
        {
            // ball is below the paddle
            this.paddleRightVelocity.y = aiSpeed;
            if (this.paddleRightVelocity.y > 10)
            {
                this.paddleRightVelocity.y = 10;
            }
        }
        this.paddleright.y += this.paddleRightVelocity.y;
        this.paddleright.body.updateFromGameObject();
    }

    incrementLeftScore()
    {
        this.leftScore += 1;
        this.leftScoreLabel.text = this.leftScore;
    }

    incrementRightScore()
    {
        this.rightScore += 1;
        this.rightScoreLabel.text = this.rightScore;
    }

    resetball()
    {
        this.ball.setPosition(400, 250);
        const angle = Phaser.Math.Between(0, 360);
        
        const vec = this.physics.velocityFromAngle(angle, 300);
        this.ball.body.setVelocity(vec.x, vec.y);
    }

    limitLeftPaddle()
    {
        const upperBounds = 0;
        const lowerBounds = 500;
        if (this.paddleleft.y < 0)
        {
            console.log('up');
        }
        else if (this.paddleleft.y > 500)
        {
            console.log('down');
        }
    }

    handlePaddleBallCollision(paddle, ball)
    {
        this.sound.play(AudioKeys.PongBeep);

        const vel = this.ball.body.velocity;
        vel.x *= 1.05;
        vel.y *= 1.05;

        this.ball.body.setVelocity(vel.x, vel.y);
    }

    handleBallWorldBoundsCollision(body, up, down, left, right)
    {
        if (left || right)
        {
            return;
        }
        this.sound.play(AudioKeys.PongPlop);
    }
}