import { _decorator, Component, Node, Label, Button, Prefab, instantiate, director, UITransform, Sprite, Mask, find } from 'cc';
import { GameCore } from '../core/GameCore';
import { chapterTemplates, ELEMENT_ICONS, ELEMENT_ASSETS } from '../data/chapterTemplates';
import { GameLaunchParams, LaunchMode } from '../core/GameLaunchParams';
import { ElementButton } from './ElementButton';
import { UIDebug } from './UIDebug';

const { ccclass, property } = _decorator;

@ccclass('QuickPlayController')
export class QuickPlayController extends Component {
  @property(Node)
  buttonsRoot: Node | null = null;

  @property(Prefab)
  elementButtonPrefab: Prefab | null = null;

  @property(Label)
  slotALabel: Label | null = null;

  @property(Label)
  slotBLabel: Label | null = null;

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

  private core!: GameCore;
  private slotA: string | null = null;
  private slotB: string | null = null;

  onLoad() {
    this.logUIState('ON_LOAD');
  }

  start() {
    if (
      !this.buttonsRoot ||
      !this.elementButtonPrefab ||
      !this.slotALabel ||
      !this.slotBLabel
    ) {
      console.warn('QuickPlayController: missing required refs');
      return;
    }

    this.logUIState('START');


    // popup close
    if (this.popup && this.popupCloseBtn) {
      this.popup.active = false;
      this.popupCloseBtn.node.on(Button.EventType.CLICK, () => {
        if (this.popup) this.popup.active = false;
      });
    }

    (globalThis as any).showChapterCompleteScreen = (chapterId: string) => {
      this.showPopup('🎉 章节完成', `完成章节：${chapterId}\n太棒啦～`);
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
        // 什么都不做
        break;
    }
    this.refreshGoal();
    this.refreshButtons();
    this.logUIState('AFTER_NEW_GAME');
    this.scheduleOnce(() => this.logUIState('AFTER_FRAME_1'), 0);
    this.scheduleOnce(() => this.logUIState('AFTER_FRAME_2'), 0.033);
    this.refreshSlots();

    console.log(
      '[QuickPlay] launch',
      LaunchMode[GameLaunchParams.mode],
      GameLaunchParams.chapterId
    );

    this.slotALabel!.node.on(Node.EventType.TOUCH_END, () => {
      this.slotA = null;
      this.refreshSlots();
    }, this);
    this.slotBLabel!.node.on(Node.EventType.TOUCH_END, () => {
      this.slotB = null;
      this.refreshSlots();
    }, this);
  }

  private refreshGoal() {
    if (this.goalLabel) {
      this.goalLabel.string = this.core.getCurrentGoalText();
    }
  }

  private refreshSlots() {
    if (this.slotALabel) {
      this.slotALabel.string = this.slotA ? `A = ${this.slotA}` : 'A = （空）';
    }
    if (this.slotBLabel) {
      this.slotBLabel.string = this.slotB ? `B = ${this.slotB}` : 'B = （空）';
    }
  }

  private refreshButtons() {
    if (!this.buttonsRoot || !this.elementButtonPrefab) return;

    // 清空旧按钮
    this.buttonsRoot.removeAllChildren();

    for (const name of this.core.ownedOrder) {
      const node = instantiate(this.elementButtonPrefab);
      node.setParent(this.buttonsRoot);

      const elementBtn = node.getComponent(ElementButton);
      const meta = ELEMENT_ASSETS[name];
      if (elementBtn) {
        const slug = meta?.slug ?? 'panel';
        elementBtn.setup(name, slug);
      } else {
        const label = node.getComponentInChildren(Label);
        if (label) label.string = this.getButtonLabel(name);
      }

      // 绑定点击（只绑 HitArea）
      const hitArea = node.getChildByName('HitArea');
      if (!hitArea) {
        console.warn('[ElementButton] missing HitArea');
        continue;
      }

      const btn = hitArea.getComponent(Button);
      if (btn) {
        btn.node.on(Button.EventType.CLICK, () => this.onPick(name), this);
      } else {
        hitArea.on(Node.EventType.TOUCH_END, () => this.onPick(name), this);
      }
    }
  }


  private onPick(name: string) {
    if (!this.slotA) {
      this.slotA = name;
    } else if (!this.slotB) {
      this.slotB = name;
    } else {
      // 保留 B 作为上一次组合的后续，旧的 A 退回、最新选择成为 B
      this.slotA = this.slotB;
      this.slotB = name;
    }

    this.refreshSlots();

    if (this.slotA && this.slotB) {
      const r = this.core.tryCombine(this.slotA, this.slotB);
      if (!r.ok) {
        this.showPopup('🤔 没有反应', `${this.slotA} + ${this.slotB}\n换个组合试试～`);
      } else {
        const title = r.isNew ? '✨ 新发现' : '✨ 你以前做过';
        const desc = `${this.slotA} + ${this.slotB}\n→ ${r.result}\n\n${r.reason}`;
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

      this.slotA = null;
      this.slotB = null;
      this.refreshSlots();
    }
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
    UIDebug.checkSamePosition(stage, 'Slots', [this.slotALabel?.node ?? null, this.slotBLabel?.node ?? null]);
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
