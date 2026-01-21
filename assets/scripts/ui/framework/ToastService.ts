/**
 * ⚠️ 架构冻结文件
 * - 该文件是 UI 基础设施的一部分
 * - 不允许修改职责、结构或对外 API
 * - 只允许修 bug 或做视觉相关调整
 */
import {
  Node,
  director,
  view,
  UITransform,
  Label,
  Color,
  UIOpacity,
  tween,
  Vec3,
  Graphics
} from 'cc';

const TOAST_NAME = 'ToastNode';
const ROOT_NAME = 'ToastRoot';

const FADE_IN = 0.15;
const HOLD = 1.2;
const FADE_OUT = 0.3;
const FLOAT_Y = 20;

const PADDING_X = 24;
const PADDING_Y = 14;
const MAX_WIDTH_RATIO = 0.7;

export class ToastService {
  private static root: Node | null = null;
  private static toast: Node | null = null;
  private static label: Label | null = null;
  private static bg: Node | null = null;

  static show(text: string) {
    const root = this.ensureRoot();
    const toast = this.ensureToast(root);
    const label = this.label!;
    const bg = this.bg!;

    label.string = text;
    label.updateRenderData(true);

    const screenSize = view.getVisibleSize();
    const maxWidth = Math.max(280, Math.min(screenSize.width * MAX_WIDTH_RATIO, 720));

    const labelUI = label.getComponent(UITransform)!;
    labelUI.setContentSize(maxWidth, 0);
    label.enableWrapText = true;
    label.overflow = Label.Overflow.RESIZE_HEIGHT;
    label.updateRenderData(true);

    const labelSize = labelUI.contentSize;
    const toastWidth = labelSize.width + PADDING_X * 2;
    const toastHeight = labelSize.height + PADDING_Y * 2;

    const bgUI = bg.getComponent(UITransform)!;
    bgUI.setContentSize(toastWidth, toastHeight);
    this.redrawBg(bg.getComponent(Graphics)!, toastWidth, toastHeight);

    const toastUI = toast.getComponent(UITransform)!;
    toastUI.setContentSize(toastWidth, toastHeight);

    label.node.setPosition(0, 0, 0);
    bg.setPosition(0, 0, 0);

    const baseY = -screenSize.height * 0.08;
    toast.setPosition(0, baseY, 0);

    const opacity = toast.getComponent(UIOpacity)!;
    opacity.opacity = 0;
    tween(opacity).stop();
    tween(toast).stop();

    tween(opacity)
      .to(FADE_IN, { opacity: 255 })
      .delay(HOLD)
      .to(FADE_OUT, { opacity: 0 })
      .start();

    tween(toast)
      .to(FADE_IN + HOLD + FADE_OUT, { position: new Vec3(0, baseY + FLOAT_Y, 0) })
      .start();
  }

  private static ensureRoot() {
    if (this.root && this.root.isValid) return this.root;
    const scene = director.getScene();
    const canvas = scene?.getChildByName('Canvas') ?? scene;
    if (!canvas) {
      throw new Error('ToastService: scene missing');
    }
    let root = canvas.getChildByName(ROOT_NAME);
    if (!root) {
      root = new Node(ROOT_NAME);
      root.setParent(canvas);
    }
    this.root = root;
    return root;
  }

  private static ensureToast(root: Node) {
    if (this.toast && this.toast.isValid) return this.toast;
    let toast = root.getChildByName(TOAST_NAME);
    if (!toast) {
      toast = new Node(TOAST_NAME);
      toast.setParent(root);
      toast.addComponent(UITransform);
      toast.addComponent(UIOpacity);

      const bg = new Node('Bg');
      bg.setParent(toast);
      bg.addComponent(UITransform);
      const g = bg.addComponent(Graphics);
      g.fillColor = new Color(255, 246, 229, 235);
      g.strokeColor = new Color(230, 216, 184, 255);
      g.lineWidth = 1;

      const labelNode = new Node('Label');
      labelNode.setParent(toast);
      labelNode.addComponent(UITransform);
      const label = labelNode.addComponent(Label);
      label.fontSize = 22;
      label.lineHeight = 30;
      label.color = new Color(91, 74, 47, 255);
      label.enableWrapText = true;
      label.overflow = Label.Overflow.RESIZE_HEIGHT;

      this.bg = bg;
      this.label = label;
    }
    this.toast = toast;
    return toast;
  }

  private static redrawBg(g: Graphics, width: number, height: number) {
    g.clear();
    const r = 12;
    const x = -width / 2;
    const y = -height / 2;
    g.roundRect(x, y, width, height, r);
    g.fill();
    g.stroke();
  }
}
