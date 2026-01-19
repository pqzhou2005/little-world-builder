import { _decorator, Component, Node, Label, Button, Prefab, instantiate, director, UITransform, Sprite, Mask, Vec3, tween, Tween, find } from 'cc';
import { GameCore } from '../core/GameCore';
import { chapterTemplates, ELEMENT_ICONS } from '../data/chapterTemplates';
import { GameLaunchParams, LaunchMode } from '../core/GameLaunchParams';
import { ElementButton } from './ElementButton';
import { UIDebug } from './UIDebug';
import { MagicCircle } from './Circle';

const { ccclass, property } = _decorator;

@ccclass('QuickPlayController')
export class QuickPlayController extends Component {
  @property(Node)
  buttonsRoot: Node | null = null;

  @property(Prefab)
  elementButtonPrefab: Prefab | null = null;

  @property(Node)
  flyingLayer: Node | null = null;

  @property(Node)
  slotATarget: Node | null = null;

  @property(Node)
  slotBTarget: Node | null = null;

  @property(Node)
  circle: Node | null = null;

  @property(Label)
  goalLabel: Label | null = null;

  @property(Node)
  popup: Node | null = null;

  @property(Label)
  popupTitle: Label | null = null;

  @property(Label)
  popupDesc: Label | null = null;

  @property(Button)
  popupCloseBtn: Button | null = null;

  private fusionLocked = false;
  private slotNodeA: Node | null = null;
  private slotNodeB: Node | null = null;
  private magicCircle: MagicCircle | null = null;
  private core!: GameCore;
  private slotA: string | null = null;
  private slotB: string | null = null;
  private activeCombineTweens: Tween<any>[] = [];

  onLoad() {
    this.logUIState('ON_LOAD');
  }

  start() {
    if (
      !this.buttonsRoot ||
      !this.elementButtonPrefab
    ) {
      console.warn('QuickPlayController: missing required refs');
      return;
    }

    if (this.circle) {
      this.magicCircle = this.circle.getComponent(MagicCircle);
    }

    this.logUIState('START');

    if (this.popup && this.popupCloseBtn) {
      this.popup.active = false;
      this.popupCloseBtn.node.on(Button.EventType.CLICK, () => {
        if (this.popup) this.popup.active = false;
      });
    }

    (globalThis as any).showChapterCompleteScreen = (chapterId: string) => {
      this.showPopup('?? 章节完成', `完成章节：${chapterId}\n太棒啦～`);
    };

    console.log(
      '[QuickPlay] chapterId =',
      GameLaunchParams.chapterId,
      'template =',
      chapterTemplates[GameLaunchParams.chapterId]
    );

    this.core = new GameCore(
      chapterTemplates[GameLaunchParams.chapterId],
      GameLaunchParams.chapterId
    );

    switch (GameLaunchParams.mode) {
      case LaunchMode.Continue:
        this.core.load();
        break;

      case LaunchMode.Restart:
        GameCore.clearSave();
        break;

      case LaunchMode.NewGame:
      default:
        break;
    }

    this.refreshGoal();
    this.refreshButtons();
    this.logUIState('AFTER_NEW_GAME');
    this.scheduleOnce(() => this.logUIState('AFTER_FRAME_1'), 0);
    this.scheduleOnce(() => this.logUIState('AFTER_FRAME_2'), 0.033);

    console.log(
      '[QuickPlay] launch',
      LaunchMode[GameLaunchParams.mode],
      GameLaunchParams.chapterId
    );
  }

  private refreshGoal() {
    if (this.goalLabel) {
      this.goalLabel.string = this.core.getCurrentGoalText();
    }
  }

  private refreshButtons() {
    if (!this.buttonsRoot || !this.elementButtonPrefab) return;

    this.buttonsRoot.removeAllChildren();

    for (const name of this.core.ownedOrder) {
      const node = instantiate(this.elementButtonPrefab);
      node.setParent(this.buttonsRoot);

      const elementBtn = node.getComponent(ElementButton);
      if (elementBtn) {
        elementBtn.setup(name, ELEMENT_ICONS[name]);
      } else {
        const label = node.getComponentInChildren(Label);
        if (label) label.string = this.getButtonLabel(name);
      }

      node.on(Node.EventType.TOUCH_END, () => this.onPick(name, node), this);
    }
  }

