import { _decorator, Component, Node, Label, Prefab, instantiate, director, UITransform, Vec3, tween, Tween } from 'cc';
import { GameCore } from '../core/GameCore';
import { chapterTemplates, ELEMENT_ICONS } from '../data/chapterTemplates';
import { GameLaunchParams, LaunchMode } from '../core/GameLaunchParams';
import { CommonPopup } from './framework/CommonPopup';
import { PopupService } from './framework/PopupService';
import { ToastService } from './framework/ToastService';
import { ElementButton } from './widgets/ElementButton';
import { ElementCoreView } from './widgets/ElementCoreView';
import { MagicCircle } from './Circle';

const { ccclass, property } = _decorator;

@ccclass('QuickPlayController')
export class QuickPlayController extends Component {
  @property(Node)
  buttonsRoot: Node | null = null;

  @property(Prefab)
  elementButtonPrefab: Prefab | null = null;

  @property(Prefab)
  elementCorePrefab: Prefab | null = null;

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

  @property(CommonPopup)
  commonPopup: CommonPopup | null = null;

  @property(Prefab)
  textContentPrefab: Prefab | null = null;

  @property(Prefab)
  newElementContentPrefab: Prefab | null = null;

  @property(Label)
  topLabel: Label | null = null;

  private fusionLocked = false;
  private slotNodeA: Node | null = null;
  private slotNodeB: Node | null = null;
  private magicCircle: MagicCircle | null = null;
  private core!: GameCore;
  private slotA: string | null = null;
  private slotB: string | null = null;
  private activeCombineTweens: Tween<any>[] = [];
  private popupService: PopupService | null = null;

  onLoad() {
    this.logUIState('ON_LOAD');
  }

  start() {
    if (
      !this.buttonsRoot ||
      !this.elementButtonPrefab ||
      !this.elementCorePrefab
    ) {
      console.warn('QuickPlayController: missing required refs');
      return;
    }

    if (this.circle) {
      this.magicCircle = this.circle.getComponent(MagicCircle);
    }

    this.logUIState('START');

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

    if (this.topLabel) {
      this.topLabel.string = this.core.template.chapterIntro.title;
    }

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
    if (this.commonPopup && this.textContentPrefab && this.newElementContentPrefab) {
      this.popupService = new PopupService(
        this.commonPopup,
        this.textContentPrefab,
        this.newElementContentPrefab
      );
    } else {
      console.warn('QuickPlayController: popup service missing refs');
    }
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

    this.scheduleOnce(() => {
      this.syncScrollContentSize();
    }, 0);
  }

  private syncScrollContentSize() {
    if (!this.buttonsRoot) return;
    const content = this.buttonsRoot.parent;
    const view = content?.parent;
    const contentTransform = content?.getComponent(UITransform);
    const viewTransform = view?.getComponent(UITransform);
    const rootTransform = this.buttonsRoot.getComponent(UITransform);
    if (!contentTransform || !rootTransform) return;

    const minHeight = viewTransform?.contentSize.height ?? 0;
    const targetHeight = Math.max(rootTransform.contentSize.height, minHeight);
    const size = contentTransform.contentSize;
    contentTransform.setContentSize(size.width, targetHeight);
  }

  private async flyElementToSlot(name: string, targetNode: Node | null, source?: Node): Promise<Node> {
    if (!this.elementCorePrefab || !this.flyingLayer) {
      throw new Error('flyElementToSlot missing refs');
    }
    const clone = instantiate(this.elementCorePrefab);
    clone.setParent(this.flyingLayer);
    clone.setScale(1, 1, 1);

    const coreView = clone.getComponent(ElementCoreView);
    if (coreView) {
      coreView.setText(name);
    }

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
    if (!this.buttonsRoot || !this.elementCorePrefab || !this.flyingLayer) return;
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
      const a = this.slotA;
      const b = this.slotB;
      const r = this.core.tryCombine(a, b);
      if (!r.ok || !r.isNew) {
        await this.playFailAnimation();
        this.cleanupSlotNodes();
        this.slotA = null;
        this.slotB = null;
        this.showFailureToast(a, b);
      } else {
        const title = '? 新发现';
        this.magicCircle?.enterFusionFocus();
        await this.playCombineAnimation();
        this.magicCircle?.exitFusionFocus();
        this.cleanupSlotNodes();
        this.slotA = null;
        this.slotB = null;
        if (this.popupService) {
          this.popupService.showNewElement({
            name: r.result,
            emoji: ELEMENT_ICONS[r.result],
            desc: r.reason,
            title
          });
        }
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

  private async playFailAnimation() {
    const clones = [this.slotNodeA, this.slotNodeB].filter((node): node is Node => !!node);
    if (!clones.length) return;
    const offsets = [6, -6, 4, -4, 0];
    const step = 0.04;

    await Promise.all(
      clones.map((node) => {
        return new Promise<void>((resolve) => {
          const base = node.position.clone();
          const action = tween(node);
          offsets.forEach((dx) => {
            action.to(step, { position: new Vec3(base.x + dx, base.y, base.z) }, { easing: 'sineInOut' });
          });
          action.call(() => resolve()).start();
        });
      })
    );
  }

  private stopActiveCombineTweens() {
    console.log('[QuickPlay] stopping combine tweens', this.activeCombineTweens.length);
    this.activeCombineTweens.forEach((tw) => tw.stop());
    this.activeCombineTweens.length = 0;
  }

  private showFailureToast(a: string, b: string) {
    const feedback = this.findComboFeedbackText(a, b);
    const fallbackList = this.core.template.failureToasts ?? [];
    const fallback = fallbackList.length
      ? fallbackList[Math.floor(Math.random() * fallbackList.length)]
      : '没有反应，再试试其他组合吧';
    ToastService.show(feedback ?? fallback);
  }

  private findComboFeedbackText(a: string, b: string) {
    const list = this.core.template.comboFeedback ?? [];
    for (const item of list) {
      const ingredients = item.ingredients ?? [];
      if (ingredients.length < 2) continue;
      const [i1, i2] = ingredients;
      if ((i1 === a && i2 === b) || (i1 === b && i2 === a)) {
        return item.text;
      }
    }
    return null;
  }

  onDestroy() {
    this.stopActiveCombineTweens();
  }

  private showPopup(title: string, desc: string) {
    if (!this.popupService) return;
    this.popupService.showText(desc, title);
  }

  private getButtonLabel(name: string) {
    const icon = ELEMENT_ICONS[name];
    return icon ? `${icon} ${name}` : name;
  }

  private logUIState(stage: string) {
    const nodes = this.collectHierarchy();
  }

  private collectHierarchy() {
    const scene = this.node.scene;
    const canvas = scene?.getChildByName('Canvas') ?? this.node.parent?.getChildByName('Canvas') ?? null;

    const safeRoot =
      canvas?.getChildByName('SafeRoot') ??
      (this.node.name === 'SafeRoot' ? this.node : this.node.getChildByName('SafeRoot'));
    const buttonsPannel = safeRoot?.getChildByName('ButtonsPannel') ?? null;
    const bg = buttonsPannel?.getChildByName('Bg') ?? null;
    const scrollView = bg?.getChildByName('ScrollView') ?? null;
    const view = scrollView?.getChildByName('view') ?? null;
    const scrollContent =
      view?.getChildByName('ButtonsRoot') ??
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
      view,
      scrollContent,
      buttonsRoot
    };
  }
}
