import { _decorator, Component, Node, UITransform, view, Widget, Rect, Size } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('SafeAreaFitter')
export class SafeAreaFitter extends Component {
  @property(Node)
  public safeRoot: Node | null = null;

  private apply = () => {
    if (!this.safeRoot) return;

    const vis: Size = view.getVisibleSize(); // UI 坐标

    // 某些环境/版本 getSafeAreaRect 返回的就是 UI 坐标下的 Rect
    // 拿不到就退化为全屏可视区域
    // @ts-ignore
    const safe: Rect = (view as any).getSafeAreaRect
      ? // @ts-ignore
        (view as any).getSafeAreaRect()
      : new Rect(0, 0, vis.width, vis.height);

    const ui = this.safeRoot.getComponent(UITransform);
    if (!ui) return;

    // 直接使用 safeRect（假定与 vis 同坐标系）
    ui.setContentSize(safe.width, safe.height);

    // safeRect 的原点通常在左下（相对于可视区域），Canvas 中心为原点：换到中心坐标
    this.safeRoot.setPosition(
      -vis.width / 2 + safe.x + safe.width / 2,
      -vis.height / 2 + safe.y + safe.height / 2
    );

    // 刷新子 Widget
    const widgets = this.safeRoot.getComponentsInChildren(Widget);
    for (const w of widgets) w.updateAlignment();

    console.log('[SafeAreaFitter UI]', {
      vis_ui: vis,
      safe_ui: safe,
      safeRootSize: { w: ui.width, h: ui.height },
      safeRootPos: this.safeRoot.position
    });

    console.log('[Canvas check]', {
      visible: view.getVisibleSize(),
      design: view.getDesignResolutionSize(),
    });
  };

  onLoad() {
    // 下一帧执行，等 Canvas 适配稳定
    this.scheduleOnce(this.apply, 0);
    view.on('canvas-resize', this.apply, this);
    view.on('design-resolution-changed', this.apply, this);
  }

  onDestroy() {
    view.off('canvas-resize', this.apply, this);
    view.off('design-resolution-changed', this.apply, this);
  }
}
