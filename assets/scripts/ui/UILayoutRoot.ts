import { _decorator, Component, UITransform, view } from 'cc';
const { ccclass } = _decorator;

@ccclass('UILayoutRoot')
export class UILayoutRoot extends Component {
  // 设计稿基准
  public designWidth = 1080;
  public designPadding = 56;

  // 是否把 padding 限制为不超过设计稿的 56（推荐先开着）
  public clampToDesignPadding = true;

  onEnable() {
    this.apply();
  }

  start() {
    this.apply();
  }

  private apply() {
    const tr = this.getComponent(UITransform);
    if (!tr) return;

    const visibleSize = view.getVisibleSize();
    const screenW = visibleSize.width;
    // ✅ 按设计稿比例缩放
    let padding = this.designPadding * (screenW / this.designWidth);

    // ✅ 大屏不让 padding 超过设计稿值（可选）
    if (this.clampToDesignPadding) {
      padding = Math.min(this.designPadding, padding);
    }

    const contentW = Math.max(0, screenW - padding * 2);

    // ✅ 只改宽度，不碰上下位置
    tr.setContentSize(contentW, tr.height);
  }
}
