import { CharacterId, SceneId, ScriptLine, QuizQuestion, InventoryItem } from './types';

export const INITIAL_HP = 3;

// Visual Assets Mapping
export const CHARACTER_ASSETS: Record<CharacterId, { name: string, color: string, avatar: string, bio: string }> = {
  [CharacterId.PLAYER]: { 
    name: "我", 
    color: "text-gray-200", 
    avatar: "", 
    bio: "这具身体的指挥官（你）。虽然没有生物学学位，但掌握着细胞们的命运。" 
  },
  [CharacterId.RBC_08]: { 
    name: "红细胞 AE3803", 
    color: "text-red-500", 
    avatar: "https://placehold.co/300x500/ef4444/ffffff?text=RBC", 
    bio: "性格开朗但方向感极差的新人红细胞。负责运输氧气和二氧化碳。虽然迷糊，但在关键时刻意外地可靠。" 
  },
  [CharacterId.MACROPHAGE]: { 
    name: "巨噬细胞", 
    color: "text-pink-400", 
    avatar: "https://placehold.co/300x500/f472b6/ffffff?text=Macro", 
    bio: "外表是优雅的大姐姐，实则是战斗力爆表的杀手。笑眯眯地挥舞柴刀消灭细菌，同时也负责清理死亡细胞。口头禅是“哎呀哎呀”。" 
  },
  [CharacterId.B_CELL]: { 
    name: "B细胞", 
    color: "text-blue-400", 
    avatar: "https://placehold.co/300x500/60a5fa/ffffff?text=B-Cell", 
    bio: "手持大型喷枪的少年，负责针对特定抗原生产抗体。稍微有点情绪化，不喜欢被当成小孩子。" 
  },
  [CharacterId.KILLER_T]: { 
    name: "杀手T细胞", 
    color: "text-yellow-600", 
    avatar: "https://placehold.co/300x500/ca8a04/ffffff?text=KillerT", 
    bio: "肌肉发达的武斗派，接受过胸腺魔鬼训练。不仅攻击病毒，也会处决被感染的细胞。对非我族类绝不手软。" 
  },
  [CharacterId.DENDRITIC]: { 
    name: "树突状细胞", 
    color: "text-green-600", 
    avatar: "https://placehold.co/300x500/16a34a/ffffff?text=Tree", 
    bio: "驻扎在树上的情报官。负责将抗原信息传递给辅助T细胞，从而激活整个免疫系统。看起来人畜无害，实际上掌握着所有人的黑历史照片。" 
  },
  [CharacterId.VIRUS]: { 
    name: "流感病毒", 
    color: "text-green-400", 
    avatar: "https://placehold.co/300x500/22c55e/000000?text=VIRUS", 
    bio: "伪装成无害的样子入侵细胞，利用细胞工厂复制自己。会导致发热、恶寒、关节痛等症状。" 
  },
  [CharacterId.PLATELET]: { 
    name: "血小板", 
    color: "text-yellow-300", 
    avatar: "https://placehold.co/300x500/fde047/000000?text=Platelet", 
    bio: "体型微小的专业维修队。虽然看起来是幼儿园小朋友，但能够熟练地使用凝血因子封闭伤口。" 
  },
  [CharacterId.ELDER]: { 
    name: "长老树", 
    color: "text-emerald-800", 
    avatar: "https://placehold.co/300x500/065f46/ffffff?text=Elder", 
    bio: "免疫系统的古老智慧象征，负责掌管复活的秘密知识。" 
  },
};

export const ITEMS_DB: Record<string, InventoryItem> = {
  'diary': { id: 'diary', name: '红细胞日记', description: '记录了迷路日常的笔记本。', icon: '📔' },
  'key': { id: 'key', name: '胸腺钥匙', description: '通往魔鬼训练营的钥匙。', icon: '🗝️' },
  'video': { id: 'video', name: '前线监控录像', description: '记录了抗原呈递过程的珍贵影像。', icon: '📼' },
};

