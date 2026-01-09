import { _decorator, Component, Node, UITransform, Sprite, view } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('BgCover')
export class BgCover extends Component {
  @property(Node)
  public target: Node | null = null; // Bg

  private apply = () => {
    if (!this.target) return;

    const targetUI = this.target.getComponent(UITransform);
    const ui = this.node.getComponent(UITransform);
    const sp = this.node.getComponent(Sprite);

    if (!targetUI || !ui || !sp || !sp.spriteFrame) return;

    const W = targetUI.width;
    const H = targetUI.height;

    const os = sp.spriteFrame.originalSize;
    const texW = os.width;
    const texH = os.height;

    const scale = Math.max(W / texW, H / texH);

    ui.setContentSize(texW * scale, texH * scale);
    this.node.setPosition(0, 0);

    // 诊断：确认真的变大了
    console.log('[BgCover]', {
      target: { w: W, h: H },
      tex: { w: texW, h: texH },
      scale,
      spriteSize: { w: ui.width, h: ui.height },
    });
  };

  onEnable() {
    // 立刻算一次 + 下一帧再算一次（等 Widget 把 Bg 尺寸最终化）
    this.apply();
    this.scheduleOnce(this.apply, 0);

    view.on('canvas-resize', this.apply, this);
    view.on('design-resolution-changed', this.apply, this);
  }

  onDisable() {
    view.off('canvas-resize', this.apply, this);
    view.off('design-resolution-changed', this.apply, this);
  }
}