  private async flyElementToSlot(name: string, targetNode: Node | null, source?: Node): Promise<Node> {
    if (!this.elementButtonPrefab || !this.flyingLayer) {
      throw new Error('flyElementToSlot missing refs');
    }
    const clone = instantiate(this.elementButtonPrefab);
    clone.setParent(this.flyingLayer);
    clone.setScale(1, 1, 1);

    clone.getComponent(ElementButton)?.setup(name, ELEMENT_ICONS[name]);

    const reference = source?.parent ?? source ?? this.buttonsRoot ?? this.flyingLayer;
    const startWorld = reference?.getWorldPosition(new Vec3()) ?? new Vec3();
    clone.setWorldPosition(startWorld);

    const targetWorld = (targetNode ?? reference)?.getWorldPosition(new Vec3()) ?? startWorld;
    const flyingTransform = this.flyingLayer.getComponent(UITransform);
    const localTarget = flyingTransform
      ? flyingTransform.convertToNodeSpaceAR(targetWorld)
      : targetWorld;

    await new Promise<void>((resolve) => {
      tween(clone)
        .to(0.2, { position: localTarget }, { easing: 'cubicOut' })
        .call(() => resolve())
        .start();
    });

    return clone;
  }

  private async onPick(name: string, source?: Node) {
    if (!this.buttonsRoot || !this.elementButtonPrefab || !this.flyingLayer) return;
    if (this.fusionLocked) return;

    this.fusionLocked = true;
    try {
      const targetNode = !this.slotA ? this.slotATarget : this.slotBTarget;
      const clone = await this.flyElementToSlot(name, targetNode, source);

      this.scheduleOnce(() => {
        this.processSlotAssignment(name, clone)
          .then(() => {
            this.fusionLocked = false;
          })
          .catch((err) => {
            this.fusionLocked = false;
            throw err;
          });
      }, 0);
    } catch (err) {
      this.fusionLocked = false;
      throw err;
    }
  }

  private async processSlotAssignment(name: string, clone: Node) {
    console.log('[QuickPlay] processSlotAssignment', { name, slotA: this.slotA, slotB: this.slotB });
    if (!this.slotA) {
      this.slotA = name;
      this.slotNodeA = clone;
    } else {
      this.slotB = name;
      this.slotNodeB = clone;
    }

    if (this.slotA && this.slotB) {
      this.magicCircle?.enterFusionFocus();
      await this.playCombineAnimation();
      this.magicCircle?.exitFusionFocus();
      const a = this.slotA;
      const b = this.slotB;
      this.cleanupSlotNodes();
      this.slotA = null;
      this.slotB = null;
      const r = this.core.tryCombine(a, b);
      if (!r.ok) {
        this.showPopup('?? 没有反应', `${a} + ${b}\n换个组合试试～`);
      } else {
        const title = r.isNew ? '✨ 新发现' : '✨ 你以前做过';
        const desc = `${a} + ${b}\n→ ${r.result}\n\n${r.reason}`;
        this.showPopup(title, desc);
        if (r.isNew) {
          this.refreshButtons();
        }
        this.refreshGoal();
        this.core.save();

        if (this.core.isChapterCompleted()) {
          this.core.template.onComplete?.();
          const next = this.core.template.nextChapter;
          if (next) {
            GameLaunchParams.mode = LaunchMode.NewGame;
            GameLaunchParams.chapterId = next;
            director.loadScene('Game');
          } else {
            GameCore.clearSave();
          }
        }
      }
    }
  }

