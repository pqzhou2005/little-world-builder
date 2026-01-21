import { _decorator, Component, Label } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('ElementButton')
export class ElementButton extends Component {

  @property(Label)
  emojiLabel!: Label;

  @property(Label)
  label!: Label;

  setup(name: string, emoji?: string) {
    this.label.string = name;
    this.emojiLabel.string = emoji ?? '';
  }
}
