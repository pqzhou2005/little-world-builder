import { Node, UITransform, Widget, Layout, ScrollView, Size, Vec3, Vec2 } from 'cc';

const formatVec3 = (v: Vec3) => `(${v.x.toFixed(2)}, ${v.y.toFixed(2)}, ${v.z.toFixed(2)})`;
const formatVec2 = (v: Vec2) => `(${v.x.toFixed(2)}, ${v.y.toFixed(2)})`;
const formatSize = (size: Size | undefined) =>
  size ? `(${size.width.toFixed(1)}, ${size.height.toFixed(1)})` : 'null';

const layoutInfo = (layout: Layout | null) => {
  if (!layout) return 'none';
  return `type=${layout.type}, axis=${layout.startAxis}, spacingX=${layout.spacingX.toFixed(1)}, spacingY=${layout.spacingY.toFixed(1)}, cell=${formatSize(layout.cellSize)}, constraint=${layout.constraint}`;
};

const widgetInfo = (widget: Widget | null) => {
  if (!widget) return 'none';
  return `alignLeft=${widget.isAlignLeft}:${widget.left}, alignRight=${widget.isAlignRight}:${widget.right}, alignTop=${widget.isAlignTop}:${widget.top}, alignBottom=${widget.isAlignBottom}:${widget.bottom}, mode=${widget.alignMode}`;
};

const describeStage = (stage: string, tag: string, detail: string) =>
  `[UIDebug][${stage}] ${tag}: ${detail}`;

export class UIDebug {
  static dumpNode(stage: string, tag: string, node: Node | null) {
    if (!node) {
      console.log(describeStage(stage, tag, 'node=null'));
      return;
    }
    const ui = node.getComponent(UITransform);
    const widget = node.getComponent(Widget);
    const layout = node.getComponent(Layout);
    const scrollView = node.getComponent(ScrollView);
    const details = [
      `active=${node.active}`,
      `local=${formatVec3(node.position)}`,
      `world=${formatVec3(node.worldPosition)}`,
      `scale=${formatVec3(node.scale)}`,
      `size=${formatSize(ui?.contentSize)}`,
      `anchor=${ui ? formatVec2(ui.anchorPoint) : 'null'}`,
      `widget=${widgetInfo(widget)}`,
      `layout=${layoutInfo(layout)}`,
      `scrollView=${scrollView ? 'yes' : 'no'}`
    ].join(', ');
    console.log(describeStage(stage, tag, details));
  }

  static checkSamePosition(stage: string, tag: string, nodes: (Node | null)[]) {
    const map = new Map<string, string[]>();
    nodes.forEach((node, idx) => {
      if (!node) return;
      const key = `${node.position.x.toFixed(2)},${node.position.y.toFixed(2)},${node.position.z.toFixed(2)}`;
      const names = map.get(key) ?? [];
      names.push(node.name || `node#${idx}`);
      map.set(key, names);
    });
    const duplicates = Array.from(map.entries()).filter(([, names]) => names.length > 1);
    if (duplicates.length) {
      const message = duplicates
        .map(([pos, names]) => `${pos} => ${names.join(',')}`)
        .join(' | ');
      console.warn(describeStage(stage, tag, `duplicate positions ${message}`));
    } else {
      console.log(describeStage(stage, tag, `unique positions (${map.size} entries)`));
    }
  }

  static checkScrollContentSize(stage: string, tag: string, node: Node | null) {
    if (!node) {
      console.warn(describeStage(stage, tag, 'scroll content node missing'));
      return;
    }
    const ui = node.getComponent(UITransform);
    const size = ui?.contentSize;
    const detail = size ? `size=${formatSize(size)}` : 'size=null';
    console.log(describeStage(stage, tag, detail));
    if (size && size.width === 0 && size.height === 0) {
      console.warn(describeStage(stage, tag, 'content size zero'));
    }
  }
}