  private cleanupSlotNodes() {
    if (this.slotNodeA) {
      console.log('[QuickPlay] destroying slotNodeA', this.slotNodeA.name);
      this.slotNodeA.destroy();
      this.slotNodeA = null;
    }
    if (this.slotNodeB) {
      console.log('[QuickPlay] destroying slotNodeB', this.slotNodeB.name);
      this.slotNodeB.destroy();
      this.slotNodeB = null;
    }
  }

  private async playCombineAnimation() {
    if (!this.flyingLayer) return;
    const clones = [this.slotNodeA, this.slotNodeB].filter((node): node is Node => !!node);
    if (!clones.length) return;
    console.log('[QuickPlay] playCombineAnimation', 'clones', clones.length, clones.map((n) => n.name).join(','));

    const duration = 0.28;
    const centerWorld = new Vec3();
    if (this.circle) {
      this.circle.getWorldPosition(centerWorld);
    } else if (this.slotATarget) {
      this.slotATarget.getWorldPosition(centerWorld);
    } else if (this.slotBTarget) {
      this.slotBTarget.getWorldPosition(centerWorld);
    } else {
      this.flyingLayer.getWorldPosition(centerWorld);
    }

    const flyingTransform = this.flyingLayer.getComponent(UITransform);
    const centerLocal = flyingTransform
      ? flyingTransform.convertToNodeSpaceAR(centerWorld)
      : centerWorld;

    await Promise.all(
      clones.map((node) => {
        return new Promise<void>((resolve) => {
          const startWorld = node.getWorldPosition(new Vec3());
          const startLocal = flyingTransform
            ? flyingTransform.convertToNodeSpaceAR(startWorld)
            : startWorld;
          const offsetX = startLocal.x - centerLocal.x;
          const offsetY = startLocal.y - centerLocal.y;
          let angle = Math.atan2(offsetY, offsetX);
          const startRadius = Math.max(16, Math.sqrt(offsetX * offsetX + offsetY * offsetY));
          const rotationSpeed = Math.PI * 2 * 3;
          const combineNode = node as Node & { __combineT?: number };
          combineNode.__combineT = 0;
          let lastT = 0;
          const action = tween(combineNode)
            .to(duration, { __combineT: 1 }, {
              easing: 'cubicInOut',
              onUpdate: () => {
                const currentT = combineNode.__combineT ?? 0;
                const dt = currentT - lastT;
                lastT = currentT;
                angle += rotationSpeed * dt;
                const radius = Math.max(6, startRadius * (1 - currentT));
                const localPos = new Vec3(centerLocal.x + Math.cos(angle) * radius, centerLocal.y + Math.sin(angle) * radius, centerLocal.z);
                node.setPosition(localPos);
              }
            })
            .call(() => {
              console.log('[QuickPlay] combine tween done', node.name);
              resolve();
            });
          console.log('[QuickPlay] starting combine tween', node.name);
          this.activeCombineTweens.push(action);
          action.start();
        });
      })
    );
  }

  private stopActiveCombineTweens() {
    console.log('[QuickPlay] stopping combine tweens', this.activeCombineTweens.length);
    this.activeCombineTweens.forEach((tw) => tw.stop());
    this.activeCombineTweens.length = 0;
  }

  onDestroy() {
    this.stopActiveCombineTweens();
  }

  private showPopup(title: string, desc: string) {
    if (!this.popup || !this.popupTitle || !this.popupDesc) return;
    this.popupTitle.string = title;
    this.popupDesc.string = desc;
    this.popup.active = true;
    console.log('[Popup DEBUG]',
      'popup active=', this.popup.active,
      'title active=', this.popupTitle.node.active,
      'desc active=', this.popupDesc.node.active,
      'title text=', this.popupTitle.string,
      'desc text=', this.popupDesc.string
    );
    const panel = find('Pannel', this.popup)!;
    const bg = find('Pannel/Bg', this.popup)!;

    console.log(
      '[Popup Z]',
      'Bg idx=', bg.getSiblingIndex(),
      'Title idx=', this.popupTitle.node.getSiblingIndex(),
      'Desc idx=', this.popupDesc.node.getSiblingIndex()
    );
    this.logPopupBgState('POPUP_SHOW');
    setTimeout(() => this.logPopupBgState('POPUP_SHOW_DELAYED'), 0);
  }

