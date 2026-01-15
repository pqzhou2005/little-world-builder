import { _decorator, Component, UITransform, view } from 'cc';
const { ccclass } = _decorator;

@ccclass('BgCover')
export class BgCover extends Component {

  start () {
    this.apply();
    view.on('canvas-resize', this.apply, this);
  }

  onDestroy () {
    view.off('canvas-resize', this.apply, this);
  }

  apply () {
    const ui = this.getComponent(UITransform)!;
    const size = ui.contentSize;          // 1024 x 1536
    const vis = view.getVisibleSize();    // 430 x 932

    const scale = Math.max(
      vis.width / size.width,
      vis.height / size.height
    );

    this.node.setScale(scale, scale, 1);
  }
}
