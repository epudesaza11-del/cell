
import { CharacterId, SceneId, ScriptLine, QuizQuestion, InventoryItem } from './types';
import { CHARACTERS } from './assets/images';

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
    avatar: CHARACTERS.RBC, 
    bio: "性格开朗但方向感极差的新人红细胞。负责运输氧气和二氧化碳。虽然迷糊，但在关键时刻意外地可靠。" 
  },
  [CharacterId.MACROPHAGE]: { 
    name: "巨噬细胞", 
    color: "text-pink-400", 
    avatar: CHARACTERS.MACROPHAGE, 
    bio: "外表是优雅的大姐姐，实则是战斗力爆表的杀手。笑眯眯地挥舞柴刀消灭细菌，同时也负责清理死亡细胞。口头禅是“哎呀哎呀”。" 
  },
  [CharacterId.B_CELL]: { 
    name: "B细胞", 
    color: "text-blue-400", 
    avatar: CHARACTERS.B_CELL, 
    bio: "手持大型喷枪的少年，负责针对特定抗原生产抗体。稍微有点情绪化，不喜欢被当成小孩子。" 
  },
  [CharacterId.KILLER_T]: { 
    name: "杀手T细胞", 
    color: "text-yellow-600", 
    avatar: CHARACTERS.KILLER_T, 
    bio: "肌肉发达的武斗派，接受过胸腺魔鬼训练。不仅攻击病毒，也会处决被感染的细胞。对非我族类绝不手软。" 
  },
  [CharacterId.DENDRITIC]: { 
    name: "树突状细胞", 
    color: "text-green-600", 
    avatar: CHARACTERS.DENDRITIC, 
    bio: "驻扎在树上的情报官。负责将抗原信息传递给辅助T细胞，从而激活整个免疫系统。看起来人畜无害，实际上掌握着所有人的黑历史照片。" 
  },
  [CharacterId.VIRUS]: { 
    name: "流感病毒", 
    color: "text-green-400", 
    avatar: CHARACTERS.VIRUS, 
    bio: "伪装成无害的样子入侵细胞，利用细胞工厂复制自己。会导致发热、恶寒、关节痛等症状。" 
  },
  [CharacterId.PLATELET]: { 
    name: "血小板", 
    color: "text-yellow-300", 
    avatar: CHARACTERS.PLATELET, 
    bio: "体型微小的专业维修队。虽然看起来是幼儿园小朋友，但能够熟练地使用凝血因子封闭伤口。" 
  },
  [CharacterId.ELDER]: { 
    name: "长老树", 
    color: "text-emerald-800", 
    avatar: CHARACTERS.ELDER, 
    bio: "免疫系统的古老智慧象征，负责掌管复活的秘密知识。" 
  },
};

export const ITEMS_DB: Record<string, InventoryItem> = {
  'diary': { id: 'diary', name: '红细胞日记', description: '记录了迷路日常的笔记本。字迹非常工整，但画的地图完全看不懂。', icon: '📔' },
  'key': { 
    id: 'key', 
    name: '精英训练营门禁卡', 
    description: '来源：由免疫系统最高教育机构颁发。\n\n功能描述：\n这是一把通往胸腺道馆的钥匙。\n那里是T细胞的专属训练基地。\n听说那里只有最严格、最能分清“敌我”的学员才能毕业。\n\n当前状态：[已激活]\n地图更新：地图上的【胸腺】节点已解锁！现在你可以去那里参观T细胞的热血训练，或者……去接受一点“填空题”的毒打。', 
    icon: '🗝️' 
  },
  'video': { id: 'video', name: '前线监控录像', description: '记录了抗原呈递过程的珍贵影像。这是启动免疫反应的关键情报。', icon: '📼' },
};

