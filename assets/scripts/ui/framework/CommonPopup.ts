/**
 * ⚠️ 架构冻结文件
 * - 该文件是 UI 基础设施的一部分
 * - 不允许修改职责、结构或对外 API
 * - 只允许修 bug 或做视觉相关调整
 */
import {
  _decorator,
  Component,
  Node,
  Label,
  Button,
  Prefab,
  instantiate,
  UITransform,
  UIOpacity,
  Vec3,
  tween,
  view
} from 'cc';

const { ccclass, property } = _decorator;

const HEADER_HEIGHT = 68;
const ACTIONS_HEIGHT = 64;

interface PopupConfig {
  title?: string;
  contentPrefab?: Prefab;
  showActions?: boolean;
  showClose?: boolean;
  allowMaskClose?: boolean;
}

@ccclass('CommonPopup')
export class CommonPopup extends Component {
  @property(Node)
  mask: Node | null = null;

  @property(Node)
  panel: Node | null = null;

  @property(Node)
  header: Node | null = null;

  @property(Label)
  title: Label | null = null;

  @property(Node)
  closeBtn: Node | null = null;

  @property(Node)
  contentArea: Node | null = null;

  @property(Node)
  padding: Node | null = null;

  @property(Node)
  contentSlot: Node | null = null;

  @property(Node)
  actions: Node | null = null;

  @property(Node)
  primaryBtn: Node | null = null;

  @property(Node)
  secondaryBtn: Node | null = null;

  private allowMaskClose = true;
  private showTweenRunning = false;
  private pendingTitle = '';
  private currentContent: Node | null = null;

  onLoad() {
    if (this.actions) {
      this.actions.active = false;
    }

    const maskButton = this.mask?.getComponent(Button);
    if (maskButton) {
      maskButton.node.on(Button.EventType.CLICK, () => {
        if (this.allowMaskClose) {
          this.hide();
        }
      });
    }

    const closeButton = this.closeBtn?.getComponent(Button);
    if (closeButton) {
      closeButton.node.on(Button.EventType.CLICK, () => {
        this.hide();
      });
    }
  }

  public show(config: PopupConfig) {
    if (!this.panel || !this.header || !this.contentArea || !this.padding || !this.contentSlot) {
      return;
    }

    this.panel.setScale(Vec3.ONE);
    this.node.active = true;
    this.pendingTitle = config.title ?? '';
    this.applyConfig(config);
    this.updateLayout();
    this.applyTitle(this.pendingTitle);
    this.mountContent(config.contentPrefab);
    this.playShowAnim();
  }

  public hide() {
    if (!this.node.active) return;
    this.showTweenRunning = false;
    this.playHideAnim(() => {
      this.clearContentSlot();
      this.node.active = false;
    });
  }

  private applyConfig(config: PopupConfig) {
    const showActions = config.showActions ?? false;
    const showClose = config.showClose ?? true;
    const allowMaskClose = config.allowMaskClose ?? true;

    if (this.actions) {
      this.actions.active = showActions;
    }
    if (this.closeBtn) {
      this.closeBtn.active = showClose;
    }
    this.allowMaskClose = allowMaskClose;
  }

  private applyTitle(title?: string) {
    const text = title ?? '';
    this.pendingTitle = text;
    if (this.title) {
      this.title.string = text;
    }
  }

  private mountContent(prefab?: Prefab) {
    this.clearContentSlot();
    if (!this.contentSlot || !prefab) return;
    const node = instantiate(prefab);
    node.setParent(this.contentSlot);
    this.currentContent = node;
  }

  private clearContentSlot() {
    if (this.contentSlot) {
      this.contentSlot.removeAllChildren();
    }
    this.currentContent = null;
  }

