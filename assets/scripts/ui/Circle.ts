import {
    _decorator,
    Component,
    Graphics,
    Color,
    UITransform,
    tween,
    Vec3,
    Node,
    UIOpacity,
    Tween,
} from 'cc';
const { ccclass } = _decorator;

@ccclass('MagicCircle')
export class MagicCircle extends Component {
    private root!: Node;
    private staticLayer!: Node;
    private dynamicLayer!: Node;

    private opacityComponent: UIOpacity | null = null;
    private focusScaleTween: Tween<Node> | null = null;
    private focusOpacityTween: Tween<UIOpacity> | null = null;

    start () {
        this.root = this.node;
        const ui = this.root.getComponent(UITransform)!;
        ui.setContentSize(900, 900);
        this.root.scale = new Vec3(0.92, 0.92, 1);

        // ===== 静态层（法则 / 坐标）=====
        this.staticLayer = new Node('StaticLayer');
        this.staticLayer.setParent(this.root);
        this.staticLayer.addComponent(UITransform).setContentSize(900, 900);
        this.drawStatic(this.staticLayer.addComponent(Graphics));

        // ===== 动态层（变化，但克制）=====
        this.dynamicLayer = new Node('DynamicLayer');
        this.dynamicLayer.setParent(this.root);
        this.dynamicLayer.addComponent(UITransform).setContentSize(900, 900);
        this.drawDynamic(this.dynamicLayer.addComponent(Graphics));

        this.startDynamicRotation();
        this.ensureOpacityComponent();
    }

    // =================================================
    // 静态结构（神话 / 权威）
    // =================================================
    private drawStatic(g: Graphics) {
        const law  = new Color(78, 78, 78, 255); // 外圈：法则
        const axis = new Color(68, 68, 68, 255); // 十字：坐标
        const base = new Color(40, 40, 40, 255); // 结构

        // 外圈（最亮，裁决感）
        this.circle(g, 320, 6, 1.0, law);

        // 十字坐标（仅次于外圈）
        this.line(g, -260, 0, 260, 0, 4, 0.95, axis);
        this.line(g, 0, -260, 0, 260, 4, 0.95, axis);

        // 主内圈
        this.circle(g, 260, 4, 0.72, base);
        this.circle(g, 120, 3, 0.68, base);
    }

    // =================================================
    // 动态结构（服从法则）
    // =================================================
    private drawDynamic(g: Graphics) {
        const mid    = new Color(45, 45, 45, 255);
        const detail = new Color(30, 30, 30, 255);

        this.star(g, 210, 3, 0.6, mid);
        this.circle(g, 70, 2, 0.4, detail);
        this.diamond(g, 28, 3, 0.5, detail);
        this.fill(g, 8, 0.35, detail);
        this.ticks(g);
    }

    // =================================================
    // 基础绘制
    // =================================================
    private circle(g: Graphics, r: number, w: number, a: number, c: Color) {
        g.lineWidth = w;
        g.strokeColor = new Color(c.r, c.g, c.b, a * 255);
        g.circle(0, 0, r);
        g.stroke();
    }

    private fill(g: Graphics, r: number, a: number, c: Color) {
        g.fillColor = new Color(c.r, c.g, c.b, a * 255);
        g.circle(0, 0, r);
        g.fill();
    }

    private line(
        g: Graphics,
        x1: number, y1: number,
        x2: number, y2: number,
        w: number, a: number, c: Color
    ) {
        g.lineWidth = w;
        g.strokeColor = new Color(c.r, c.g, c.b, a * 255);
        g.moveTo(x1, y1);
        g.lineTo(x2, y2);
        g.stroke();
    }

    private star(g: Graphics, r: number, w: number, a: number, c: Color) {
        g.lineWidth = w;
        g.strokeColor = new Color(c.r, c.g, c.b, a * 255);

        g.moveTo(0, -r);
        g.lineTo(182, 105);
        g.lineTo(-182, 105);
        g.close();
        g.stroke();

        g.moveTo(0, r);
        g.lineTo(182, -105);
        g.lineTo(-182, -105);
        g.close();
        g.stroke();
    }

    private diamond(g: Graphics, r: number, w: number, a: number, c: Color) {
        g.lineWidth = w;
        g.strokeColor = new Color(c.r, c.g, c.b, a * 255);
        g.moveTo(0, -r);
        g.lineTo(r, 0);
        g.lineTo(0, r);
        g.lineTo(-r, 0);
        g.close();
        g.stroke();
    }

    private ticks(g: Graphics) {
        g.lineWidth = 2;
        g.strokeColor = new Color(25, 25, 25, 0.14 * 255);
        for (let i = 0; i < 12; i++) {
            const a = i * Math.PI / 6;
            g.moveTo(Math.sin(a) * 320, -Math.cos(a) * 320);
            g.lineTo(Math.sin(a) * 300, -Math.cos(a) * 300);
        }
        g.stroke();
    }

    // =================================================
    // 动态层旋转（更慢 = 权威）
    // =================================================
    private startDynamicRotation() {
        tween(this.dynamicLayer)
            .by(60, { angle: 360 }, { easing: 'linear' })
            .repeatForever()
            .start();
    }

    // =================================================
    // 聚焦状态（保留）
    // =================================================
    private ensureOpacityComponent() {
        if (!this.opacityComponent) {
            this.opacityComponent =
                this.root.getComponent(UIOpacity) ||
                this.root.addComponent(UIOpacity);
        }
    }

    enterFusionFocus() {
        this.focusScaleTween?.stop();
        this.focusOpacityTween?.stop();

        this.focusScaleTween = tween(this.root)
            .to(0.25, { scale: new Vec3(0.86, 0.86, 1) }, { easing: 'sineOut' })
            .start();

        if (this.opacityComponent) {
            this.focusOpacityTween = tween(this.opacityComponent)
                .to(0.25, { opacity: 210 }, { easing: 'sineOut' })
                .start();
        }
    }

    exitFusionFocus() {
        this.focusScaleTween?.stop();
        this.focusOpacityTween?.stop();

        this.focusScaleTween = tween(this.root)
            .to(0.3, { scale: new Vec3(0.92, 0.92, 1) }, { easing: 'sineInOut' })
            .start();

        if (this.opacityComponent) {
            this.focusOpacityTween = tween(this.opacityComponent)
                .to(0.3, { opacity: 255 }, { easing: 'sineInOut' })
                .start();
        }
    }
}