export const DIARY_CONTENT = [
  {
    title: "【第一页：晴转多云】",
    content: "“今天运送氧气的订单特别多！肺部那边的风车转得好慢，听说是有些地方堵住了。我不喜欢那边，总感觉空气里有一股奇怪的、发霉的味道（病毒的气味）。希望不要出事……”"
  },
  {
    title: "【第二页：大地震？】",
    content: "“哇啊啊！刚刚发生了大地震（人体发抖/寒战）！整个大动脉都在晃，我差点把氧气箱甩飞出去！大家都很慌张，而且我发现街道上的温度越来越高了，空调是不是坏了呀？”"
  },
  {
    title: "【第三页：高温警报】",
    content: "“太热了……太热了……（发烧39度）。现在的体温高得离谱，虽然我们跑得更快了（心跳加速），但感觉整个人都要融化了。听说这是下丘脑市长为了烫死病毒故意调高的温度。可是……我也好难受啊。”"
  },
  {
    title: "【第四页：新的希望】",
    content: "“听说大脑司令部断线了，但是来了一个新的指挥官（指玩家）！他刚刚指挥巨噬细胞姐姐打了一场漂亮的胜仗！太好了，这下大家又有干劲了！指挥官，虽然你可能听不到，但请带我们赢下去吧！”"
  }
];

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
    { id: '2_M_3', speaker: 'SYSTEM', text: "【系统】新联系人！巨噬细胞 已加入通讯录。", nextTrigger: 'CLICK', nextIndex: 1 },

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
    // [FIX]: Change Trigger to PHONE_CALL so clicking the dialogue doesn't auto-advance to the "Wrong Choice" (Platelet).
    { id: '4_2', speaker: CharacterId.RBC_08, text: "指挥官，快！左键点击通讯器摇人！这种时候没时间看资料了，全靠你的记忆了！", showCharacters: [CharacterId.RBC_08, CharacterId.VIRUS], nextTrigger: 'PHONE_CALL' },
    
    // 2: --- BRANCH: Fail Platelet (Target Index) ---
    { id: '4_FAIL_P', speaker: CharacterId.PLATELET, text: "指挥官你让我来上吗？？呜呜呜，这里没有伤口，我修不了...", showCharacters: [CharacterId.PLATELET, CharacterId.VIRUS], nextTrigger: 'CLICK', nextIndex: 1 },
    
    // 3: --- BRANCH: Fail B-Cell (Target Index) ---
    { id: '4_FAIL_B', speaker: CharacterId.B_CELL, text: "不行，我还在分析数据，没法近战！现在需要坦克！", showCharacters: [CharacterId.B_CELL, CharacterId.VIRUS], nextTrigger: 'CLICK', nextIndex: 1 },
    
    // 4: --- BRANCH: Success Macrophage (Target Index) ---
    { id: '4_SUCCESS_M', speaker: CharacterId.MACROPHAGE, text: "收到。正好饿了。", showCharacters: [CharacterId.MACROPHAGE, CharacterId.VIRUS], nextTrigger: 'CLICK' },
    // 5: Next Phase
    { id: '4_NEXT', speaker: 'SYSTEM', text: "巨噬细胞已加入战场！战斗阶段开启。", showCharacters: [CharacterId.MACROPHAGE, CharacterId.VIRUS], nextTrigger: 'CLICK' },

    // 6: Weapon Select Ask
    { id: '4_WEAPON_ASK', speaker: CharacterId.MACROPHAGE, text: "哎呀，这也太多了。指挥官，快下令吧！我该怎么处理这些小东西？", showCharacters: [CharacterId.MACROPHAGE, CharacterId.VIRUS], nextTrigger: 'WEAPON_SELECT' },

    // 7: Weapon Fail Antibody (Y型抗体)
    { id: '4_FAIL_ANTIBODY', speaker: CharacterId.MACROPHAGE, text: "指挥官，这是B细胞的飞镖啊！我没有远程攻击的能力，难道让我拿着它去戳病毒吗？", showCharacters: [CharacterId.MACROPHAGE, CharacterId.VIRUS], nextTrigger: 'CLICK', nextIndex: 6 },
    
    // 8: Weapon Fail Drill (穿孔素电钻)
    { id: '4_FAIL_DRILL', speaker: CharacterId.MACROPHAGE, text: "这...这是T细胞用来给被感染的细胞‘打孔’用的！我可不会用这种暴力工具。", showCharacters: [CharacterId.MACROPHAGE, CharacterId.VIRUS], nextTrigger: 'CLICK', nextIndex: 6 },
    
    // --- Resurrection Branch (Moved Up) ---
    // 9: System reconnect
    { id: 'RESURRECT_1', speaker: 'SYSTEM', text: "（从胸腺/智慧之树传送回肺部...）正在重建连接... 信号恢复！", showCharacters: [CharacterId.MACROPHAGE, CharacterId.VIRUS], nextTrigger: 'CLICK' },
    // 10: Macrophage welcome
    { id: 'RESURRECT_2', speaker: CharacterId.MACROPHAGE, text: "指挥官，你回来的正是时候。", showCharacters: [CharacterId.MACROPHAGE, CharacterId.VIRUS], nextTrigger: 'CLICK' },
    // 11: Macrophage ready
    { id: 'RESURRECT_3', speaker: CharacterId.MACROPHAGE, text: "这帮家伙很难缠。既然你‘进修’归来了，这次一定知道该怎么对付它们了吧？", showCharacters: [CharacterId.MACROPHAGE, CharacterId.VIRUS], nextTrigger: 'CLICK' },
    // 12: Macrophage prompt -> Trigger Weapon Select
    { id: 'RESURRECT_4', speaker: CharacterId.MACROPHAGE, text: "再下一次命令吧！这一次，我绝对不会输！", showCharacters: [CharacterId.MACROPHAGE, CharacterId.VIRUS], nextTrigger: 'WEAPON_SELECT' },

    // 13: Weapon Success Net (吞噬捕捕网) - MOVED TO END
    { id: '4_SUCCESS_NET', speaker: CharacterId.MACROPHAGE, text: "没错！不管来多少，全部吞下去！", showCharacters: [CharacterId.MACROPHAGE], nextTrigger: 'CLICK' }, // Virus removed from showCharacters
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
  [SceneId.ANTIGEN_PRESENTATION]: [], // 逻辑已交由 VideoPlayer 组件接管，清空脚本以防冲突
  [SceneId.DEATH_QUIZ]: [
    { id: 'D_1', speaker: CharacterId.ELDER, text: "哎呀，挂掉了吗？基础不牢，地动山摇啊！来，回答我的问题，答对我就帮你回血。", showCharacters: [CharacterId.ELDER], nextTrigger: 'QUIZ_START' },
  ],
  [SceneId.THYMUS_PRISON]: [
    { id: 'T_1', speaker: CharacterId.KILLER_T, text: "这里是胸腺魔鬼训练营！想出去？先通过基础测试！", showCharacters: [CharacterId.KILLER_T], nextTrigger: 'CLICK' },
    { id: 'T_2', speaker: CharacterId.KILLER_T, text: "听好了：T细胞是在哪里发育成熟的？(请输入答案)", showCharacters: [CharacterId.KILLER_T], nextTrigger: 'THYMUS_GAME' },
  ]
};
