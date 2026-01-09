import type { ChapterTemplate, ChapterState, ChapterID  } from '../data/chapterTemplates';

const SAVE_KEY = 'qp-save';

type SaveData = {
  chapterId: ChapterID;
  owned: string[];
  goalIndex: number;
};

export type CombineResult =
  | { ok: true; result: string; reason: string; isNew: boolean }
  | { ok: false };

function makeKey(a: string, b: string) {
  return [a, b].sort().join('+');
}

export class GameCore {
  private rulesMap = new Map<string, { result: string; reason: string }>();

  // 这里复刻你 web 版的状态结构：owned + ownedOrder
  public owned = new Set<string>();
  public ownedOrder: string[] = [];

  public currentGoalIndex = 0;

  constructor(public template: ChapterTemplate, private templateId: ChapterID) {
    // init owned
    for (const e of template.initialElements ?? []) {
      this.addNewElement(e, { silent: true });
    }

    // rules
    for (const r of template.rules ?? []) {
      const key = makeKey(r.ingredients[0], r.ingredients[1]);
      this.rulesMap.set(key, { result: r.result, reason: r.reason });
    }

    // init goals progress
    this.advanceGoalsIfNeeded();
  }

  /** 给 goals.completeWhen 使用的 state（你模板需要 owned: Set<string>） */
  public getChapterState(): ChapterState {
    return { owned: this.owned };
  }

  public has(name: string) {
    return this.owned.has(name);
  }

  public addNewElement(name: string, opts?: { silent?: boolean }): boolean {
    if (this.owned.has(name)) return false;
    this.owned.add(name);
    this.ownedOrder.push(name);
    if (!opts?.silent) {
      this.advanceGoalsIfNeeded();
    }
    return true;
  }

  public tryCombine(a: string, b: string): CombineResult {
    const key = makeKey(a, b);
    const rule = this.rulesMap.get(key);
    if (!rule) return { ok: false };

    const isNew = this.addNewElement(rule.result);
    // 合成后推进目标（如果 result 是新元素才推进也可以；这里统一推进一次）
    this.advanceGoalsIfNeeded();

    return { ok: true, result: rule.result, reason: rule.reason, isNew };
  }

  public getCurrentGoalText(): string {
    const goals = this.template.goals ?? [];
    if (this.currentGoalIndex < goals.length) {
      return goals[this.currentGoalIndex].text;
    }
    // goals 全完成后：自由探索提示（取第一句就行，后面再做轮换）
    return (this.template.freeExploreMessages?.[0]) ?? '随便试试不同的组合吧～';
  }

  public advanceGoalsIfNeeded(): number[] {
    const completed: number[] = [];
    const goals = this.template.goals ?? [];
    while (this.currentGoalIndex < goals.length) {
      const g = goals[this.currentGoalIndex];
      const done = g.completeWhen(this.getChapterState());
      if (!done) break;
      completed.push(g.id);
      this.currentGoalIndex += 1;
    }
    return completed;
  }

  public isChapterCompleted(): boolean {
    return this.currentGoalIndex >= (this.template.goals?.length ?? 0);
  }

  public static hasSave(): boolean {
    return localStorage.getItem(SAVE_KEY) !== null;
  }

  public static loadChapterId(): ChapterID | null {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    try {
      return (JSON.parse(raw) as SaveData).chapterId;
    } catch {
      return null;
    }
  }

  public static clearSave() {
    localStorage.removeItem(SAVE_KEY);
  }


  public save() {
    const data: SaveData = {
      chapterId: this.templateId,
      owned: this.ownedOrder,
      goalIndex: this.currentGoalIndex,
    };
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(data));
    } catch {}
  }

  public load() {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return;
    try {
      const data = JSON.parse(raw) as SaveData;
      if (data.chapterId !== this.templateId) return;
      if (!Array.isArray(data.owned)) return;
      this.owned = new Set(data.owned);
      this.ownedOrder = data.owned.slice();
      if (typeof data.goalIndex === 'number') {
        this.currentGoalIndex = data.goalIndex;
      }
    } catch {}
  }
}
