import { _decorator, Component, Label } from 'cc';
import { ElementButton } from '../widgets/ElementButton';

const { ccclass, property } = _decorator;

@ccclass('ElementContent')
export class ElementContent extends Component {

  @property(ElementButton)
  elementButton!: ElementButton;

  @property(Label)
  descLabel!: Label;

  /**
   * 由 Popup 调用的统一入口
   */
  setup(data: {
    name: string;
    emoji?: string;
    desc: string;
  }) {
    // 初始化 ElementButton
    this.elementButton.setup(data.name, data.emoji);

    // 初始化描述
    this.descLabel.string = data.desc;
  }
}
