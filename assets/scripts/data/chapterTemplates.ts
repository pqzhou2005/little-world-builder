/**
 * ===============================
 * WORLD RULE DEFINITIONS – Myth Version
 * ===============================
 * 四章全是中国神话 / 传说骨架：
 * 1. 盘古开天 + 女娲补天
 * 2. 哪吒闹海
 * 3. 孙悟空大闹天宫
 * 4. 牛郎织女 + 孟姜女
 */

export type ChapterID = 'natural' | 'fairy_garden' | 'human_world' | 'future_dream';

declare function showChapterCompleteScreen(chapterId: ChapterID): void;

export type ChapterState = {
  owned: Set<string>;
};

type ChapterIntro = {
  title: string;
  story: string;
};

type ComboFeedback = {
  ingredients: string[];
  text: string;
};

type Rule = {
  ingredients: string[];
  reason: string;
  result: string;
};

export type Goal = {
  id: number;
  text: string;
  completeWhen: (state: ChapterState) => boolean;
};

export type ChapterTemplate = {
  initialElements: string[];
  maxPlaceholders: number;
  chapterIntro: ChapterIntro;
  chapterOutro: string;
  onComplete: () => void;
  freeExploreMessages: string[];
  failureToasts: string[];
  comboFeedback: ComboFeedback[];
  rules: Rule[];
  goals: Goal[];
  nextChapter: ChapterID | null;
};

export type ChapterTemplates = Record<ChapterID, ChapterTemplate>;

type ElementAsset = {
  slug: string;
  icon: string;
};

type ElementMetaEntry = {
  rarity: 'common' | 'rare' | 'legendary';
};

export const ELEMENT_ICONS: Record<string, string> = {
  // 通用
  火: '🔥',
  水: '💧',
  土: '🪨',
  空气: '💨',
  石头: '🪨',
  云: '☁️',
  雨: '🌧️',
  水帘洞: '🌊',

  // 第1章：盘古 / 女娲
  混沌: '🌫️',
  开天斧: '🪓',
  天地: '🌏',
  天: '☀️',
  地: '🌍',
  山: '⛰️',
  河流: '🏞️',
  海洋: '🌊',
  裂缝: '⚡️',
  女娲: '👩',
  泥土: '🟫',
  泥人: '🧍‍♂️',
  五色石: '💠',
  补天: '🧩',

  // 第2章：哪吒
  种子: '🌱',
  孩子: '🧒',
  莲花: '🌸',
  莲花台: '🪷',
  小孩: '🧒',
  莲花小孩: '👶',
  轮子: '🛞',
  风火轮: '🔥',
  布: '🧣',
  风: '💨',
  混天绫: '🧵',
  金属: '⛓️',
  圈: '⭕',
  乾坤圈: '🪙',
  哪吒: '👦',
  三头六臂: '💥',

  // 第3章：孙悟空
  猴子: '🐒',
  石猴: '🗿',
  美猴王: '🐵',
  棍子: '🥢',
  金箍棒: '⚔️',
  工具: '🧰',
  筋斗云: '🌪️',
  天宫: '🏰',
  天条: '📜',
  规则: '📜',

  // 第4章：牛郎织女 + 孟姜女
  星星: '⭐',
  河: '〰️',
  天河: '🌌',
  少年: '🧒',
  少女: '👧',
  恋人: '❤️',
  牛郎织女: '💑',
  鸟: '🐦',
  喜鹊: '🕊️',
  鸟群: '🕊️',
  鹊桥: '🌉',
  团圆: '🏠',
  眼泪: '💧',
  长城: '🧱',
  孟姜女: '👩',
  哭声: '📣',
  坍塌: '💥',
  思念: '💭',
  放下: '🍃',
  好梦: '😴',

  光: '✨',
  木头: '🪵',
  孙悟空: '🐵',
  禁令: '🚫',
  征夫: '⛏️',
  };

