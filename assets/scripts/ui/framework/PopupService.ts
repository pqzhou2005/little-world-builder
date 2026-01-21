/**
 * ⚠️ 架构冻结文件
 * - 该文件是 UI 基础设施的一部分
 * - 不允许修改职责、结构或对外 API
 * - 只允许修 bug 或做视觉相关调整
 */
import { Prefab } from 'cc';
import { CommonPopup } from './CommonPopup';
import { TextContent } from '../content/TextContent';
import { ElementContent } from '../content/NewElementContent';

type NewElementData = {
  name: string;
  emoji?: string;
  desc: string;
  title?: string;
};

export class PopupService {
  constructor(
    private popup: CommonPopup,
    private textContentPrefab: Prefab,
    private newElementContentPrefab: Prefab
  ) {}

  public showText(text: string, title?: string) {
    this.popup.show({
      title: title ?? '',
      contentPrefab: this.textContentPrefab,
      showActions: false,
      showClose: true,
      allowMaskClose: true
    });
    const content = this.popup.getCurrentContentNode();
    const contentRoot = content?.getComponent(TextContent);
    contentRoot?.setup(text);
  }

  public showNewElement(data: NewElementData) {
    this.popup.show({
      title: data.title ?? '',
      contentPrefab: this.newElementContentPrefab,
      showActions: false,
      showClose: true,
      allowMaskClose: true
    });
    const content = this.popup.getCurrentContentNode();
    const contentRoot = content?.getComponent(ElementContent);
    contentRoot?.setup({
      name: data.name,
      emoji: data.emoji,
      desc: data.desc
    });
  }
}
