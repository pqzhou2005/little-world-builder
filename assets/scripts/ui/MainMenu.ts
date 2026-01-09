import { _decorator, Component, Node, Label, director } from 'cc';
import { GameLaunchParams, LaunchMode } from '../core/GameLaunchParams';
import { GameCore } from '../core/GameCore';

const { ccclass, property } = _decorator;

@ccclass('MainMenu')
export class MainMenu extends Component {

    @property(Node)
    btnMain!: Node;

    @property(Node)
    btnRestart!: Node;

    @property(Label)
    mainLabel!: Label;

    start () {
        const hasSave = GameCore.hasSave();
        this.mainLabel.string = hasSave ? '继续游戏' : '开始游戏';
        this.btnRestart.active = hasSave;
    }

    onMainClick() {
        const chapterId = GameCore.loadChapterId();

        if (chapterId) {
            GameLaunchParams.mode = LaunchMode.Continue;
            GameLaunchParams.chapterId = chapterId;
        } else {
            GameLaunchParams.mode = LaunchMode.NewGame;
            GameLaunchParams.chapterId = 'natural';
        }

        director.loadScene('Game');
    }

    onRestartClick() {
        GameCore.clearSave();

        GameLaunchParams.mode = LaunchMode.NewGame;
        GameLaunchParams.chapterId = 'natural';

        director.loadScene('Game');
    }
}
