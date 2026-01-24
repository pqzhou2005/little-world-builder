import { _decorator, Component, Layout, Node, Size, UITransform, view } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('ElementTrayGridLayout')
export class ElementTrayGridLayout extends Component {
  // elementHeight = elementWidth / 1.05 (clamped to 72-110)
  private readonly ELEMENT_HEIGHT_MIN = 72;
  private readonly ELEMENT_HEIGHT_MAX = 110;

  // elementWidth / elementHeight ratio
  private readonly ELEMENT_WIDTH_RATIO = 1.05;

  // padding = fixed pixels
  @property
  padding = 24;
  private readonly PADDING_MIN = 8;

  // spacing = elementWidth * spacingRatio
  @property
  spacingRatio = 0.18;

  // Fixed column count for grid layout.
  private readonly COLUMN_COUNT = 4;

  @property(Node)
  buttonsRoot: Node | null = null;

  @property
  bgInsetX = 24;

  private layoutPending = false;

  onEnable() {
    view.on('canvas-resize', this.requestLayout, this);
    this.requestLayout();
  }

  onDisable() {
    view.off('canvas-resize', this.requestLayout, this);
  }

  requestLayout() {
    if (this.layoutPending) return;
    this.layoutPending = true;
    this.scheduleOnce(() => {
      this.layoutPending = false;
      this.applyLayout();
    }, 0);
  }

  private applyLayout() {
    if (!this.buttonsRoot) return;
    const bgTransform = this.getComponent(UITransform);
    if (!bgTransform) return;

    const outerWidth = bgTransform.width;
    const innerWidth = Math.max(0, outerWidth - this.bgInsetX * 2);
    const padding = this.padding;
   // 1️⃣ 先按宽度反推 elementWidth
let elementWidth =
  (innerWidth - padding * 2) /
  (this.COLUMN_COUNT + this.spacingRatio * (this.COLUMN_COUNT - 1));

// 2️⃣ 再算高度并 clamp
let elementHeight = elementWidth / this.ELEMENT_WIDTH_RATIO;
elementHeight = this.clamp(
  elementHeight,
  this.ELEMENT_HEIGHT_MIN,
  this.ELEMENT_HEIGHT_MAX
);

// 3️⃣ 如果高度被 clamp，需要重新反推 width
elementWidth = elementHeight * this.ELEMENT_WIDTH_RATIO;

// 4️⃣ spacing 始终基于最终 elementWidth
const spacing = elementWidth * this.spacingRatio;

    const layout = this.buttonsRoot.getComponent(Layout);
    if (!layout) return;

    layout.type = Layout.Type.GRID;
    layout.resizeMode = Layout.ResizeMode.CHILDREN;
    layout.constraint = Layout.Constraint.FIXED_COL;
    layout.constraintNum = this.COLUMN_COUNT;
    layout.cellSize = new Size(elementWidth, elementHeight);
    layout.spacingX = spacing;
    layout.spacingY = spacing;
    layout.paddingLeft = this.bgInsetX + padding;
    layout.paddingRight = this.bgInsetX + padding;
    layout.paddingTop = padding;
    layout.paddingBottom = padding;

    const count = this.buttonsRoot.children.length;
    const rows = count > 0 ? Math.ceil(count / this.COLUMN_COUNT) : 0;
    const contentHeight =
      layout.paddingTop +
      layout.paddingBottom +
      rows * elementHeight +
      Math.max(0, rows - 1) * spacing;

    const contentTransform = this.buttonsRoot.parent?.getComponent(UITransform);
    if (contentTransform) {
      contentTransform.setContentSize(contentTransform.width, contentHeight);
    }

    layout.updateLayout();

const totalWidth =
  layout.paddingLeft +
  layout.paddingRight +
  this.COLUMN_COUNT * elementWidth +
  (this.COLUMN_COUNT - 1) * spacing;



    console.log('[ElementTrayGridLayout] outerWidth', outerWidth);
    console.log('[ElementTrayGridLayout] bgInsetX', this.bgInsetX);
    console.log('[ElementTrayGridLayout] innerWidth', innerWidth);
    console.log('[ElementTrayGridLayout] element size', elementWidth, elementHeight);


    const bgTf = this.getComponent(UITransform)!;
const rootTf = this.buttonsRoot!.getComponent(UITransform)!;
rootTf.setContentSize(totalWidth, rootTf.height);
const content = this.buttonsRoot!.parent!;
const contentTf = content.getComponent(UITransform)!;
rootTf.anchorX = 0;
this.buttonsRoot.setPosition(0, this.buttonsRoot.position.y);
const viewNode = content.parent!;
const viewTf = viewNode.getComponent(UITransform)!;

console.log('[CHECK] bg.width', bgTf.width);
console.log('[CHECK] view.width', viewTf.width);
console.log('[CHECK] content.width', contentTf.width);
console.log('[CHECK] root.width', rootTf.width);
console.log('[CHECK] layout.cellSize', layout.cellSize, 'spacingX', layout.spacingX, 'paddingL/R', layout.paddingLeft, layout.paddingRight);
console.log('[CHECK] child0.size', this.buttonsRoot!.children[0]?.getComponent(UITransform)?.contentSize);

  }

  private clamp(value: number, min: number, max: number) {
    return Math.max(min, Math.min(max, value));
  }
}
