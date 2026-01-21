import { _decorator, Component, Node, Input, EventTouch, EventTarget } from 'cc';
const { ccclass } = _decorator;

// 全局或局部事件都可以，这里用局部 EventTarget
export const CloseButtonEvent = new EventTarget();

@ccclass('CloseButton')
export class CloseButton extends Component {

    private pressedBG: Node | null = null;

    onLoad () {
        this.pressedBG = this.node.getChildByName('PressedBG');

        this.node.on(Input.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(Input.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.on(Input.EventType.TOUCH_CANCEL, this.onTouchCancel, this);
    }

    onDestroy () {
        this.node.off(Input.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.off(Input.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.off(Input.EventType.TOUCH_CANCEL, this.onTouchCancel, this);
    }

    private onTouchStart () {
        this.pressedBG && (this.pressedBG.active = true);
    }

    private onTouchEnd () {
        this.pressedBG && (this.pressedBG.active = false);

        // ✅ 只发事件
        CloseButtonEvent.emit('click', this.node);
    }

    private onTouchCancel () {
        this.pressedBG && (this.pressedBG.active = false);
    }
}