  private updateLayout() {
    if (!this.panel || !this.header || !this.contentArea || !this.padding || !this.contentSlot) {
      return;
    }

    const screenSize = view.getVisibleSize();
    const panelWidth = this.clamp(screenSize.width * 0.75, 560, 720);
    const panelHeight = this.clamp(screenSize.height * 0.6, 480, 640);

    const panelUI = this.panel.getComponent(UITransform);
    panelUI?.setContentSize(panelWidth, panelHeight);
    this.panel.setPosition(0, 0, 0);

    const maskUI = this.mask?.getComponent(UITransform);
    maskUI?.setContentSize(screenSize.width, screenSize.height);

    const showHeader = this.shouldShowHeader(this.pendingTitle);
    if (this.header) {
      this.header.active = showHeader;
    }
    const headerHeight = showHeader ? HEADER_HEIGHT : 0;
    const actionsHeight = ACTIONS_HEIGHT;
    const actionsActive = this.actions?.active ?? false;

    const headerUI = this.header.getComponent(UITransform);
    headerUI?.setContentSize(panelWidth, headerHeight);
    this.header.setPosition(0, panelHeight / 2 - headerHeight / 2, 0);

    if (this.actions) {
      const actionsUI = this.actions.getComponent(UITransform);
      actionsUI?.setContentSize(panelWidth, actionsHeight);
      this.actions.setPosition(0, -panelHeight / 2 + actionsHeight / 2, 0);
    }

    const contentHeight = panelHeight - headerHeight - (actionsActive ? actionsHeight : 0);
    const contentWidth = panelWidth;
    const contentUI = this.contentArea.getComponent(UITransform);
    contentUI?.setContentSize(contentWidth, contentHeight);

    const contentTop = panelHeight / 2 - headerHeight;
    const contentBottom = actionsActive ? -panelHeight / 2 + actionsHeight : -panelHeight / 2;
    const contentCenterY = (contentTop + contentBottom) / 2;
    this.contentArea.setPosition(0, contentCenterY, 0);

    const paddingLeftRight = Math.max(panelWidth * 0.05, 24);
    const paddingTop = Math.max(panelHeight * 0.02, 8);
    const paddingBottom = Math.max(panelHeight * 0.04, 16);

    const slotWidth = Math.max(0, contentWidth - paddingLeftRight * 2);
    const slotHeight = Math.max(0, contentHeight - paddingTop - paddingBottom);
    const paddingUI = this.padding.getComponent(UITransform);
    paddingUI?.setContentSize(slotWidth, slotHeight);
    const slotUI = this.contentSlot.getComponent(UITransform);
    slotUI?.setContentSize(slotWidth, slotHeight);

    const paddingOffsetY = (paddingBottom - paddingTop) / 2;
    this.padding.setPosition(0, paddingOffsetY, 0);
    this.contentSlot.setPosition(0, 0, 0);
  }

  private playShowAnim() {
    if (!this.panel || !this.mask) return;
    if (this.showTweenRunning) return;
    this.showTweenRunning = true;

    const panelOpacity = this.ensureOpacity(this.panel);
    const maskOpacity = this.ensureOpacity(this.mask);
    tween(panelOpacity).stop();
    tween(maskOpacity).stop();
    tween(this.panel).stop();

    this.panel.setScale(new Vec3(0.98, 0.98, 1));
    panelOpacity.opacity = 0;
    maskOpacity.opacity = 0;

    tween(panelOpacity)
      .to(0.2, { opacity: 255 })
      .call(() => {
        this.showTweenRunning = false;
      })
      .start();

    tween(this.panel)
      .to(0.2, { scale: new Vec3(1, 1, 1) })
      .start();

    tween(maskOpacity)
      .to(0.2, { opacity: 255 })
      .start();
  }

  private playHideAnim(onDone: () => void) {
    if (!this.panel || !this.mask) {
      onDone();
      return;
    }

    const panelOpacity = this.ensureOpacity(this.panel);
    const maskOpacity = this.ensureOpacity(this.mask);
    tween(panelOpacity).stop();
    tween(maskOpacity).stop();
    tween(this.panel).stop();

    tween(panelOpacity)
      .to(0.16, { opacity: 0 })
      .call(onDone)
      .start();

    tween(this.panel)
      .to(0.16, { scale: new Vec3(0.98, 0.98, 1) })
      .start();

    tween(maskOpacity)
      .to(0.16, { opacity: 0 })
      .start();
  }

  private ensureOpacity(node: Node): UIOpacity {
    let opacity = node.getComponent(UIOpacity);
    if (!opacity) {
      opacity = node.addComponent(UIOpacity);
    }
    return opacity;
  }

  private clamp(value: number, min: number, max: number) {
    return Math.max(min, Math.min(max, value));
  }

  public getCurrentContentNode() {
    return this.currentContent;
  }

  protected shouldShowHeader(title: string) {
    return true;
  }
}
