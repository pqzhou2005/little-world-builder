import { _decorator, Component, Node, UITransform } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('SlotLayout')
export class SlotLayout extends Component {
  @property(Node) circle: Node | null = null;
  @property(Node) slotA: Node | null = null;
  @property(Node) slotB: Node | null = null;

  /** 间距占半径比例（0.2~0.35） */
  @property({ tooltip: 'gap = radius * gapRatio' })
  gapRatio = 0.25;

  /** y 偏移占半径比例（建议 0.12~0.2） */
  @property({ tooltip: 'y = -radius * yRatio' })
  yRatio = 0.15;

  apply() {
    if (!this.circle || !this.slotA || !this.slotB) return;

    const ui = this.circle.getComponent(UITransform);
    if (!ui) return;

    const r = ui.width * 0.5;
    const gap = r * this.gapRatio;
    const y = -r * this.yRatio;

    const x = r + gap;
    this.slotA.setPosition(-x, y);
    this.slotB.setPosition(+x, y);
  }

  onLoad() {
    this.apply();
  }
}