// 确保前两题是复活专用题
export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    question: "巨噬细胞属于哪道防线？",
    options: ["第一道（物理防线）", "第二道（先天免疫）", "第三道（适应性免疫）"],
    correctIndex: 1,
    rewardHp: 1
  },
  {
    question: "巨噬细胞的主要攻击方式是什么？",
    options: ["发射抗体", "吞噬消化", "释放穿孔素"],
    correctIndex: 1,
    rewardHp: 1
  },
  {
    question: "被病毒感染的细胞，通常由谁来处决？",
    options: ["红细胞", "杀手T细胞", "血小板"],
    correctIndex: 1,
    rewardHp: 1
  },
  {
    question: "针对特定抗原生产抗体的是谁？",
    options: ["B细胞", "树突状细胞", "中性粒细胞"],
    correctIndex: 0,
    rewardHp: 1
  },
  {
    question: "负责修补血管破损的小可爱是谁？",
    options: ["巨噬细胞", "辅助T细胞", "血小板"],
    correctIndex: 2,
    rewardHp: 1
  }
];

export const SCENE_SCRIPT: Record<SceneId, ScriptLine[]> = {
  [SceneId.BEDROOM]: [
    { id: '0_1', speaker: '???', text: "咳... 咳... 这次流感比想象中严重。", nextTrigger: 'CLICK' },
    { id: '0_2', speaker: '???', text: "头好痛... 身体发烫... 体温计快爆了。", nextTrigger: 'CLICK' },
    { id: '0_3', speaker: '???', text: "不行了... 眼皮好重... 希望做个... 健康的梦...", nextTrigger: 'AUTO' },
  ],
  [SceneId.ARTERY]: [
    { id: '1_1', speaker: CharacterId.RBC_08, text: "太好了！眼睛睁开了！大家看，指挥官醒了！", showCharacters: [CharacterId.RBC_08], nextTrigger: 'CLICK' },
    { id: '1_2', speaker: CharacterId.RBC_08, text: "呼... 我是红细胞 AE3803。你晕倒了好久，吓死我了。", showCharacters: [CharacterId.RBC_08], nextTrigger: 'CLICK' },
    { id: '1_3', speaker: CharacterId.RBC_08, text: "这里是主动脉商业街。既然醒了，点击左下角的【地图】按钮。我们需要去巡逻！", showCharacters: [CharacterId.RBC_08], nextTrigger: 'MAP_OPEN' },
  ],
  [SceneId.BONE_MARROW]: [
    // 0: Intro
    { id: '2_0', speaker: CharacterId.RBC_08, text: "这里是大家的出生地‘骨髓幼儿园’。看，那是巨噬细胞姐姐！", showCharacters: [CharacterId.RBC_08], nextTrigger: 'CLICK' },
    // 1: Idle state (waiting for click)
    { id: '2_1', speaker: 'SYSTEM', text: "（点击画面中的 巨噬细胞 或 B细胞 进行互动）", showCharacters: [CharacterId.RBC_08], nextTrigger: 'CLICK', nextIndex: 1 },
    
    // --- Macrophage Branch (Index 2-4) ---
    { id: '2_M_1', speaker: CharacterId.MACROPHAGE, text: "哎呀，新指挥官？饿不饿？我正在煮细菌汤呢。", showCharacters: [CharacterId.MACROPHAGE], nextTrigger: 'CLICK' },
    { id: '2_M_2', speaker: CharacterId.RBC_08, text: "姐姐你别吓着新人。指挥官，右键点击通讯器里的头像可以看资料，但左键点击才是联系她哦。", showCharacters: [CharacterId.MACROPHAGE, CharacterId.RBC_08], nextTrigger: 'CLICK' },
    // Return to idle
    { id: '2_M_3', speaker: 'SYSTEM', text: "New Contact! 巨噬细胞 已加入通讯录。", nextTrigger: 'CLICK', nextIndex: 1 },

    // --- B-Cell Branch (Index 5-6) ---
    { id: '2_B_1', speaker: CharacterId.B_CELL, text: "哼，别来烦我，我的抗体导弹还没组装好。", showCharacters: [CharacterId.B_CELL], nextTrigger: 'CLICK' },
    { id: '2_B_2', speaker: 'SYSTEM', text: "B细胞 已加入通讯录。", nextTrigger: 'CLICK', nextIndex: 1 },
  ],
  [SceneId.ALARM]: [
    // 0: Waiting for phone pickup - Screen shaking red, phone buzzing
    { id: '3_1', speaker: 'SYSTEM', text: "（警报！通讯器正在剧烈震动，检测到高危信号！）", nextTrigger: 'CLICK' }, 
    // 1: Phone Open - Dendritic Cell Speaking via Video Call
    { id: '3_2', speaker: CharacterId.DENDRITIC, text: "呼叫指挥官！前线急报！呼吸道（肺部）的风车全被绿色的粘液糊住了！请求支援！", showCharacters: [], nextTrigger: 'CLICK' },
    // 2: RBC reaction bubble
    { id: '3_3', speaker: CharacterId.RBC_08, text: "天哪！是肺部！指挥官快看地图！", showCharacters: [], nextTrigger: 'MAP_OPEN' },
  ],
  [SceneId.LUNG_BATTLE]: [
    // 0: Intro
    { id: '4_1', speaker: CharacterId.RBC_08, text: "哇！好多绿色怪物！是流感病毒！", showCharacters: [CharacterId.RBC_08, CharacterId.VIRUS], nextTrigger: 'CLICK' },
    // 1: Instruction
    { id: '4_2', speaker: CharacterId.RBC_08, text: "指挥官，快！左键点击通讯器摇人！这种时候没时间看资料了，全靠你的记忆了！", showCharacters: [CharacterId.RBC_08, CharacterId.VIRUS], nextTrigger: 'CLICK' },
    
    // 2: --- BRANCH: Fail Platelet (Target Index) ---
    { id: '4_FAIL_P', speaker: CharacterId.PLATELET, text: "指挥官你让我来上吗？？呜呜呜，这里没有伤口，我修不了...", showCharacters: [CharacterId.PLATELET, CharacterId.VIRUS], nextTrigger: 'CLICK', nextIndex: 1 },
    
    // 3: --- BRANCH: Fail B-Cell (Target Index) ---
    { id: '4_FAIL_B', speaker: CharacterId.B_CELL, text: "不行，我还在分析数据，没法近战！现在需要坦克！", showCharacters: [CharacterId.B_CELL, CharacterId.VIRUS], nextTrigger: 'CLICK', nextIndex: 1 },
    
    // 4: --- BRANCH: Success Macrophage (Target Index) ---
    { id: '4_SUCCESS_M', speaker: CharacterId.MACROPHAGE, text: "收到。正好饿了。", showCharacters: [CharacterId.MACROPHAGE, CharacterId.VIRUS], nextTrigger: 'CLICK' },
    // 5: Next Phase
    { id: '4_NEXT', speaker: 'SYSTEM', text: "巨噬细胞已加入战场！战斗阶段开启。", showCharacters: [CharacterId.MACROPHAGE, CharacterId.VIRUS], nextTrigger: 'CLICK' },

    // 6: Weapon Select Ask
    { id: '4_WEAPON_ASK', speaker: CharacterId.MACROPHAGE, text: "哎呀，这也太多了。指挥官，快给个武器！", showCharacters: [CharacterId.MACROPHAGE, CharacterId.VIRUS], nextTrigger: 'WEAPON_SELECT' },

    // 7: Weapon Fail Missile
    { id: '4_FAIL_MISSILE', speaker: CharacterId.MACROPHAGE, text: "Y型导弹？这高科技我不会用啊！", showCharacters: [CharacterId.MACROPHAGE, CharacterId.VIRUS], nextTrigger: 'CLICK', nextIndex: 6 },
    
    // 8: Weapon Fail Laser
    { id: '4_FAIL_LASER', speaker: CharacterId.MACROPHAGE, text: "玩具激光枪？这种东西连灰尘都打不死！", showCharacters: [CharacterId.MACROPHAGE, CharacterId.VIRUS], nextTrigger: 'CLICK', nextIndex: 6 },
    
    // 9: Weapon Success Spoon
    { id: '4_SUCCESS_SPOON', speaker: CharacterId.MACROPHAGE, text: "这就对了！我开动了！", showCharacters: [CharacterId.MACROPHAGE], nextTrigger: 'CLICK' }, // Virus removed from showCharacters for visual effect in logic
  ],
  [SceneId.VICTORY]: [
    { id: '5_1', speaker: CharacterId.DENDRITIC, text: "太帅了！指挥官！我也没闲着，这些病毒碎片（抗原）我收集好了！", showCharacters: [CharacterId.DENDRITIC], nextTrigger: 'CLICK' },
    { id: '5_2', speaker: CharacterId.DENDRITIC, text: "我要去交给长老。指挥官，记得来智慧之树找我们玩啊！", showCharacters: [CharacterId.DENDRITIC], nextTrigger: 'CLICK' },
    { id: '5_3', speaker: 'SYSTEM', text: "积分 +500。解锁 [巨噬细胞图鉴]。", nextTrigger: 'CLICK' },
    { id: '5_4', speaker: 'SYSTEM', text: "（打开地图，前往淋巴结商店吧！）", nextTrigger: 'MAP_OPEN' },
  ],
  [SceneId.SHOP]: [
    { id: '6_1', speaker: CharacterId.ELDER, text: "欢迎光临智慧之树。年轻的指挥官，你需要什么？", showCharacters: [CharacterId.ELDER], nextTrigger: 'SHOP_OPEN' },
  ],
  [SceneId.ANTIGEN_PRESENTATION]: [
    { id: '7_1', speaker: CharacterId.ELDER, text: "（播放录像中...）看，侦察兵将抗原碎片递给了我。", showCharacters: [CharacterId.ELDER], nextTrigger: 'CLICK' },
    { id: '7_2', speaker: 'SYSTEM', text: "【抗原呈递】：树突状细胞摄取抗原后，会将其呈递给T细胞，从而激活特异性免疫反应。", showCharacters: [CharacterId.ELDER], nextTrigger: 'CLICK' },
    { id: '7_3', speaker: CharacterId.ELDER, text: "现在，整个免疫系统都收到了警报。干得好。", showCharacters: [CharacterId.ELDER], nextTrigger: 'CLICK' },
    { id: '7_4', speaker: 'SYSTEM', text: "（录像结束。返回商店。）", nextTrigger: 'SHOP_OPEN' },
  ],
  [SceneId.DEATH_QUIZ]: [
    { id: 'D_1', speaker: CharacterId.ELDER, text: "哎呀，挂掉了吗？基础不牢，地动山摇啊！来，回答我的问题，答对我就帮你回血。", showCharacters: [CharacterId.ELDER], nextTrigger: 'CHOICE' },
  ],
  [SceneId.THYMUS_PRISON]: [
    { id: 'T_1', speaker: CharacterId.KILLER_T, text: "这里是胸腺魔鬼训练营！想出去？先通过基础测试！", showCharacters: [CharacterId.KILLER_T], nextTrigger: 'CLICK' },
    { id: 'T_2', speaker: CharacterId.KILLER_T, text: "听好了：T细胞是在哪里发育成熟的？(请输入答案)", showCharacters: [CharacterId.KILLER_T], nextTrigger: 'THYMUS_GAME' },
  ]
};
