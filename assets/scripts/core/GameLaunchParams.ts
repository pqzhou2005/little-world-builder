import type { ChapterID } from '../data/chapterTemplates';

export enum LaunchMode {
  NewGame,
  Continue,
  Restart,
}

export class GameLaunchParams {
  static mode: LaunchMode = LaunchMode.NewGame;
  static chapterId: ChapterID = 'natural';
}
