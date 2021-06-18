import Phaser from 'phaser'

import { Game } from '../consts/SceneKeys'
import { PressStart2P } from '../consts/Fonts'
import * as AudioKeys from '../consts/AudioKeys'

export default class TitleScreen extends Phaser.Scene
{
    preload()
    {

    }

    create()
    {
        const title = this.add.text(400, 200, 'Ye Olde Tennis', {
            fontFamily: PressStart2P,
            fontSize: 38
        });
        title.setOrigin(0.5, 0.5);

        this.add.text(400, 300, 'Press Space to Start', {
            fontFamily: PressStart2P
        }).setOrigin(0.5, 0.5);

        this.input.keyboard.on('keydown-SPACE', () => {
            this.scene.start(Game);
            this.sound.play(AudioKeys.PongBeep);
        })
    }
}