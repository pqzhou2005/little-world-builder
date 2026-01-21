import { _decorator, Component, Label } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ElementCoreView')
export class ElementCoreView extends Component {

  @property(Label)
  label: Label | null = null;

  setText(text: string) {
    if (this.label) {
      this.label.string = text;
    }
  }
}