  private getButtonLabel(name: string) {
    const icon = ELEMENT_ICONS[name];
    return icon ? `${icon} ${name}` : name;
  }

  private logPopupBgState(stage: string) {
    const prefix = '[PopupBgDebug]';
    if (!this.popup) {
      console.warn(`${prefix} ${stage}: popup node missing`);
      return;
    }
    const bg = find('Pannel/Bg', this.popup);

    if (!bg) {
      console.warn(`${prefix} ${stage}: Bg node missing`);
      return;
    }

    const ui = bg.getComponent(UITransform);
    const sprite = bg.getComponent(Sprite);
    const formatSize = (width: number, height: number) => `(${width.toFixed(1)},${height.toFixed(1)})`;
    const info = [
      `active=${bg.active}`,
      `worldPos=(${bg.worldPosition.x.toFixed(2)},${bg.worldPosition.y.toFixed(2)},${bg.worldPosition.z.toFixed(2)})`,
      `scale=(${bg.scale.x.toFixed(2)},${bg.scale.y.toFixed(2)},${bg.scale.z.toFixed(2)})`,
      `size=${ui ? formatSize(ui.contentSize.width, ui.contentSize.height) : 'null'}`,
      `spriteFrame=${sprite?.spriteFrame?.name ?? 'null'}`,
      `spriteExists=${!!sprite?.spriteFrame}`,
      `spriteColorA=${sprite ? sprite.color.a : 'null'}`,
      `layer=${bg.layer}`,
      `parent=${bg.parent?.name ?? 'null'}`,
      `siblingIndex=${bg.getSiblingIndex()}`
    ].join(', ');
    console.log(`${prefix} ${stage}: ${info}`);

    
  }

  private logUIState(stage: string) {
    const nodes = this.collectHierarchy();
    UIDebug.dumpNode(stage, 'Canvas', nodes.canvas);
    UIDebug.dumpNode(stage, 'SafeRoot', nodes.safeRoot);
    UIDebug.dumpNode(stage, 'ButtonsPannel', nodes.buttonsPannel);
    UIDebug.dumpNode(stage, 'ButtonsPannel/Bg', nodes.bg);
    UIDebug.dumpNode(stage, 'ScrollView', nodes.scrollView);
    UIDebug.dumpNode(stage, 'ScrollView/Viewport', nodes.viewport);
    UIDebug.dumpNode(stage, 'ButtonsRoot', nodes.scrollContent);
    UIDebug.checkSamePosition(stage, 'Buttons', nodes.buttonsRoot?.children ?? []);
    UIDebug.checkScrollContentSize(stage, 'ScrollView Content', nodes.scrollContent);
  }

  private collectHierarchy() {
    const scene = this.node.scene;
    const canvas = scene?.getChildByName('Canvas') ?? this.node.parent?.getChildByName('Canvas') ?? null;

    const safeRoot =
      canvas?.getChildByName('SafeRoot') ??
      (this.node.name === 'SafeRoot' ? this.node : this.node.getChildByName('SafeRoot'));
    const buttonsPannel = safeRoot?.getChildByName('ButtonsPannel') ?? null;
    const bg = buttonsPannel?.getChildByName('Bg') ?? null;
    const scrollView = buttonsPannel?.getChildByName('ScrollView') ?? null;
    const viewport = scrollView?.getChildByName('Viewport') ?? null;
    const scrollContent =
      viewport?.getChildByName('ButtonsRoot') ??
      scrollView?.getChildByName('ButtonsRoot') ??
      this.buttonsRoot ??
      null;
    const buttonsRoot = this.buttonsRoot ?? scrollContent ?? null;
    return {
      canvas,
      safeRoot,
      buttonsPannel,
      bg,
      scrollView,
      viewport,
      scrollContent,
      buttonsRoot
    };
  }
}
