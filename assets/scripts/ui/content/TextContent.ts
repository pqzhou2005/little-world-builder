import { _decorator, Component, Label } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('TextContent')
export class TextContent extends Component {
  @property(Label)
  descLabel!: Label;

  setup(text: string) {
    this.descLabel.string = text;
  }
}