export const ELEMENT_ASSETS: Record<string, ElementAsset> = {
  火: { slug: 'element-fire', icon: 'assets/elements/element-fire.png' },
  水: { slug: 'element-water', icon: 'assets/elements/element-water.jpg' },
  土: { slug: 'element-earth', icon: 'assets/elements/element-earth.jpg' },
  空气: { slug: 'element-air', icon: 'assets/elements/element-air.png' },
  石头: { slug: 'element-stone', icon: 'assets/elements/element-stone.png' },
  光: { slug: 'element-light', icon: 'assets/elements/element-light.png' },
  风: { slug: 'element-wind', icon: 'assets/elements/element-wind.png' },
  混沌: { slug: 'element-chaos', icon: 'assets/elements/element-chaos.jpg' },
  开天斧: { slug: 'element-axe', icon: 'assets/elements/element-axe.jpg' },
  天地: { slug: 'element-cosmos', icon: 'assets/elements/element-cosmos.png' },
  天: { slug: 'element-sky', icon: 'assets/elements/element-sky.png' },
  地: { slug: 'element-ground', icon: 'assets/elements/element-ground.png' },
  山: { slug: 'element-mountain', icon: 'assets/elements/element-mountain.png' },
  河流: { slug: 'element-stream', icon: 'assets/elements/element-stream.png' },
  海洋: { slug: 'element-ocean', icon: 'assets/elements/element-ocean.png' },
  裂缝: { slug: 'element-rift', icon: 'assets/elements/element-rift.png' },
  女娲: { slug: 'element-nuwa', icon: 'assets/elements/element-nuwa.png' },
  泥土: { slug: 'element-clay', icon: 'assets/elements/element-clay.png' },
  泥人: { slug: 'element-clayman', icon: 'assets/elements/element-clayman.png' },
  五色石: { slug: 'element-prismstone', icon: 'assets/elements/element-prismstone.png' },
  补天: { slug: 'element-skyrestore', icon: 'assets/elements/element-skyrestore.png' },
  种子: { slug: 'element-seed', icon: 'assets/elements/element-seed.png' },
  孩子: { slug: 'element-child', icon: 'assets/elements/element-child.png' },
  莲花: { slug: 'element-lotus', icon: 'assets/elements/element-lotus.png' },
  莲花台: { slug: 'element-lotus-stand', icon: 'assets/elements/element-lotus-stand.png' },
  小孩: { slug: 'element-kid', icon: 'assets/elements/element-kid.png' },
  莲花小孩: { slug: 'element-lotus-kid', icon: 'assets/elements/element-lotus-kid.png' },
  轮子: { slug: 'element-wheel', icon: 'assets/elements/element-wheel.png' },
  风火轮: { slug: 'element-firewheel', icon: 'assets/elements/element-firewheel.png' },
  布: { slug: 'element-cloth', icon: 'assets/elements/element-cloth.png' },
  混天绫: { slug: 'element-sky-ribbon', icon: 'assets/elements/element-sky-ribbon.png' },
  金属: { slug: 'element-metal', icon: 'assets/elements/element-metal.png' },
  圈: { slug: 'element-ring', icon: 'assets/elements/element-ring.png' },
  乾坤圈: { slug: 'element-cosmos-ring', icon: 'assets/elements/element-cosmos-ring.png' },
  哪吒: { slug: 'element-nezha', icon: 'assets/elements/element-nezha.png' },
  三头六臂: { slug: 'element-threeheads', icon: 'assets/elements/element-threeheads.png' },
  猴子: { slug: 'element-monkey', icon: 'assets/elements/element-monkey.png' },
  石猴: { slug: 'element-stone-monkey', icon: 'assets/elements/element-stone-monkey.png' },
  美猴王: { slug: 'element-mighty-monkey', icon: 'assets/elements/element-mighty-monkey.png' },
  棍子: { slug: 'element-staff', icon: 'assets/elements/element-staff.png' },
  金箍棒: { slug: 'element-golden-staff', icon: 'assets/elements/element-golden-staff.png' },
  云: { slug: 'element-cloud', icon: 'assets/elements/element-cloud.png' },
  筋斗云: { slug: 'element-somersault', icon: 'assets/elements/element-somersault.png' },
  天宫: { slug: 'element-celestial-palace', icon: 'assets/elements/element-celestial-palace.png' },
  天条: { slug: 'element-heaven-decree', icon: 'assets/elements/element-heaven-decree.png' },
  星星: { slug: 'element-star', icon: 'assets/elements/element-star.png' },
  河: { slug: 'element-river', icon: 'assets/elements/element-river.png' },
  天河: { slug: 'element-heavenly-river', icon: 'assets/elements/element-heavenly-river.png' },
  少年: { slug: 'element-youth', icon: 'assets/elements/element-youth.png' },
  少女: { slug: 'element-maiden', icon: 'assets/elements/element-maiden.png' },
  恋人: { slug: 'element-lovers', icon: 'assets/elements/element-lovers.png' },
  牛郎织女: { slug: 'element-cowherd-weaver', icon: 'assets/elements/element-cowherd-weaver.png' },
  鸟: { slug: 'element-bird', icon: 'assets/elements/element-bird.png' },
  喜鹊: { slug: 'element-magpie', icon: 'assets/elements/element-magpie.png' },
  鸟群: { slug: 'element-flock', icon: 'assets/elements/element-flock.png' },
  鹊桥: { slug: 'element-magpie-bridge', icon: 'assets/elements/element-magpie-bridge.png' },
  团圆: { slug: 'element-reunion', icon: 'assets/elements/element-reunion.png' },
  眼泪: { slug: 'element-tears', icon: 'assets/elements/element-tears.png' },
  长城: { slug: 'element-great-wall', icon: 'assets/elements/element-great-wall.png' },
  孟姜女: { slug: 'element-mengjiang', icon: 'assets/elements/element-mengjiang.png' },
  哭声: { slug: 'element-wail', icon: 'assets/elements/element-wail.png' },
  坍塌: { slug: 'element-collapse', icon: 'assets/elements/element-collapse.png' },
  思念: { slug: 'element-longing', icon: 'assets/elements/element-longing.png' },
  心结: { slug: 'element-heart-knot', icon: 'assets/elements/element-heart-knot.png' },
  放下: { slug: 'element-let-go', icon: 'assets/elements/element-let-go.png' },
  好梦: { slug: 'element-sweet-dream', icon: 'assets/elements/element-sweet-dream.png' },
};

