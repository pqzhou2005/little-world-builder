import { _decorator, Component, Label, Sprite, SpriteFrame } from 'cc';
import { loadElementIcon } from '../ui/ElementIconLoader';

const { ccclass, property } = _decorator;

@ccclass('ElementButton')
export class ElementButton extends Component {

  @property(Sprite)
  icon!: Sprite;

  @property(Label)
  label!: Label;

  setup(name: string, slug: string) {
    this.label.string = name;

    loadElementIcon(slug, (frame) => {
      this.icon.spriteFrame = frame;
    });
  }
}
