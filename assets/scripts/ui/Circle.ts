import { _decorator, Component, Graphics, Color, UITransform } from 'cc';
const { ccclass } = _decorator;

@ccclass('MagicCircle')
export class MagicCircle extends Component {

    start () {
        const ui = this.node.getComponent(UITransform)!;
        ui.setContentSize(900, 900);

        const g = this.node.addComponent(Graphics);

        // 颜色：深一点，别用纯黑
        const main = new Color(30, 30, 30, 255);

        // ===== 外圈（法阵边界）=====
        this.circle(g, 320, 5, 0.9, main);
        this.circle(g, 260, 4, 0.75, main);

        // ===== 星形结构（法阵核心识别）=====
        this.star(g, 210, 4, 0.85, main);

        // ===== 十字定位（符号感）=====
        this.line(g, -260, 0, 260, 0, 3, 0.7, main);
        this.line(g, 0, -260, 0, 260, 3, 0.7, main);

        // ===== 内圈 =====
        this.circle(g, 120, 4, 0.85, main);
        this.circle(g, 70, 3, 0.7, main);

        // ===== 中心符文 =====
        this.diamond(g, 28, 4, 0.9, main);
        this.fill(g, 8, 1.0, main);

        // ===== 简化刻度（只保留“仪式感”）=====
        this.ticks(g);

        g.stroke();
        g.fill();
    }

    // ===== 基础绘制 =====

    circle(g: Graphics, r: number, w: number, a: number, c: Color) {
        g.lineWidth = w;
        g.strokeColor = new Color(c.r, c.g, c.b, a * 255);
        g.circle(0, 0, r);
        g.stroke();
    }

    fill(g: Graphics, r: number, a: number, c: Color) {
        g.fillColor = new Color(c.r, c.g, c.b, a * 255);
        g.circle(0, 0, r);
        g.fill();
    }

    line(
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

    star(g: Graphics, r: number, w: number, a: number, c: Color) {
        g.lineWidth = w;
        g.strokeColor = new Color(c.r, c.g, c.b, a * 255);

        // 上三角
        g.moveTo(0, -r);
        g.lineTo(182, 105);
        g.lineTo(-182, 105);
        g.close();
        g.stroke();

        // 下三角
        g.moveTo(0, r);
        g.lineTo(182, -105);
        g.lineTo(-182, -105);
        g.close();
        g.stroke();
    }

    diamond(g: Graphics, r: number, w: number, a: number, c: Color) {
        g.lineWidth = w;
        g.strokeColor = new Color(c.r, c.g, c.b, a * 255);
        g.moveTo(0, -r);
        g.lineTo(r, 0);
        g.lineTo(0, r);
        g.lineTo(-r, 0);
        g.close();
        g.stroke();
    }

    ticks(g: Graphics) {
        g.lineWidth = 3;
        g.strokeColor = new Color(30, 30, 30, 0.35 * 255);

        for (let i = 0; i < 12; i++) {
            const a = i * Math.PI / 6;
            const x1 = Math.sin(a) * 320;
            const y1 = -Math.cos(a) * 320;
            const x2 = Math.sin(a) * 300;
            const y2 = -Math.cos(a) * 300;
            g.moveTo(x1, y1);
            g.lineTo(x2, y2);
        }
        g.stroke();
    }
}