export const START_STORY = '很久以前，混沌初开，天地立起。可天宫的《天条》在一次震动中裂开，条文碎成无数“元素”，坠入人间与神话。有的碎片成了神的名号，有的碎片成了禁令与桥梁，也有的碎片落进了人的眼泪与梦里。你拾起这些碎片，用合成把故事重新拼回去——从开天到补天，从定名到破规，直到最后，替一个人把结局补完。';

export const chapterTemplates: ChapterTemplates = {
  /**
   * ===============================
   * 第 1 章：盘古开天 · 女娲补天
   * ===============================
   */
  natural: {
    initialElements: ['混沌', '开天斧', '水', '土'],
    maxPlaceholders: 20,
    chapterIntro: {
      title: '上古创世卷',
      story: '一切还在混沌里，只有一把开天斧在等着被举起来。听说天条碎落在世界各处——想找回它，得先让天地醒来。',
    },
    chapterOutro: '天地既开，天条才有地方落笔。',
    onComplete() {
      showChapterCompleteScreen('natural');
    },
    freeExploreMessages: [
      '🌫️ 混沌里什么都有，又什么都没有',
      '🪓 好像有人要举起那把开天斧',
    ],
    failureToasts: ['🌫️ 混沌只是翻了个身', '💤 世界还没醒过来'],
    comboFeedback: [
      { ingredients: ['混沌', '混沌'], text: '🌫️ 只是在打滚的雾气' },
      { ingredients: ['混沌', '开天斧'], text: '🪓 一声裂响，上下分了家' },
      { ingredients: ['天地', '水'], text: '🌧️ 雾气里好像有雨点' },
      { ingredients: ['天地', '土'], text: '🌍 重的那一半，慢慢落成根' },
      { ingredients: ['土', '土'], text: '🪨 久压成硬，石在土里醒' },
      { ingredients: ['天', '石头'], text: '⚡️ 天光一震，留下一道伤' },
      { ingredients: ['土', '水'], text: '🟫 泥在手心，柔软可塑' },
      { ingredients: ['泥土', '天地'], text: '👩 天地既立，像有人应声而来' },
      { ingredients: ['泥土', '女娲'], text: '🧍 一捏一按，轮廓就有了' },
      { ingredients: ['石头', '石头'], text: '💠 石里藏彩，五色浮上来' },
      { ingredients: ['五色石', '女娲'], text: '🧩 彩石上天，缝补苍穹' },
    ],
    rules: [
      { ingredients: ['混沌', '开天斧'], reason: '混沌被劈开，世界初醒', result: '天地' },

      { ingredients: ['天地', '水'], reason: '清者上升，水化为天', result: '天' },
      { ingredients: ['天地', '土'], reason: '浊重下沉，万物有根', result: '地' },

      { ingredients: ['地', '土'], reason: '土堆成势，便起山峦', result: '山' },
      { ingredients: ['山', '水'], reason: '水穿山势，流成河道', result: '河流' },
      { ingredients: ['水', '水'], reason: '水聚无边，便成海洋', result: '海洋' },

      // ✅ 补齐石头来源（不建议放初始化）
      { ingredients: ['土', '土'], reason: '土久凝结，化作石头', result: '石头' },

      { ingredients: ['天', '石头'], reason: '天光一震，裂出缝隙', result: '裂缝' },

      // 女娲补天
      { ingredients: ['土', '水'], reason: '水润其土，便成泥土', result: '泥土' },
      { ingredients: ['泥土', '天地'], reason: '天地既立，有神应世', result: '女娲' },
      { ingredients: ['泥土', '女娲'], reason: '女娲捏土，生命成形', result: '泥人' },

      // ✅ v1 先别依赖彩虹，避免天气系统膨胀/卡关
      { ingredients: ['石头', '石头'], reason: '五色凝石，补天所用', result: '五色石' },

      { ingredients: ['五色石', '女娲'], reason: '携五色石，补回苍穹', result: '补天' },
      { ingredients: ['补天', '裂缝'], reason: '裂缝补尽，天空安定', result: '天' },
    ],
    goals: [
      {
        id: 1,
        text: '🌏 劈开混沌，做出天地',
        completeWhen: (state: ChapterState) => state.owned.has('天地'),
      },
      {
        id: 2,
        text: '⛰️ 让山川河流出现',
        completeWhen: (state: ChapterState) => state.owned.has('山') && state.owned.has('河流'),
      },
      {
        id: 3,
        text: '🧍 捏出一个泥人',
        completeWhen: (state: ChapterState) => state.owned.has('泥人'),
      },
      {
        id: 4,
        text: '🧩 补好破掉的天空',
        completeWhen: (state: ChapterState) => state.owned.has('补天'),
      },
    ],
    nextChapter: 'fairy_garden',
  },

  /**
   * ===============================
   * 第 2 章：哪吒闹海
   * ===============================
   */
  fairy_garden: {
    initialElements: ['水', '种子', '孩子', '布', '金属', '火'],
    maxPlaceholders: 20,
    chapterIntro: {
      title: '哪吒卷',
      story: '天地初定，碎裂的天条开始写进万物：有些名字，需要神兵来“定”。海边的莲花轻轻晃动，一个孩子还没被叫出名字。',
    },
    chapterOutro: '名号被写下时，规矩也开始生长。',
  onComplete() {
    showChapterCompleteScreen('fairy_garden');
  },

  freeExploreMessages: [
    '🪷 莲心像在等一束光',
    '⭕ 金属在手，像要弯成一只圈',
    '🔥 水火相激，会起一阵风',
  ],

  failureToasts: [
    '🌊 海水哗啦，龙宫未醒',
    '🪷 莲心微烫，光还没来',
    '⭕ 金属作响，圈还没扣',
    '🔥 火一窜，风却没起',
  ],

  

  comboFeedback: [
    { ingredients: ['孩子', '水'], text: '🧒 孩子在水边玩水花' },
    { ingredients: ['水', '种子'], text: '🌸 一点生机在水里醒' },
    { ingredients: ['莲花', '火'], text: '✨ 莲心一热，像亮了一下' },
    { ingredients: ['莲花', '光'], text: '🪷 光落莲心，台座自生' },
    { ingredients: ['孩子', '莲花台'], text: '👶 台上有命，借莲而生' },
    { ingredients: ['水', '火'], text: '💨 水火相激，起了一阵风' },
    { ingredients: ['布', '风'], text: '🧵 布随风舞，像一条神绫' },
    { ingredients: ['莲花', '莲花'], text: '🪵 叶叶相叠，结成木骨' },
    { ingredients: ['金属', '金属'], text: '⭕ 金属一扣，弯成了圈' },
    { ingredients: ['金属', '圈'], text: '🪙 圈上生光，像定住乾坤' },
    { ingredients: ['轮子', '火'], text: '🔥 一点火，轮便要飞' },
    { ingredients: ['莲花小孩', '乾坤圈'], text: '👦 名号被圈住，哪吒要来了' },
    { ingredients: ['哪吒', '风火轮'], text: '💥 风火一踏，影子都不够站' },
  ],

  rules: [
    { ingredients: ['水', '种子'], reason: '水养其生，莲花初开', result: '莲花' },

    // 难度略高点：光需要先做出莲花
    { ingredients: ['莲花', '火'], reason: '莲心遇火，亮出微光', result: '光' },
    { ingredients: ['莲花', '光'], reason: '光落莲心，化作莲台', result: '莲花台' },

    { ingredients: ['孩子', '莲花台'], reason: '莲台托生，新身将成', result: '莲花小孩' },

    // 风（不初始化给）
    { ingredients: ['水', '火'], reason: '水火相激，生出气流', result: '风' },
    { ingredients: ['布', '风'], reason: '风起布舞，化作神绫', result: '混天绫' },

    // 木头（不初始化给，避免与莲花+火冲突）
    { ingredients: ['莲花', '莲花'], reason: '莲叶相叠，结成木骨', result: '木头' },

    { ingredients: ['木头', '金属'], reason: '木作其骨，金作其轮', result: '轮子' },
    { ingredients: ['轮子', '火'], reason: '火起轮转，风火相随', result: '风火轮' },

    // 圈→乾坤圈（法器线必须做）
    { ingredients: ['金属', '金属'], reason: '金属相扣，成一只圈', result: '圈' },
    { ingredients: ['金属', '圈'], reason: '一圈定乾坤，神兵成形', result: '乾坤圈' },

    // 哪吒需要法器“定名”
    { ingredients: ['莲花小孩', '乾坤圈'], reason: '圈定乾坤，名号方显', result: '哪吒' },

    // 结尾爆点：显神通
    { ingredients: ['哪吒', '风火轮'], reason: '风火一踏，神通大开', result: '三头六臂' },
  ],

  goals: [
    {
      id: 1,
      text: '🪷 做出一座莲花台',
      completeWhen: (state: ChapterState) => state.owned.has('莲花台'),
    },
    {
      id: 2,
      text: '👶 让莲花里的孩子站起来',
      completeWhen: (state: ChapterState) => state.owned.has('莲花小孩'),
    },
    {
      id: 3,
      text: '🔥 点亮风火轮',
      completeWhen: (state: ChapterState) => state.owned.has('风火轮'),
    },
    {
      id: 4,
      text: '💥 让哪吒显出神通',
      completeWhen: (state: ChapterState) => state.owned.has('三头六臂'),
    },
  ],

  nextChapter: 'human_world',
},

  /**
   * ===============================
   * 第 3 章：孙悟空大闹天宫
   * ===============================
   */
  human_world: {
    initialElements: ['猴子', '石头', '水', '风', '木头', '金属'],
    maxPlaceholders: 20,
    chapterIntro: {
      title: '齐天大圣卷',
      story: '名号一旦被定下，规矩也就跟着来。可偏有人不信天条。花果山的石头里，有一只猴子正要蹦出来——他要去天宫看看，规矩到底写了什么。',
    },
    chapterOutro: '规矩被撞响时，故事才真正开始。',
  onComplete() {
    showChapterCompleteScreen('human_world');
  },

  freeExploreMessages: [
    '🪨 石头堆得久了，也许会成山',
    '🕳️ 山后有水声，像藏着洞府',
    '🛠️ 木与金凑一起，像要变工具',
    '☁️ 水汽随风，云会聚起来',
    '📜 天宫里，可能藏着天条',
  ],

  failureToasts: [
    '🐒 猴子挠挠头，什么也没发生',
    '🪨 石头只是翻了个身',
    '💨 风吹过去了，像在等更大的事',
    '⚔️ 还差点意思，神兵没成形',
  ],

  

  comboFeedback: [
    { ingredients: ['石头', '石头'], text: '⛰️ 石头越堆越高，像要成山' },
    { ingredients: ['山', '水'], text: '🕳️ 水落如帘，像开了个洞' },
    { ingredients: ['木头', '金属'], text: '🛠️ 叮叮当当，像在打工具' },
    { ingredients: ['水', '风'], text: '☁️ 水汽被风卷起，聚成云' },
    { ingredients: ['云', '孙悟空'], text: '🌪️ 云一翻身，忽然会腾空' },
    { ingredients: ['天宫', '金属'], text: '📜 金光一闪，像写着天条' },
    { ingredients: ['猴子', '石头'], text: '🗿 石中有灵，先听见一声笑' },
    { ingredients: ['石猴', '水帘洞'], text: '🐵 入洞称王，山里有了主' },
    { ingredients: ['木头', '工具'], text: '🥢 削一削，手里多根棍' },
    { ingredients: ['棍子', '金属'], text: '⚔️ 金光一勒，兵器认主' },
    { ingredients: ['美猴王', '金箍棒'], text: '🐵 棒在手，名号自己来' },
    { ingredients: ['孙悟空', '筋斗云'], text: '🏰 一翻十万八，直上天门' },
    { ingredients: ['天宫', '天条'], text: '📜 字里生字，规矩长出来' },
  ],

  rules: [
    // 出生
    { ingredients: ['猴子', '石头'], reason: '石破天惊，灵猴得生', result: '石猴' },

    // 山与洞府（加难点 1）
    { ingredients: ['石头', '石头'], reason: '石堆成势，便起山峦', result: '山' },
    { ingredients: ['山', '水'], reason: '水落成帘，洞府自开', result: '水帘洞' },
    { ingredients: ['石猴', '水帘洞'], reason: '入洞得名，群猴共尊', result: '美猴王' },

    // 神兵链（准备感更强）
    { ingredients: ['木头', '金属'], reason: '木为柄，金为刃，先成工具', result: '工具' },
    { ingredients: ['木头', '工具'], reason: '削木成形，手里多了根棍', result: '棍子' },
    { ingredients: ['棍子', '金属'], reason: '金入木中，棍化神兵', result: '金箍棒' },

    // 云与筋斗云（加难点 2：必须孙悟空点化）
    { ingredients: ['水', '风'], reason: '水汽被风卷起，凝成云', result: '云' },
    { ingredients: ['云', '孙悟空'], reason: '悟空一点，云就会翻', result: '筋斗云' },

    // 成名与上天宫
    { ingredients: ['美猴王', '金箍棒'], reason: '名王持神兵，齐天之名起', result: '孙悟空' },
    { ingredients: ['孙悟空', '筋斗云'], reason: '踏云上天，直闯天宫', result: '天宫' },

    // 彩蛋链：天条 / 规则
    { ingredients: ['天宫', '金属'], reason: '天宫金光里，写着天条', result: '天条' },
    { ingredients: ['天宫', '天条'], reason: '天条一立，规矩成形', result: '规则' },
  ],

  goals: [
    {
      id: 1,
      text: '🗿 叫醒一只石猴',
      completeWhen: (state: ChapterState) => state.owned.has('石猴'),
    },
    {
      id: 2,
      text: '🐵 让石猴变成美猴王',
      completeWhen: (state: ChapterState) => state.owned.has('美猴王'),
    },
    {
      id: 3,
      text: '⚔️ 找到金箍棒',
      completeWhen: (state: ChapterState) => state.owned.has('金箍棒'),
    },
    {
      id: 4,
      text: '🏰 让他跳到天宫去',
      completeWhen: (state: ChapterState) => state.owned.has('天宫'),
    },
  ],

  nextChapter: 'future_dream',
},


  /**
   * ===============================
   * 第 4 章：牛郎织女 + 孟姜女
   * ===============================
   */
  future_dream: {
    initialElements: ['星星', '河', '少年', '少女', '石头', '眼泪', '鸟'],
    maxPlaceholders: 20,
    chapterIntro: {
      title: '情感与约定卷',
      story: '天宫被吵醒后，天条落得更重：有情人被隔在天河两岸，有人守着长城等一个不归的人。碎片最后会落进谁的梦里，就看你怎么拼。',
    },
    chapterOutro: '禁令可以挡路，挡不住人心回家的方向。',
  onComplete() {
    showChapterCompleteScreen('future_dream');
  },

  freeExploreMessages: [
    '📜 天上有天条，缘分也要过关',
    '💭 思念若成形，鸟也会听见',
    '🧱 长城之下，好像埋着一个人',
  ],

  failureToasts: [
    '🌙 夜里静了一会儿',
    '🚫 像被什么拦住了',
    '💧 眼泪停在了眼眶里',
    '🪨 石头没动，只是听着',
  ],

  

  comboFeedback: [
    { ingredients: ['眼泪', '星星'], text: '💭 泪映星光，像在想念' },
    { ingredients: ['鸟', '思念'], text: '🕊️ 鸟听见想念，变得温柔' },
    { ingredients: ['星星', '星星'], text: '📜 星光排成字，像天条' },
    { ingredients: ['天河', '天条'], text: '🚫 天河之上，多了一道禁令' },
    { ingredients: ['石头', '石头'], text: '🧱 石石相垒，城墙起了' },
    { ingredients: ['少年', '长城'], text: '⛏️ 像有人被征去筑城' },
    { ingredients: ['星星', '河'], text: '🌌 星落水面，夜里多一条河' },
    { ingredients: ['少年', '少女'], text: '❤️ 一眼对上，心里有线' },
    { ingredients: ['恋人', '天河'], text: '💑 隔着天河，也要相望' },
    { ingredients: ['喜鹊', '喜鹊'], text: '🕊️ 两翼相呼，越来越多' },
    { ingredients: ['鸟群', '禁令'], text: '🌉 群翼搭桥，越过那条线' },
    { ingredients: ['牛郎织女', '鹊桥'], text: '🏠 一步踏过，便是团圆' },
    { ingredients: ['少女', '征夫'], text: '👩 走到尽头，只为一声唤' },
    { ingredients: ['孟姜女', '眼泪'], text: '📣 泪落有声，夜也颤' },
    { ingredients: ['哭声', '长城'], text: '💥 城墙听哭，轰然松动' },
    { ingredients: ['思念', '石头'], text: '🍃 心若落地，慢慢轻了' },
    { ingredients: ['放下', '星星'], text: '😴 星光盖被，好梦降临' },
  ],

  rules: [
    // —— 牛郎织女线（加闯关门槛：天条/禁令）——
    { ingredients: ['星星', '河'], reason: '星落入水，化作天河', result: '天河' },
    { ingredients: ['少年', '少女'], reason: '两人相望，情意成形', result: '恋人' },
    { ingredients: ['恋人', '天河'], reason: '隔河相恋，传成神话', result: '牛郎织女' },

    // 先做“思念”，喜鹊才会来（比原版更闯关）
    { ingredients: ['眼泪', '星星'], reason: '泪映星光，化作思念', result: '思念' },
    { ingredients: ['鸟', '思念'], reason: '听见思念，喜鹊飞来', result: '喜鹊' },
    { ingredients: ['喜鹊', '喜鹊'], reason: '喜鹊相聚，成群而来', result: '鸟群' },

    // 天条→禁令：设置“关卡门”
    { ingredients: ['星星', '星星'], reason: '星光成章，写下天条', result: '天条' },
    { ingredients: ['天河', '天条'], reason: '天条一出，天河禁渡', result: '禁令' },

    // 破禁成桥
    { ingredients: ['鸟群', '禁令'], reason: '群鹊搭翼，破禁成桥', result: '鹊桥' },
    { ingredients: ['牛郎织女', '鹊桥'], reason: '踏上鹊桥，终得团圆', result: '团圆' },

    // —— 孟姜女线（加闯关门槛：先出征夫）——
    { ingredients: ['石头', '石头'], reason: '石石相垒，筑成长城', result: '长城' },
    { ingredients: ['少年', '长城'], reason: '被征筑城，人成征夫', result: '征夫' },
    { ingredients: ['少女', '征夫'], reason: '寻夫到此，孟姜女来', result: '孟姜女' },
    { ingredients: ['孟姜女', '眼泪'], reason: '泪落成声，哭彻夜空', result: '哭声' },
    { ingredients: ['哭声', '长城'], reason: '哭声震壁，长城坍塌', result: '坍塌' },

    // —— 情绪线：思念 → 放下 → 好梦（保持不变）——
    { ingredients: ['思念', '石头'], reason: '思念落地，慢慢放下', result: '放下' },
    { ingredients: ['放下', '星星'], reason: '放下之后，好梦降临', result: '好梦' },
  ],

  goals: [
    { id: 1, text: '🌌 先找到一条天河', completeWhen: (state: ChapterState) => state.owned.has('天河') },
    { id: 2, text: '💑 让牛郎织女重新团圆', completeWhen: (state: ChapterState) => state.owned.has('团圆') },
    { id: 3, text: '🧱 看见一段长城', completeWhen: (state: ChapterState) => state.owned.has('长城') },
    { id: 4, text: '😭 听到哭倒长城的故事', completeWhen: (state: ChapterState) => state.owned.has('坍塌') },
    { id: 5, text: '😴 得到一份好梦', completeWhen: (state: ChapterState) => state.owned.has('好梦') },
  ],

  nextChapter: null,
},
};
export const ELEMENT_META: Record<string, ElementMetaEntry> = {
  // 第1章：创世与补天（里程碑）
  天地: { rarity: 'rare' },
  补天: { rarity: 'rare' },

  // 第2章：哪吒（里程碑）
  哪吒: { rarity: 'rare' },
  三头六臂: { rarity: 'rare' },

  // 第3章：悟空（里程碑）
  孙悟空: { rarity: 'rare' },
  天宫: { rarity: 'rare' },

  // 第4章：情感与约定（关卡门 + 大结局）
  天条: { rarity: 'rare' },
  团圆: { rarity: 'rare' },

  // 全剧终局：给“情绪收束”当 legendary（爆款更像样）
  好梦: { rarity: 'legendary' },
};
