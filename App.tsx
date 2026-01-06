
import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
// 引入图标库，用于UI界面的各种按钮图标
import { Map as MapIcon, Tablet, Heart, Backpack, ShieldAlert, X, Info, Brain, SignalHigh, Contact, Ban, Rocket, Utensils, Zap, ShoppingBag, Lock, Play, GraduationCap, CheckCircle, Activity, GitMerge, Aperture, Syringe, Tv, BookOpen, ArrowLeft, ArrowRight, Dumbbell } from 'lucide-react';
// 引入类型定义，确保代码类型安全
import { SceneId, CharacterId, GameState, ScriptLine, InventoryItem } from './types';
// 引入常量数据：剧本、初始数值、角色资源、物品数据等
import { SCENE_SCRIPT, CHARACTER_ASSETS, INITIAL_HP, QUIZ_QUESTIONS, ITEMS_DB, DIARY_CONTENT } from './constants';
// 引入UI组件：按钮、对话框、角色立绘
import { Button, DialogueBox, CharacterPortrait } from './components/UIComponents';
// 引入背景图片资源
import { BACKGROUNDS, CHARACTERS } from './assets/images'; 

const App: React.FC = () => {
  // --- State (状态管理) ---
  
  // 1. 游戏核心状态 (GameState)
  // 保存游戏进度相关的数据，如当前场景、对话进度、血量、背包物品等
  const [gameState, setGameState] = useState<GameState>({
    currentScene: SceneId.BEDROOM, // 当前所处场景ID
    dialogueIndex: 0,              // 当前场景剧情播放到第几句
    hp: INITIAL_HP,                // 当前血量
    maxHp: 3,                      // 最大血量
    points: 0,                     // 积分（货币）
    unlockedMapNodes: [SceneId.ARTERY], // 地图上已解锁的节点
    contacts: [CharacterId.RBC_08],     // 手机通讯录已添加的角色
    inventory: [ITEMS_DB['diary']],     // 背包物品
    flags: {                       // 特殊标志位，用于逻辑判断
      metMacrophage: false,        // 是否见过巨噬细胞
      metBCell: false,             // 是否见过B细胞
      battlePhase: 'NONE',         // 战斗阶段状态
      deathCount: 0,               // 死亡次数（用于触发不同结局或惩罚）
      quizCorrectCount: 0,         // 答题正确数
      hasNewContact: false,        // 是否有新联系人（用于UI红点提示）
    }
  });

  // 2. UI 界面状态 (UiState)
  // 控制各种弹窗的显示/隐藏，以及动画效果
  const [uiState, setUiState] = useState({
    showMap: false,          // 地图弹窗
    showPhone: false,        // 手机/通讯录弹窗
    showInventory: false,    // 背包弹窗
    showWeaponSelect: false, // 武器选择弹窗
    showShop: false,         // 商店弹窗
    showThymusGame: false,   // 胸腺问答小游戏弹窗
    showTasks: false,        // 任务列表弹窗
    showQuizModal: false,    // 死亡问答弹窗
    showDiary: false,        // 日记弹窗
    diaryPage: 0,            // 当前日记页码
    shake: false,            // 全局屏幕震动效果
    modalShake: false,       // 弹窗震动效果 (新增)
    isDying: false,          // 是否正在播放死亡动画
    isMacrophageAttacking: false, // 巨噬细胞攻击动画开关
    selectedBioId: null as CharacterId | null, // 当前查看详情的角色ID
    thymusInput: '',         // 胸腺问答的输入框内容
    inventoryTab: 'items' as 'items' | 'dex', // 背包当前的标签页（物品/图鉴）
    selectedItem: null as InventoryItem | null, // 背包中当前选中的物品
  });

  // 3. 视频播放器状态 (Antigen Presentation Animation)
  const [videoPhase, setVideoPhase] = useState(0);

  // --- Constants ---
  const SCENE_NAMES: Record<SceneId, string> = {
    [SceneId.BEDROOM]: '卧室',
    [SceneId.ARTERY]: '大动脉',
    [SceneId.BONE_MARROW]: '骨髓',
    [SceneId.ALARM]: '警报中心',
    [SceneId.LUNG_BATTLE]: '肺部战场',
    [SceneId.VICTORY]: '胜利',
    [SceneId.SHOP]: '淋巴结商店',
    [SceneId.DEATH_QUIZ]: '意识深处',
    [SceneId.THYMUS_PRISON]: '胸腺训练营',
    [SceneId.ANTIGEN_PRESENTATION]: '抗原呈递'
  };

  // --- Logic Hooks (副作用与自动化逻辑) ---

  // 0. 图片预加载 (解决场景切换卡顿问题)
  useEffect(() => {
    const imagesToPreload = [
      BACKGROUNDS.AORTA, // 大动脉背景（切换时容易卡顿）
      BACKGROUNDS.BONE_MARROW,
      BACKGROUNDS.SHOP,
      CHARACTERS.RBC, // 预加载红细胞立绘
      CHARACTERS.MACROPHAGE,
      CHARACTERS.B_CELL,
      CHARACTERS.VIRUS,
      CHARACTERS.DENDRITIC,
      CHARACTERS.ELDER,
    ];

    imagesToPreload.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []);
  
  // 1. 骨髓场景的自动剧情跳转
  // 当玩家在骨髓场景同时见过了巨噬细胞和B细胞后，自动跳转到警报场景
  useEffect(() => {
    if (gameState.currentScene === SceneId.BONE_MARROW) {
       const hasMetMacro = gameState.contacts.includes(CharacterId.MACROPHAGE);
       const hasMetBCell = gameState.contacts.includes(CharacterId.B_CELL);
       
       // 如果两个人都见过了，且当前处于空闲对话状态（index 1）
       if (hasMetMacro && hasMetBCell && gameState.dialogueIndex === 1) {
          setTimeout(() => {
             setGameState(prev => ({
                ...prev,
                currentScene: SceneId.ALARM,
                dialogueIndex: 0,
             }));
          }, 1500); // 延迟1.5秒跳转
       }
    }
  }, [gameState.currentScene, gameState.contacts, gameState.dialogueIndex]);

  // 2. 死亡判定逻辑
  // 当血量归零且在肺部战斗场景时，触发死亡流程
  useEffect(() => {
    if (gameState.hp <= 0 && gameState.currentScene === SceneId.LUNG_BATTLE) {
      // 开启死亡特效
      setUiState(prev => ({ ...prev, isDying: true }));

      // 等待动画结束后切换到死亡问答场景
      setTimeout(() => {
        setUiState(prev => ({ ...prev, isDying: false }));
        setGameState(prev => ({
          ...prev,
          currentScene: SceneId.DEATH_QUIZ,
          dialogueIndex: 0,
          flags: { ...prev.flags, battlePhase: 'NONE' }
        }));
        // 注意：这里不直接显示答题框，而是等待长老树说完台词（通过 nextTrigger: 'QUIZ_START' 触发）
      }, 2000);
    }
  }, [gameState.hp, gameState.currentScene]);

  // 3. 消除红点逻辑
  // 打开手机时，清除"新联系人"标志
  useEffect(() => {
    if (uiState.showPhone) {
      updateFlag('hasNewContact', false);
    }
  }, [uiState.showPhone]);

  // 4. 抗原呈递视频播放逻辑
  useEffect(() => {
    if (gameState.currentScene === SceneId.ANTIGEN_PRESENTATION) {
      setVideoPhase(1);
      
      const sequence = async () => {
         // Phase 1: 树突进场 (0s - 3s)
         setVideoPhase(1);
         await new Promise(r => setTimeout(r, 4000));
         
         // Phase 2: 长老接收 (3s - 7s)
         setVideoPhase(2);
         await new Promise(r => setTimeout(r, 4000));
         
         // Phase 3: 激活特效 (7s - 11s)
         setVideoPhase(3);
         await new Promise(r => setTimeout(r, 4000));
         
         // Phase 4: 下令 (11s - 15s)
         setVideoPhase(4);
         await new Promise(r => setTimeout(r, 4000));
         
         // Phase 5: 结束画面 (Wait for close)
         setVideoPhase(5);
      };
      
      sequence();
    } else {
      setVideoPhase(0);
    }
  }, [gameState.currentScene]);


  // --- Helpers (辅助函数) ---
  
  // 获取当前场景的剧本数据
  const currentScript = SCENE_SCRIPT[gameState.currentScene];
  // 确保索引安全，防止数组越界
  const safeIndex = (currentScript && gameState.dialogueIndex < currentScript.length) ? gameState.dialogueIndex : 0;
  const currentLine: ScriptLine | undefined = currentScript?.[safeIndex];

  // 判断是否在对话框显示下箭头（提示玩家可以点击继续）
  // 只有当触发器是点击、自动或开始答题时才显示，如果是打开地图等交互操作则不显示
  const shouldShowArrow = currentLine ? (currentLine.nextTrigger === 'CLICK' || currentLine.nextTrigger === 'AUTO' || currentLine.nextTrigger === 'QUIZ_START') : false;

  // 更新游戏标志位的通用函数
  const updateFlag = (key: keyof GameState['flags'], value: any) => {
    setGameState(prev => ({ ...prev, flags: { ...prev.flags, [key]: value } }));
  };

  // 扣血逻辑：同时触发屏幕震动特效
  const takeDamage = (amount: number) => {
    setUiState(prev => ({ ...prev, shake: true }));
    // 0.5秒后关闭震动
    setTimeout(() => setUiState(prev => ({ ...prev, shake: false })), 500);
    
    setGameState(prev => {
      const newHp = prev.hp - amount;
      return { ...prev, hp: newHp };
    });
  };

  // --- Game System Logic (游戏系统逻辑) ---

  // 动态计算当前任务列表
  const getTasks = () => {
    const tasks = [];
    
    // 任务1：前往骨髓
    if (gameState.currentScene === SceneId.ARTERY || gameState.currentScene === SceneId.BEDROOM || gameState.currentScene === SceneId.BONE_MARROW) {
      tasks.push({
        id: 1,
        text: "前往骨髓 (打开地图)",
        done: gameState.currentScene === SceneId.BONE_MARROW
      });
    }

    // 任务2：结识伙伴
    if (gameState.currentScene === SceneId.BONE_MARROW || gameState.contacts.length < 3) {
      const needed = [CharacterId.MACROPHAGE, CharacterId.B_CELL]; 
      const found = needed.filter(c => gameState.contacts.includes(c)).length;
      tasks.push({
        id: 2,
        text: `结识新细胞伙伴 (${found}/${needed.length})`,
        done: found === needed.length
      });
    }

    // 任务3：前往商店
    if (gameState.currentScene === SceneId.VICTORY || gameState.points > 0) {
      tasks.push({
        id: 3,
        text: "前往淋巴结商店 (智慧之树)",
        done: gameState.currentScene === SceneId.SHOP
      });
    }

    return tasks;
  };

  // --- Handlers (交互事件处理) ---
  
  // 处理点击对话框，推进剧情
  const handleAdvanceDialogue = () => {
    if (!currentLine) return;
    
    // 如果下一条触发器是打开特定界面，则阻止剧情继续，直到玩家完成操作
    if (currentLine.nextTrigger === 'MAP_OPEN') return;
    if (currentLine.nextTrigger === 'PHONE_CALL') return; // [FIX] 阻止点击对话框推进，必须使用手机
    if (currentLine.nextTrigger === 'WEAPON_SELECT') {
      setUiState(prev => ({ ...prev, showWeaponSelect: true }));
      return;
    }
    if (currentLine.nextTrigger === 'SHOP_OPEN') {
      setUiState(prev => ({ ...prev, showShop: true }));
      return;
    }
    if (currentLine.nextTrigger === 'THYMUS_GAME') {
      setUiState(prev => ({ ...prev, showThymusGame: true, thymusInput: '' }));
      return;
    }
    if (currentLine.nextTrigger === 'CHOICE') {
      // 战斗中的特殊分支选择点
      if (gameState.currentScene === SceneId.LUNG_BATTLE && gameState.flags.battlePhase === 'NONE') {
         updateFlag('battlePhase', 'CALL_ALLY');
      }
      return;
    }
    // 触发死亡问答弹窗
    if (currentLine.nextTrigger === 'QUIZ_START') {
      setUiState(prev => ({ ...prev, showQuizModal: true }));
      return; 
    }

    // 支持跳转到特定的对话ID（分支剧情用）
    if (currentLine.nextIndex !== undefined) {
      setGameState(prev => ({ ...prev, dialogueIndex: currentLine.nextIndex! }));
      return;
    }

    // 正常推进下一句
    if (gameState.dialogueIndex < currentScript.length - 1) {
      setGameState(prev => ({ ...prev, dialogueIndex: prev.dialogueIndex + 1 }));
    } else {
      // 当前场景对话结束，处理场景切换逻辑
      if (gameState.currentScene === SceneId.BEDROOM) {
        setGameState(prev => ({ ...prev, currentScene: SceneId.ARTERY, dialogueIndex: 0 }));
      } else if (gameState.currentScene === SceneId.LUNG_BATTLE) {
        setGameState(prev => ({ 
           ...prev, 
           currentScene: SceneId.VICTORY, 
           dialogueIndex: 0,
           points: prev.points + 500 // 胜利加分
        }));
        setUiState(prev => ({ ...prev, isMacrophageAttacking: false }));
      } else if (gameState.currentScene === SceneId.ANTIGEN_PRESENTATION) {
         setGameState(prev => ({ ...prev, currentScene: SceneId.SHOP, dialogueIndex: 0 }));
      }
    }
  };

  // 地图旅行逻辑
  const handleMapTravel = (destination: SceneId) => {
    setUiState(prev => ({ ...prev, showMap: false }));
    setGameState(prev => ({ 
      ...prev, 
      currentScene: destination, 
      dialogueIndex: 0,
      unlockedMapNodes: [...new Set([...prev.unlockedMapNodes, destination])]
    }));
  };

  // 手机联系人呼叫逻辑（战斗中使用）
  const handleContactCall = (id: CharacterId) => {
    setUiState(prev => ({ ...prev, showPhone: false }));
    if (gameState.currentScene === SceneId.LUNG_BATTLE) {
       // 辅助函数：查找剧本中对应的行ID
       const findScriptIndex = (scriptId: string) => {
         return SCENE_SCRIPT[SceneId.LUNG_BATTLE].findIndex(line => line.id === scriptId);
       };

       // 根据选择的角色触发不同的剧情分支
       if (id === CharacterId.PLATELET) {
          takeDamage(1); // 错误选择扣血
          setGameState(prev => ({ ...prev, dialogueIndex: findScriptIndex('4_FAIL_P') }));
       } else if (id === CharacterId.B_CELL) {
          takeDamage(1);
          setGameState(prev => ({ ...prev, dialogueIndex: findScriptIndex('4_FAIL_B') }));
       } else if (id === CharacterId.MACROPHAGE) {
          // 正确选择，进入下一阶段
          setGameState(prev => ({ 
             ...prev, 
             dialogueIndex: findScriptIndex('4_SUCCESS_M'),
             flags: { ...prev.flags, battlePhase: 'EQUIP_WEAPON' } 
          }));
       } else {
          takeDamage(1);
       }
       return;
    }
  };

  // 武器选择逻辑
  const handleWeaponSelect = (weapon: 'ANTIBODY' | 'NET' | 'DRILL') => {
    setUiState(prev => ({ ...prev, showWeaponSelect: false }));
    const findScriptIndex = (scriptId: string) => {
      return SCENE_SCRIPT[SceneId.LUNG_BATTLE].findIndex(line => line.id === scriptId);
    };

    if (weapon === 'ANTIBODY') {
      takeDamage(1);
      setGameState(prev => ({ ...prev, dialogueIndex: findScriptIndex('4_FAIL_ANTIBODY') }));
    } else if (weapon === 'DRILL') {
      takeDamage(1);
      setGameState(prev => ({ ...prev, dialogueIndex: findScriptIndex('4_FAIL_DRILL') }));
    } else if (weapon === 'NET') {
      // 吞噬捕捕网 (正确)
      setGameState(prev => ({ ...prev, dialogueIndex: findScriptIndex('4_SUCCESS_NET') }));
      setUiState(prev => ({ ...prev, isMacrophageAttacking: true })); // 触发吞噬动画
    }
  };

  // 商店购买逻辑
  const handleShopBuy = (itemId: string, cost: number) => {
     if (gameState.points >= cost) {
        setGameState(prev => ({
           ...prev,
           points: prev.points - cost,
           inventory: [...prev.inventory, ITEMS_DB[itemId]]
        }));
        // 特殊物品触发特殊剧情
        if (itemId === 'video') {
           setUiState(prev => ({ ...prev, showShop: false }));
           setGameState(prev => ({ ...prev, currentScene: SceneId.ANTIGEN_PRESENTATION, dialogueIndex: 0 }));
        } else if (itemId === 'key') {
           // 购买钥匙解锁新地图节点
           setGameState(prev => ({ ...prev, unlockedMapNodes: [...prev.unlockedMapNodes, SceneId.THYMUS_PRISON] }));
        }
     } else {
        // 积分不足，震动提示
        setUiState(prev => ({ ...prev, shake: true }));
        setTimeout(() => setUiState(prev => ({ ...prev, shake: false })), 500);
     }
  };

  // 关闭录像带播放
  const handleCloseVideo = () => {
     // 回到商店场景
     setGameState(prev => ({ ...prev, currentScene: SceneId.SHOP, dialogueIndex: 0 }));
  };

  // 手机中右键点击查看详情
  const handleContactRightClick = (e: React.MouseEvent, id: CharacterId) => {
    e.preventDefault();
    if (gameState.currentScene === SceneId.LUNG_BATTLE) return; // 战斗中禁止查看闲置资料
    setUiState(prev => ({ ...prev, selectedBioId: id }));
  };

  // 死亡问答逻辑
  const handleQuizAnswer = (isCorrect: boolean, reward: number) => {
    if (isCorrect) {
       // 答对复活
       const newHp = Math.min(gameState.maxHp, gameState.hp + reward);
       setGameState(prev => ({
         ...prev,
         hp: newHp,
         flags: { ...prev.flags, quizCorrectCount: prev.flags.quizCorrectCount + 1 }
       }));
       setUiState(prev => ({ ...prev, showQuizModal: false })); 
       
       // 如果血量恢复到大于0，等待1秒后重置回战斗场景 (满血回归剧情)
       if (newHp > 0) {
          setTimeout(() => {
             // 查找复活剧情的起始索引
             const resurrectIndex = SCENE_SCRIPT[SceneId.LUNG_BATTLE].findIndex(l => l.id === 'RESURRECT_1');
             
             setGameState(prev => ({ 
                ...prev, 
                currentScene: SceneId.LUNG_BATTLE, 
                // 如果找不到索引（虽然不太可能），则回退到开头，否则跳转到复活点
                dialogueIndex: resurrectIndex !== -1 ? resurrectIndex : 0, 
                hp: prev.maxHp,
                // 直接进入装备武器阶段，跳过摇人
                flags: { ...prev.flags, battlePhase: 'EQUIP_WEAPON' }
             }));
             // 确保巨噬细胞特效关闭
             setUiState(prev => ({ ...prev, isMacrophageAttacking: false }));
          }, 1000);
       }
    } else {
       // 答错 - 触发选择框震动提醒
       setUiState(prev => ({ ...prev, modalShake: true }));
       setTimeout(() => setUiState(prev => ({ ...prev, modalShake: false })), 500);

       const newDeathCount = gameState.flags.deathCount + 1;
       setGameState(prev => ({
          ...prev,
          flags: { ...prev.flags, deathCount: newDeathCount }
       }));

       // 累计失败两次，进入惩罚关卡（胸腺监狱）
       if (newDeathCount >= 2) {
          // 延迟一点关闭，以便看完震动
          setTimeout(() => {
             setUiState(prev => ({ ...prev, showQuizModal: false }));
             setGameState(prev => ({
                ...prev,
                points: Math.floor(prev.points / 2), // 扣除积分
                currentScene: SceneId.THYMUS_PRISON,
                dialogueIndex: 0
             }));
          }, 500);
       }
    }
  };

  // 胸腺监狱填空题逻辑
  const handleThymusSubmit = () => {
    if (uiState.thymusInput.trim().includes('胸腺')) {
       // 回答正确
       setUiState(prev => ({ ...prev, showThymusGame: false }));
       
       if (gameState.hp <= 0) {
           // 死亡惩罚进入的情况：复活回战斗
           const resurrectIndex = SCENE_SCRIPT[SceneId.LUNG_BATTLE].findIndex(l => l.id === 'RESURRECT_1');

           setGameState(prev => ({
              ...prev,
              hp: prev.maxHp,
              currentScene: SceneId.LUNG_BATTLE, // 重试战斗
              dialogueIndex: resurrectIndex !== -1 ? resurrectIndex : 0,
              flags: { ...prev.flags, battlePhase: 'EQUIP_WEAPON' }
           }));
           setUiState(prev => ({ ...prev, isMacrophageAttacking: false }));
       } else {
           // 钥匙主动进入的情况：回到大动脉首场景
           setGameState(prev => ({
              ...prev,
              currentScene: SceneId.ARTERY,
              dialogueIndex: 0
           }));
       }
    } else {
       setUiState(prev => ({ ...prev, shake: true }));
       setTimeout(() => setUiState(prev => ({ ...prev, shake: false })), 500);
    }
  };

  // NPC 互动逻辑 (场景2：骨髓)
  const handleMeetCharacter = (charId: CharacterId, jumpToIndex: number) => {
    setGameState(prev => {
      const isNew = !prev.contacts.includes(charId);
      const newContacts = isNew ? [...prev.contacts, charId] : prev.contacts;
      return {
        ...prev,
        dialogueIndex: jumpToIndex,
        contacts: newContacts,
        flags: { ...prev.flags, hasNewContact: prev.flags.hasNewContact || isNew }
      };
    });
  };

  // --- Backgrounds (背景样式处理) ---
  const getBackgroundStyle = () => {
    switch (gameState.currentScene) {
      case SceneId.BEDROOM: return 'bg-cover bg-center bg-no-repeat relative';
      case SceneId.ARTERY: return 'bg-[radial-gradient(circle_at_center,_#ef4444_0%,_#7f1d1d_100%)]';
      case SceneId.BONE_MARROW: return 'bg-cover bg-center bg-no-repeat relative';
      case SceneId.ALARM: return 'bg-red-950'; 
      case SceneId.LUNG_BATTLE: return 'bg-cover bg-center bg-no-repeat relative';
      case SceneId.VICTORY: return 'bg-cover bg-center bg-no-repeat relative';
      case SceneId.SHOP: 
      case SceneId.DEATH_QUIZ: 
      case SceneId.ANTIGEN_PRESENTATION:
          return 'bg-cover bg-center bg-no-repeat relative';
      case SceneId.THYMUS_PRISON: return 'bg-[radial-gradient(ellipse_at_top,_#f59e0b_0%,_#78350f_100%)]'; // 道场风格
      default: return 'bg-black';
    }
  };

  // --- Render Interactables (渲染场景中的可交互物体) ---
  const renderInteractables = () => {
    // 仅在骨髓场景显示可点击的NPC
    if (gameState.currentScene === SceneId.BONE_MARROW) {
      const isIdle = gameState.dialogueIndex <= 1; // 只有在闲置状态下才能点击
      const activeChars = currentLine?.showCharacters || [];

      // 避免重复渲染：如果当前正在和该角色对话，隐藏背景中的可交互立绘
      const showMacrophage = !activeChars.includes(CharacterId.MACROPHAGE);
      const showBCell = !activeChars.includes(CharacterId.B_CELL);

      return (
        <div className="absolute inset-0 z-10 pointer-events-none">
          {/* 巨噬细胞 NPC */}
          {showMacrophage && (
            <div 
              onClick={() => isIdle && handleMeetCharacter(CharacterId.MACROPHAGE, 2)}
              className={`absolute top-[20%] left-[5%] pointer-events-auto cursor-pointer transition-transform hover:scale-105 group ${!isIdle ? 'opacity-50 grayscale' : ''}`}
            >
               <div className="relative flex flex-col items-center">
                  <img 
                     src={CHARACTER_ASSETS[CharacterId.MACROPHAGE].avatar} 
                     className="h-[60vh] w-auto object-contain drop-shadow-2xl"
                     alt="Macrophage"
                  />
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-pink-100 text-pink-800 px-3 py-1 rounded-full text-xs font-bold border-2 border-pink-300 shadow-sm group-hover:bg-pink-200 whitespace-nowrap z-20">
                     巨噬细胞
                  </div>
               </div>
            </div>
          )}

          {/* B细胞 NPC */}
          {showBCell && (
            <div 
              onClick={() => isIdle && handleMeetCharacter(CharacterId.B_CELL, 5)}
              className={`absolute top-[20%] right-[5%] pointer-events-auto cursor-pointer transition-transform hover:scale-105 group ${!isIdle ? 'opacity-50 grayscale' : ''}`}
            >
               <div className="relative flex flex-col items-center">
                  <img 
                     src={CHARACTER_ASSETS[CharacterId.B_CELL].avatar} 
                     className="h-[60vh] w-auto object-contain drop-shadow-2xl"
                     alt="B-Cell"
                  />
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-bold border-2 border-blue-300 shadow-sm group-hover:bg-blue-200 whitespace-nowrap z-20">
                     B细胞
                  </div>
               </div>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  // 决定当前显示哪个问答题目 (根据死亡次数循环)
  const currentQuizIndex = Math.min(gameState.flags.deathCount, 1); 
  const currentQuiz = QUIZ_QUESTIONS[currentQuizIndex];

  // 手机联系人过滤逻辑
  const getPhoneContacts = () => {
    // 在肺部战斗时，强制显示特定三个选项（作为游戏机制）
    if (gameState.currentScene === SceneId.LUNG_BATTLE) {
       return [CharacterId.MACROPHAGE, CharacterId.B_CELL, CharacterId.PLATELET];
    }
    return gameState.contacts;
  };

  // 图鉴解锁条件：认识了红细胞以外的人
  const isEncyclopediaUnlocked = gameState.contacts.length > 1;

  // --- Main Render (主渲染函数) ---
  // 使用分层渲染策略 (Layer 0 - Layer 4)
  return (
    <div 
       className={`w-full h-screen overflow-hidden relative font-sans text-gray-800 select-none ${getBackgroundStyle()} ${uiState.shake ? 'animate-shake' : ''}`}
       style={{
  backgroundImage: 
    gameState.currentScene === SceneId.ARTERY ? `url(${BACKGROUNDS.AORTA})` :
    gameState.currentScene === SceneId.BEDROOM ? `url(${BACKGROUNDS.BEDROOM})` : 
    gameState.currentScene === SceneId.BONE_MARROW ? `url(${BACKGROUNDS.BONE_MARROW})` :
    gameState.currentScene === SceneId.LUNG_BATTLE ? `url(${BACKGROUNDS.LUNG_BATTLE})` :
    gameState.currentScene === SceneId.VICTORY ? `url(${BACKGROUNDS.VICTORY})` :
    (gameState.currentScene === SceneId.SHOP || gameState.currentScene === SceneId.DEATH_QUIZ || gameState.currentScene === SceneId.ANTIGEN_PRESENTATION) ? `url(${BACKGROUNDS.SHOP})` :
    undefined
}}
    >
      
      {/* ==================== LAYER 0: Background Elements (背景层) ==================== */}
      <div className={`absolute inset-0 z-0 opacity-20 bg-[url('${BACKGROUNDS.CUBES_PATTERN}')] mix-blend-overlay`}></div>
      
      {/* 死亡红屏特效 */}
      {uiState.isDying && (
        <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black animate-fade-in-up">
           <div className="text-red-600 font-bold text-6xl animate-pulse">
              系统严重警告
           </div>
        </div>
      )}

      {/* 警报闪烁遮罩 */}
      {gameState.currentScene === SceneId.ALARM && (
        <div className="absolute inset-0 bg-red-500/20 z-0 animate-pulse pointer-events-none"></div>
      )}

      {/* 肺部战斗迷雾遮罩 */}
      {gameState.currentScene === SceneId.LUNG_BATTLE && (
         <div className="absolute inset-0 z-0 pointer-events-none bg-gradient-to-t from-green-900/40 to-transparent"></div>
      )}

      {/* 商店/树 暗色遮罩 */}
      {(gameState.currentScene === SceneId.SHOP || gameState.currentScene === SceneId.DEATH_QUIZ) && (
         <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.6)_100%)] z-10"></div>
      )}

      {/* ==================== LAYER 1: Main Character Display (角色立绘层) ==================== */}
      {/* 在播放抗原呈递动画时，隐藏默认角色层 */}
      {gameState.currentScene !== SceneId.ANTIGEN_PRESENTATION && (
        <div className="absolute bottom-0 left-0 w-full h-full flex items-end justify-center z-10 pointer-events-none pb-0 overflow-hidden">
           {currentLine?.showCharacters?.map((charId, index) => (
             <div key={charId} 
                  className={`
                     ${index === 0 ? "relative z-20" : "absolute z-10 opacity-70 scale-90 -left-20"}
                     ${charId === CharacterId.MACROPHAGE && uiState.isMacrophageAttacking ? 'transition-all duration-[2000ms] scale-[4] z-50 origin-center blur-sm opacity-90' : ''}
                     ${charId === CharacterId.VIRUS && uiState.isMacrophageAttacking ? 'transition-all duration-500 opacity-0 scale-0 delay-500' : ''}
                  `}
             > 
                <CharacterPortrait id={charId} isEnemy={charId === CharacterId.VIRUS} />
             </div>
           ))}
           
           {/* 消化特效文字 */}
           {uiState.isMacrophageAttacking && (
              <div className="absolute inset-0 z-[60] flex items-center justify-center animate-fade-in-up delay-1000">
                 <div className="text-pink-200 font-bold text-6xl drop-shadow-lg tracking-widest bg-pink-900/50 px-8 py-4 rounded-full border-4 border-pink-400">
                    消化中...
                 </div>
              </div>
           )}
        </div>
      )}

      {/* ==================== LAYER 1.5: Background Interactables (背景交互层) ==================== */}
      {gameState.currentScene === SceneId.BONE_MARROW && (
         <div className="absolute inset-0 z-15">
            {renderInteractables()}
         </div>
      )}

      {/* ==================== LAYER 2: HUD (界面层) ==================== */}
      {gameState.currentScene !== SceneId.BEDROOM && !uiState.isDying && gameState.currentScene !== SceneId.ANTIGEN_PRESENTATION && (
        <>
          {/* 左上角: 血条 */}
          <div className="absolute top-4 left-4 z-40 flex gap-1">
            {Array.from({ length: gameState.maxHp }).map((_, i) => (
              <Heart key={i} size={32} fill={i < gameState.hp ? "#ef4444" : "transparent"} className={i < gameState.hp ? "text-red-500 drop-shadow-sm" : "text-gray-400"} />
            ))}
          </div>

          {/* 右上角: 任务与手机 */}
          <div className="absolute top-4 right-4 z-40 flex flex-col gap-4 items-center">
             {/* 任务按钮 (带跳动动画) */}
             <button 
               onClick={() => setUiState(p => ({ ...p, showTasks: true }))}
               className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center border-4 border-white shadow-lg animate-bounce cursor-pointer hover:bg-yellow-300 transition-colors"
             >
               <span className="text-2xl font-bold text-yellow-800">!</span>
             </button>
             
             {/* 手机按钮 */}
             <button 
               onClick={() => {
                 setUiState(p => ({ ...p, showPhone: true }));
                 // 特殊逻辑：如果是警报场景且刚开始，直接自动推进一段剧情（显示视频通话）
                 if (gameState.currentScene === SceneId.ALARM && gameState.dialogueIndex === 0) {
                    handleAdvanceDialogue();
                 }
               }}
               className={`w-14 h-14 bg-blue-500 rounded-xl flex items-center justify-center border-4 border-blue-300 shadow-lg hover:bg-blue-600 transition-colors relative 
                 ${gameState.currentScene === SceneId.ALARM || currentLine?.nextTrigger === 'PHONE_CALL' ? 'animate-[shake_0.5s_infinite] bg-red-600 border-red-400 ring-4 ring-yellow-400' : ''}`}
             >
               <Tablet className="text-white" size={28} />
               {/* 手机红点提示 */}
               {(gameState.currentScene === SceneId.ALARM || gameState.flags.hasNewContact || currentLine?.nextTrigger === 'PHONE_CALL') && (
                 <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-ping" />
               )}
             </button>
          </div>

          {/* 左下角: 地图按钮 */}
          <div className="absolute bottom-6 left-6 z-40">
             <button 
               onClick={() => {
                 setUiState(p => ({ ...p, showMap: true }));
                 // 如果在大动脉场景打开地图，视为完成指引，解锁下一关
                 if (gameState.currentScene === SceneId.ARTERY) {
                    setGameState(prev => ({
                        ...prev,
                        unlockedMapNodes: [...new Set([...prev.unlockedMapNodes, SceneId.BONE_MARROW])]
                    }));
                 }
               }}
               className="group relative"
             >
                <div className="w-16 h-14 bg-[#f3f4f6] border-2 border-gray-400 rounded-sm transform -skew-x-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] flex items-center justify-center group-hover:-translate-y-1 transition-transform">
                  <MapIcon className="text-gray-600 transform skew-x-6" />
                </div>
                <div className="absolute -bottom-6 left-0 w-full text-center text-white font-bold text-sm drop-shadow-md">地图</div>
             </button>
          </div>

          {/* 右下角: 背包按钮 */}
          <div className="absolute bottom-6 right-6 z-40">
             <button 
               onClick={() => setUiState(p => ({ ...p, showInventory: true, inventoryTab: 'items', selectedItem: null }))}
               className="group relative"
             >
                <div className="w-16 h-16 bg-[#a0522d] rounded-2xl border-4 border-[#8b4513] shadow-lg flex items-center justify-center group-hover:-translate-y-1 transition-transform">
                  <Backpack className="text-[#f4d03f]" />
                </div>
                <div className="absolute -bottom-6 left-0 w-full text-center text-white font-bold text-sm drop-shadow-md">背包</div>
             </button>
          </div>
        </>
      )}

      {/* ==================== LAYER 3: Dialogue (对话框层) ==================== */}
      {/* 仅在没有全屏弹窗且未死亡且非视频播放时显示对话框 */}
      {currentLine && !uiState.showMap && !uiState.showInventory && !uiState.showWeaponSelect && !uiState.showShop && !uiState.showThymusGame && !uiState.showDiary && !uiState.showPhone && !uiState.isDying && !uiState.showQuizModal && gameState.currentScene !== SceneId.ANTIGEN_PRESENTATION && (
        <DialogueBox 
          speaker={currentLine.speaker === '???' ? '???' : currentLine.speaker === 'SYSTEM' ? '系统' : CHARACTER_ASSETS[currentLine.speaker as CharacterId]?.name || currentLine.speaker} 
          speakerId={currentLine.speaker}
          text={currentLine.text} 
          onClick={handleAdvanceDialogue}
          showArrow={shouldShowArrow}
        />
      )}

      {/* ==================== LAYER 4: Modals (Z-50) (弹窗层) ==================== */}

      {/* VIDEO PLAYER MODAL (抗原呈递视频播放器) */}
      {gameState.currentScene === SceneId.ANTIGEN_PRESENTATION && (
         <div className="absolute inset-0 bg-black/90 z-[100] flex items-center justify-center">
            {/* TV Frame */}
            <div className="relative w-[800px] aspect-[4/3] bg-[#222] rounded-3xl p-8 shadow-[0_0_50px_rgba(0,0,0,0.8),inset_0_0_20px_rgba(0,0,0,0.8)] border-4 border-gray-700 flex flex-col items-center">
               <div className="absolute top-0 w-1/2 h-1 bg-gray-600 rounded-b-xl"></div>
               
               {/* Screen */}
               <div className="relative w-full h-full bg-black rounded-[2rem] overflow-hidden border-4 border-black shadow-[inset_0_0_30px_rgba(0,0,0,0.5)]">
                  
                  {/* CRT Effects */}
                  <div className={`absolute inset-0 opacity-20 pointer-events-none z-50 bg-[url('${BACKGROUNDS.VHS_NOISE}')] bg-repeat`}></div>
                  <div className="absolute inset-0 z-50 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] opacity-50"></div>
                  <div className="absolute inset-0 z-50 pointer-events-none bg-[radial-gradient(circle,transparent_60%,black_150%)]"></div>
                  
                  {/* REC Indicator */}
                  <div className="absolute top-4 right-6 z-40 flex items-center gap-2 animate-pulse">
                     <div className="w-3 h-3 bg-red-600 rounded-full"></div>
                     <span className="text-red-600 font-mono text-sm tracking-widest">● 录制中</span>
                  </div>

                  {/* Scene Content Container */}
                  <div className={`w-full h-full relative transition-all duration-1000 ${videoPhase >= 3 ? 'brightness-125' : 'grayscale contrast-125'}`}>
                      {/* Background: Shop */}
                      <img src={BACKGROUNDS.SHOP} className="absolute inset-0 w-full h-full object-cover opacity-60" />
                      
                      {/* Tree/Shop Glow Effect (Activation) */}
                      <div className={`absolute inset-0 bg-green-900/40 transition-opacity duration-[3000ms] ${videoPhase === 3 ? 'opacity-100' : 'opacity-0'}`}></div>
                      <div className={`absolute inset-0 bg-yellow-500/20 mix-blend-overlay transition-opacity duration-[200ms] animate-pulse ${videoPhase === 3 ? 'opacity-100' : 'opacity-0'}`}></div>

                      {/* Dendritic Cell (The Messenger) */}
                      <div className={`absolute bottom-0 transition-transform duration-[800ms] ease-out z-20 ${videoPhase >= 1 ? 'translate-x-0' : '-translate-x-full'}`}>
                         <img src={CHARACTER_ASSETS[CharacterId.DENDRITIC].avatar} className="h-[300px] w-auto drop-shadow-xl" />
                         {/* Bag of Antigen */}
                         <div className={`absolute top-1/2 right-0 w-16 h-20 bg-green-900/80 border-2 border-green-500 rounded flex items-center justify-center rotate-12 transition-all duration-1000 ${videoPhase >= 3 ? 'opacity-0 scale-150' : 'opacity-100'}`}>
                            <span className="text-[8px] text-green-200 text-center leading-none">危险<br/>样本</span>
                         </div>
                      </div>

                      {/* Elder Tree (The Receiver) */}
                      <div className={`absolute bottom-0 right-10 transition-all duration-1000 ease-in-out z-10 ${videoPhase >= 2 ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'} ${videoPhase === 4 ? 'scale-150 origin-bottom' : 'scale-100'}`}>
                         <img src={CHARACTER_ASSETS[CharacterId.ELDER].avatar} className="h-[350px] w-auto drop-shadow-xl" />
                      </div>

                      {/* Gold Data Stream (Activation Effect) */}
                      {videoPhase === 3 && (
                         <div className="absolute bottom-[20%] left-[20%] right-[20%] h-2 bg-gradient-to-r from-transparent via-yellow-400 to-transparent blur-sm animate-pulse z-30 transform -rotate-12"></div>
                      )}
                      
                      {/* Subtitles */}
                      <div className="absolute bottom-8 left-0 w-full text-center z-40">
                         <div className="bg-black/80 text-green-400 font-mono text-lg px-6 py-2 inline-block rounded-sm border border-green-800 shadow-lg max-w-[90%]">
                            {videoPhase === 1 && "“爷爷！爷爷！特急件！这是刚从肺部前线抢回来的！”"}
                            {videoPhase === 2 && "“嗯……表面蛋白H1N1……是个狡猾的家伙。”"}
                            {videoPhase === 3 && "【数据正在上传至免疫网络...】"}
                            {videoPhase === 4 && "“已确认敌军特征。通告全军：杀手T细胞，即刻出动！”"}
                         </div>
                      </div>
                  </div>

                  {/* End Screen */}
                  {videoPhase === 5 && (
                     <div className="absolute inset-0 bg-black z-[60] flex flex-col items-center justify-center gap-6 animate-fade-in-up">
                        <ShieldAlert size={64} className="text-green-500" />
                        <h2 className="text-2xl font-bold text-green-400 tracking-widest border-b-2 border-green-800 pb-2">
                           抗原呈递完成
                        </h2>
                        <p className="text-green-600 font-mono text-sm">
                           特异性免疫反应已激活 (Specific Immunity Activated)
                        </p>
                        <button 
                           onClick={handleCloseVideo}
                           className="mt-8 px-8 py-2 border-2 border-green-600 text-green-400 hover:bg-green-900/50 hover:text-white transition-colors uppercase font-bold tracking-wider"
                        >
                           [ 断开连接 ]
                        </button>
                     </div>
                  )}

               </div>
               
               {/* TV Controls Decoration */}
               <div className="mt-4 flex gap-4 w-full px-8 items-center justify-center opacity-50">
                  <div className="w-16 h-1 bg-gray-600 rounded-full"></div>
                  <div className="w-1 h-1 bg-red-900 rounded-full"></div>
                  <div className="w-1 h-1 bg-gray-700 rounded-full"></div>
               </div>
            </div>
         </div>
      )}

      {/* DIARY MODAL (红细胞秘密日记) */}
      {uiState.showDiary && (
        <div className="absolute inset-0 bg-black/80 z-[100] flex items-center justify-center p-4">
            <div className="bg-[#fff1f2] w-full max-w-2xl aspect-[4/3] rounded-r-3xl rounded-l-md shadow-2xl relative flex flex-col border-r-8 border-b-8 border-gray-300 overflow-hidden">
                {/* Binding visual */}
                <div className="absolute left-0 top-0 bottom-0 w-8 bg-pink-800 z-20 flex flex-col gap-8 py-8 items-center">
                    <div className="w-2 h-full border-r-2 border-pink-600/50"></div>
                    {/* Spirals */}
                    <div className="w-4 h-4 bg-gray-200 rounded-full shadow-inner"></div>
                    <div className="w-4 h-4 bg-gray-200 rounded-full shadow-inner"></div>
                    <div className="w-4 h-4 bg-gray-200 rounded-full shadow-inner"></div>
                    <div className="w-4 h-4 bg-gray-200 rounded-full shadow-inner"></div>
                    <div className="w-4 h-4 bg-gray-200 rounded-full shadow-inner"></div>
                </div>

                {/* Close Button */}
                 <button
                    onClick={() => setUiState(p => ({ ...p, showDiary: false, showInventory: true }))} // Return to inventory
                    className="absolute top-6 right-6 text-gray-400 hover:text-pink-600 z-50"
                >
                    <X size={32} />
                </button>

                {/* Content Container */}
                <div className="flex-1 ml-12 p-12 flex flex-col relative bg-[linear-gradient(transparent_95%,#fee2e2_95%)] bg-[size:100%_2rem]">
                     {/* Page Number */}
                     <div className="absolute top-6 right-12 font-bold text-pink-300 text-xl font-mono">
                        第 {uiState.diaryPage + 1} 页 / 共 {DIARY_CONTENT.length} 页
                     </div>

                     {/* Sticker/Doodle (Flavor) */}
                     <div className="absolute top-10 right-24 opacity-80 transform rotate-12 select-none pointer-events-none">
                         {uiState.diaryPage === 0 && <span className="text-6xl filter drop-shadow-md">😤</span>} 
                         {uiState.diaryPage === 1 && <span className="text-6xl filter drop-shadow-md">🌪️</span>} 
                         {uiState.diaryPage === 2 && <span className="text-6xl filter drop-shadow-md">🥵</span>} 
                         {uiState.diaryPage === 3 && <span className="text-6xl filter drop-shadow-md">✨</span>} 
                     </div>

                     <h2 className="text-3xl font-bold text-pink-800 mb-8 font-serif mt-4">
                        {DIARY_CONTENT[uiState.diaryPage].title}
                     </h2>

                     <p className="text-xl text-gray-700 leading-loose font-serif flex-1">
                        {DIARY_CONTENT[uiState.diaryPage].content}
                     </p>

                     {/* Navigation */}
                     <div className="flex justify-between mt-auto pt-4">
                        <button
                            onClick={() => setUiState(p => ({ ...p, diaryPage: Math.max(0, p.diaryPage - 1) }))}
                            disabled={uiState.diaryPage === 0}
                            className={`flex items-center gap-2 font-bold px-4 py-2 rounded-lg transition-all ${uiState.diaryPage === 0 ? 'opacity-0' : 'text-pink-600 hover:bg-pink-100 hover:-translate-x-1'}`}
                        >
                            <ArrowLeft /> 上一页
                        </button>
                        <button
                            onClick={() => setUiState(p => ({ ...p, diaryPage: Math.min(DIARY_CONTENT.length - 1, p.diaryPage + 1) }))}
                            disabled={uiState.diaryPage === DIARY_CONTENT.length - 1}
                            className={`flex items-center gap-2 font-bold px-4 py-2 rounded-lg transition-all ${uiState.diaryPage === DIARY_CONTENT.length - 1 ? 'opacity-0' : 'text-pink-600 hover:bg-pink-100 hover:translate-x-1'}`}
                        >
                            下一页 <ArrowRight />
                        </button>
                     </div>
                </div>
            </div>
        </div>
      )}

      {/* PHONE MODAL (手机/通讯录弹窗) */}
      {uiState.showPhone && (
         <div className="absolute inset-0 bg-black/60 z-50 flex items-center justify-center animate-fade-in-up">
             <div className="bg-gray-900 w-[360px] h-[650px] rounded-[3rem] border-8 border-gray-800 shadow-2xl relative flex flex-col overflow-hidden ring-4 ring-gray-500/30">
                {/* Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-7 bg-black rounded-b-xl z-20"></div>
                
                {/* Status Bar */}
                <div className="bg-gray-900 text-white px-6 pt-3 pb-2 flex justify-between text-xs font-mono items-center border-b border-gray-800">
                   <span className="pl-2">细胞终端 V2.0</span>
                   <div className="flex gap-2 items-center pr-2">
                      <SignalHigh size={14} className="text-green-400"/>
                      <div className="w-5 h-3 bg-green-500 rounded-sm"></div>
                   </div>
                </div>
 
                {/* Header */}
                <div className="bg-gray-800 p-6 pt-4 pb-4 flex justify-between items-end shadow-md">
                   <div>
                      <h2 className="text-white font-bold text-2xl flex items-center gap-2">
                         <Contact className="text-blue-400" size={28}/> 通讯录
                      </h2>
                      <p className="text-gray-400 text-xs mt-1">
                         {gameState.currentScene === SceneId.LUNG_BATTLE ? "⚠️ 紧急呼叫模式" : "已连接至免疫网络"}
                      </p>
                   </div>
                   <button onClick={() => setUiState(p => ({ ...p, showPhone: false }))} className="bg-gray-700 p-2 rounded-full text-white hover:bg-gray-600 transition-colors"><X size={20}/></button>
                </div>
 
                {/* Contact List */}
                <div className="flex-1 bg-[#111827] overflow-y-auto p-4 space-y-3">
                   {getPhoneContacts().map(cid => (
                      <div 
                         key={cid}
                         onClick={() => handleContactCall(cid)}
                         onContextMenu={(e) => handleContactRightClick(e, cid)}
                         className={`p-3 rounded-xl flex items-center gap-4 cursor-pointer transition-all group border border-gray-800 hover:border-blue-500/50 hover:bg-gray-800 relative overflow-hidden
                            ${gameState.currentScene === SceneId.LUNG_BATTLE ? 'hover:scale-105 active:scale-95' : ''}
                         `}
                      >
                         {/* Avatar */}
                         <div className="relative z-10">
                            <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-700 border-2 border-gray-600 group-hover:border-blue-400 transition-colors">
                               <img src={CHARACTER_ASSETS[cid].avatar} className="w-full h-full object-cover" />
                            </div>
                            <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-gray-800 rounded-full z-20"></div>
                         </div>
                         
                         {/* Info */}
                         <div className="flex-1 z-10">
                            <div className="text-white font-bold text-base group-hover:text-blue-300 transition-colors">{CHARACTER_ASSETS[cid].name}</div>
                            <div className={`text-xs truncate max-w-[140px] mt-0.5 ${gameState.currentScene === SceneId.LUNG_BATTLE ? 'text-yellow-500 font-bold animate-pulse' : 'text-gray-500'}`}>
                               {gameState.currentScene === SceneId.LUNG_BATTLE ? "点击请求支援!" : "空闲中"}
                            </div>
                         </div>
 
                         {/* Call Icon */}
                         <div className="z-10 w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                            <Tablet size={18} />
                         </div>
                         
                         {/* Hover Effect BG */}
                         <div className="absolute inset-0 bg-blue-900/10 opacity-0 group-hover:opacity-100 transition-opacity z-0"></div>
                      </div>
                   ))}
                   
                   {getPhoneContacts().length === 0 && (
                      <div className="flex flex-col items-center justify-center h-40 text-gray-600 gap-2">
                         <Ban size={32}/>
                         <p>暂无联系人</p>
                      </div>
                   )}
                </div>
 
                {/* Bottom Bar */}
                <div className="bg-gray-900 h-12 flex justify-center items-center pb-2">
                   <div className="w-36 h-1.5 bg-gray-700 rounded-full"></div>
                </div>
             </div>
         </div>
      )}

      {/* TASK MODAL (任务列表弹窗) */}
      {uiState.showTasks && (
         <div className="absolute inset-0 bg-black/40 z-[60] flex items-start justify-end p-20 pointer-events-auto">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-80 animate-fade-in-up border-4 border-yellow-400">
               <div className="flex justify-between items-center mb-4 border-b pb-2">
                  <h3 className="font-bold text-lg flex items-center gap-2"><CheckCircle size={20} className="text-green-500"/> 当前任务</h3>
                  <button onClick={() => setUiState(p => ({ ...p, showTasks: false }))} className="text-gray-400 hover:text-black"><X size={18}/></button>
               </div>
               <div className="flex flex-col gap-3">
                  {getTasks().map(task => (
                    <div key={task.id} className={`flex items-start gap-2 p-2 rounded ${task.done ? 'bg-green-50 text-green-800' : 'bg-gray-50'}`}>
                       <div className={`mt-1 w-4 h-4 rounded-full border-2 flex items-center justify-center ${task.done ? 'border-green-500 bg-green-500' : 'border-gray-400'}`}>
                          {task.done && <span className="text-white text-[10px]">✓</span>}
                       </div>
                       <span className={`text-sm font-medium ${task.done ? 'line-through opacity-70' : ''}`}>{task.text}</span>
                    </div>
                  ))}
                  {getTasks().length === 0 && <p className="text-gray-500 text-sm italic">暂无任务，请跟随红细胞指引。</p>}
               </div>
            </div>
            {/* 点击空白处关闭 */}
            <div className="absolute inset-0 -z-10" onClick={() => setUiState(p => ({ ...p, showTasks: false }))}></div>
         </div>
      )}

      {/* SHOP MODAL (商店弹窗) */}
      {uiState.showShop && (
         <div className="absolute inset-0 bg-black/80 z-[70] flex items-center justify-center">
            <div className={`bg-[#5d4037] border-8 border-[#3e2723] rounded-3xl p-8 w-[900px] relative shadow-2xl flex flex-col gap-6 bg-[url('${BACKGROUNDS.WOOD_PATTERN}')]`}>
               <button onClick={() => setUiState(p => ({ ...p, showShop: false }))} className="absolute top-4 right-4 bg-[#3e2723] text-white p-2 rounded-full border-2 border-[#8d6e63]"><X/></button>
               
               <div className="flex justify-between items-center border-b-4 border-[#3e2723] pb-4">
                  <h2 className="text-4xl font-bold text-[#d7ccc8] flex items-center gap-3">
                     <ShoppingBag size={40}/> 智慧之树铺子
                  </h2>
                  <div className="bg-[#3e2723] px-6 py-2 rounded-xl text-[#ffeb3b] font-bold text-xl border-2 border-[#8d6e63]">
                     持有积分: {gameState.points} pt
                  </div>
               </div>

               <div className="flex gap-6 justify-center">
                  {/* 商品1: 录像带 */}
                  <div className="bg-[#795548] rounded-xl p-4 w-64 border-4 border-[#4e342e] flex flex-col items-center gap-3 shadow-lg">
                      <div className="w-full aspect-video bg-black rounded border-2 border-gray-600 flex items-center justify-center relative overflow-hidden group">
                         <Play size={40} className="text-white opacity-50 group-hover:opacity-100 transition-opacity"/>
                      </div>
                      <div className="text-center">
                         <h3 className="font-bold text-[#efebe9] text-lg">前线监控录像</h3>
                         <p className="text-[#d7ccc8] text-xs h-8 leading-tight">观看侦察兵如何汇报工作 (抗原呈递)。</p>
                      </div>
                      <div className="mt-auto w-full">
                         {gameState.inventory.some(i => i.id === 'video') ? (
                            <button disabled className="w-full bg-gray-600 text-white py-2 rounded font-bold cursor-not-allowed">已购买</button>
                         ) : (
                            <button 
                               onClick={() => handleShopBuy('video', 300)}
                               className={`w-full py-2 rounded font-bold border-b-4 active:border-b-0 active:translate-y-1 transition-all flex justify-between px-4 ${gameState.points >= 300 ? 'bg-green-600 border-green-800 text-white hover:bg-green-500' : 'bg-red-900 border-red-950 text-gray-400 cursor-not-allowed'}`}
                            >
                               <span>购买</span> <span>300 pt</span>
                            </button>
                         )}
                      </div>
                  </div>

                  {/* 商品2: 日记 */}
                  <div className="bg-[#795548] rounded-xl p-4 w-64 border-4 border-[#4e342e] flex flex-col items-center gap-3 shadow-lg">
                      <div className="w-24 h-24 bg-[#a1887f] rounded-full border-4 border-[#d7ccc8] flex items-center justify-center text-4xl">
                         📔
                      </div>
                      <div className="text-center">
                         <h3 className="font-bold text-[#efebe9] text-lg">红细胞的日记</h3>
                         <p className="text-[#d7ccc8] text-xs h-8 leading-tight">记录了身体的小秘密。</p>
                      </div>
                      <div className="mt-auto w-full">
                         {gameState.inventory.some(i => i.id === 'diary') ? (
                            <button disabled className="w-full bg-gray-600 text-white py-2 rounded font-bold cursor-not-allowed">已购买</button>
                         ) : (
                            <button 
                               onClick={() => handleShopBuy('diary', 200)}
                               className={`w-full py-2 rounded font-bold border-b-4 active:border-b-0 active:translate-y-1 transition-all flex justify-between px-4 ${gameState.points >= 200 ? 'bg-green-600 border-green-800 text-white hover:bg-green-500' : 'bg-red-900 border-red-950 text-gray-400 cursor-not-allowed'}`}
                            >
                               <span>购买</span> <span>200 pt</span>
                            </button>
                         )}
                      </div>
                  </div>

                  {/* 商品3: 钥匙 */}
                  <div className="bg-[#795548] rounded-xl p-4 w-64 border-4 border-[#4e342e] flex flex-col items-center gap-3 shadow-lg">
                      <div className="w-24 h-24 bg-[#a1887f] rounded-full border-4 border-[#d7ccc8] flex items-center justify-center text-4xl relative">
                         🗝️
                         <Lock size={16} className="absolute bottom-0 right-0 bg-yellow-500 text-black rounded-full p-0.5 border border-white"/>
                      </div>
                      <div className="text-center">
                         <h3 className="font-bold text-[#efebe9] text-lg">胸腺钥匙</h3>
                         <p className="text-[#d7ccc8] text-xs h-8 leading-tight">解锁地图上的胸腺关卡。</p>
                      </div>
                      <div className="mt-auto w-full">
                         {gameState.inventory.some(i => i.id === 'key') ? (
                            <button disabled className="w-full bg-gray-600 text-white py-2 rounded font-bold cursor-not-allowed">已购买</button>
                         ) : (
                            <button 
                               onClick={() => handleShopBuy('key', 100)}
                               className={`w-full py-2 rounded font-bold border-b-4 active:border-b-0 active:translate-y-1 transition-all flex justify-between px-4 ${gameState.points >= 100 ? 'bg-green-600 border-green-800 text-white hover:bg-green-500' : 'bg-red-900 border-red-950 text-gray-400 cursor-not-allowed'}`}
                            >
                               <span>购买</span> <span>100 pt</span>
                            </button>
                         )}
                      </div>
                  </div>
               </div>
            </div>
         </div>
      )}

      {/* WEAPON SELECT MODAL (武器选择弹窗) */}
      {uiState.showWeaponSelect && (
         <div className="absolute inset-0 bg-black/50 z-50 flex items-center justify-center animate-fade-in-up">
            <div className="flex flex-col items-center gap-8">
               <h2 className="text-4xl font-bold text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] animate-bounce">选择武器!</h2>
               <div className="flex gap-6">
                  {/* 武器1: Y型抗体 (B细胞) */}
                  <button onClick={() => handleWeaponSelect('ANTIBODY')} className="group flex flex-col items-center gap-2 transition-transform hover:scale-110">
                     <div className="w-32 h-32 bg-yellow-100 rounded-2xl border-4 border-yellow-400 flex items-center justify-center shadow-2xl group-hover:border-yellow-600 group-hover:bg-yellow-200">
                        <GitMerge size={64} className="text-yellow-600 rotate-180" />
                     </div>
                     <span className="bg-black/80 text-white px-3 py-1 rounded-full font-bold">Y型抗体弹</span>
                  </button>

                  {/* 武器2: 吞噬捕捕网 (巨噬细胞) */}
                  <button onClick={() => handleWeaponSelect('NET')} className="group flex flex-col items-center gap-2 transition-transform hover:scale-110">
                     <div className="w-32 h-32 bg-pink-100 rounded-2xl border-4 border-pink-300 flex items-center justify-center shadow-2xl group-hover:border-pink-500 group-hover:bg-white">
                        <Aperture size={64} className="text-pink-600" />
                     </div>
                     <span className="bg-black/80 text-white px-3 py-1 rounded-full font-bold">吞噬捕捕网</span>
                  </button>

                  {/* 武器3: 穿孔素电钻 (T细胞) */}
                  <button onClick={() => handleWeaponSelect('DRILL')} className="group flex flex-col items-center gap-2 transition-transform hover:scale-110">
                     <div className="w-32 h-32 bg-gray-800 rounded-2xl border-4 border-gray-600 flex items-center justify-center shadow-2xl group-hover:border-cyan-400 group-hover:bg-gray-700">
                        <Syringe size={64} className="text-cyan-300 group-hover:text-white" />
                     </div>
                     <span className="bg-black/80 text-white px-3 py-1 rounded-full font-bold">穿孔素电钻</span>
                  </button>
               </div>
            </div>
         </div>
      )}

      {/* THYMUS GAME MODAL (胸腺问答弹窗) */}
      {uiState.showThymusGame && (
         <div className="absolute inset-0 bg-black/80 z-[80] flex items-center justify-center">
             <div className="bg-[#f59e0b] border-8 border-[#78350f] rounded-3xl p-8 max-w-lg w-full text-center shadow-2xl">
                 <div className="mb-6 flex justify-center">
                    <GraduationCap size={64} className="text-[#78350f]" />
                 </div>
                 <h2 className="text-3xl font-bold text-[#78350f] mb-4">最终补考</h2>
                 <p className="text-[#92400e] mb-6 font-bold text-lg">T细胞是在哪里发育成熟的？</p>
                 <input 
                   type="text" 
                   value={uiState.thymusInput}
                   onChange={(e) => setUiState(p => ({ ...p, thymusInput: e.target.value }))}
                   placeholder="请输入器官名称..."
                   className="w-full p-4 rounded-xl text-xl font-bold text-center border-4 border-[#78350f] mb-6 outline-none focus:ring-4 ring-yellow-300"
                 />
                 <button 
                   onClick={handleThymusSubmit}
                   className="w-full bg-[#78350f] text-white py-4 rounded-xl font-bold text-xl hover:bg-[#92400e] transition-colors border-b-8 border-[#451a03] active:border-b-0 active:translate-y-2"
                 >
                   提交答案
                 </button>
             </div>
         </div>
      )}

      {/* BIO MODAL (角色详情查看) */}
      {uiState.selectedBioId && (
        <div className="absolute inset-0 bg-black/80 z-[60] flex items-center justify-center p-4">
           <div className="bg-white max-w-lg w-full rounded-2xl p-6 relative flex flex-col items-center gap-4 border-4 border-gray-800">
              <button onClick={() => setUiState(p => ({ ...p, selectedBioId: null }))} className="absolute top-4 right-4 text-gray-500 hover:text-black"><X /></button>
              
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-gray-200">
                 <img src={CHARACTER_ASSETS[uiState.selectedBioId].avatar} className="w-full h-full object-cover" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">{CHARACTER_ASSETS[uiState.selectedBioId].name}</h2>
              <p className="text-gray-600 leading-relaxed text-center">
                 {CHARACTER_ASSETS[uiState.selectedBioId].bio}
              </p>
           </div>
        </div>
      )}

      {/* DEATH QUIZ MODAL (死亡问答界面) - 仅在剧情对话引导后显示 */}
      {gameState.currentScene === SceneId.DEATH_QUIZ && uiState.showQuizModal && (
         <div className="absolute inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
             <div className={`max-w-xl w-full bg-[#1a2e1a] border-4 border-[#4a7a4a] rounded-xl p-8 text-green-100 shadow-[0_0_50px_rgba(74,222,128,0.2)] ${uiState.modalShake ? 'animate-shake' : ''}`}>
                <div className="flex items-center gap-4 mb-6 border-b border-green-800 pb-4">
                  <Brain className="text-green-400" size={40} />
                  <div>
                    <h2 className="text-2xl font-bold text-green-400">生命维持系统离线</h2>
                    <p className="text-green-600">回答正确以重启系统 (失败次数: {gameState.flags.deathCount}/2)</p>
                  </div>
                </div>

                <div className="mb-8">
                   <p className="text-xl font-bold mb-6">{currentQuiz.question}</p>
                   <div className="space-y-3">
                      {currentQuiz.options.map((opt, idx) => (
                        <button 
                          key={idx}
                          onClick={() => handleQuizAnswer(idx === currentQuiz.correctIndex, currentQuiz.rewardHp)}
                          className="w-full text-left p-4 rounded bg-green-900/50 border border-green-700 hover:bg-green-700 hover:border-green-400 transition-all flex justify-between group"
                        >
                          <span>{opt}</span>
                          <span className="opacity-0 group-hover:opacity-100 text-green-400">选择</span>
                        </button>
                      ))}
                   </div>
                </div>
                
                <p className="text-center text-sm text-green-800 mt-4">
                   警告：连续失败 2 次将被遣送至胸腺监狱。
                </p>
             </div>
         </div>
      )}

      {/* MAP MODAL (地图弹窗) - CSS 绘制雷达风格 */}
      {uiState.showMap && (
        <div className="absolute inset-0 bg-black/60 z-50 flex items-center justify-center p-8">
          <div className="relative w-full max-w-5xl aspect-[16/9] shadow-2xl border-4 border-white rounded-xl overflow-hidden group bg-[#0f172a] relative">
            {/* 背景网格纹理 */}
            <div className="absolute inset-0 opacity-20 bg-[linear-gradient(0deg,transparent_24%,rgba(255,255,255,.3)_25%,rgba(255,255,255,.3)_26%,transparent_27%,transparent_74%,rgba(255,255,255,.3)_75%,rgba(255,255,255,.3)_76%,transparent_77%,transparent),linear-gradient(90deg,transparent_24%,rgba(255,255,255,.3)_25%,rgba(255,255,255,.3)_26%,transparent_27%,transparent_74%,rgba(255,255,255,.3)_75%,rgba(255,255,255,.3)_76%,transparent_77%,transparent)] bg-[length:50px_50px]"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)]"></div>
            
            <button onClick={() => setUiState(p => ({ ...p, showMap: false }))} className="absolute top-4 right-4 bg-red-500 text-white p-2 rounded-full z-50 hover:bg-red-600 shadow-md"><X/></button>
            <div className="absolute top-4 left-4 text-gray-500 font-bold bg-white/80 px-4 py-1 rounded-full shadow-sm pointer-events-none z-10">
               当前位置：{SCENE_NAMES[gameState.currentScene]}
            </div>

            {/* 地图节点按钮 */}
            
            {/* 大动脉 (左上) */}
            <button 
               onClick={() => handleMapTravel(SceneId.ARTERY)}
               className={`absolute top-[20%] left-[20%] w-24 h-24 rounded-full border-4 border-white shadow-[0_0_20px_rgba(255,255,255,0.5)] flex items-center justify-center group/node bg-red-600 hover:scale-110 transition-transform
                  ${gameState.currentScene === SceneId.ARTERY ? 'ring-4 ring-yellow-400 animate-pulse' : ''}
               `}
            >
               <MapIcon className="text-white" size={32} />
               <span className="opacity-0 group-hover/node:opacity-100 bg-black/80 text-white text-xs px-2 py-1 rounded absolute -bottom-8 whitespace-nowrap z-20">前往大动脉</span>
            </button>

            {/* 骨髓 (中间) */}
            <button 
               onClick={() => gameState.unlockedMapNodes.includes(SceneId.BONE_MARROW) && handleMapTravel(SceneId.BONE_MARROW)}
               className={`absolute top-[40%] left-[45%] w-32 h-32 rounded-full border-4 border-white shadow-[0_0_20px_rgba(255,255,255,0.5)] flex items-center justify-center group/node hover:scale-110 transition-transform
                  ${!gameState.unlockedMapNodes.includes(SceneId.BONE_MARROW) ? 'bg-gray-600 cursor-not-allowed grayscale' : 'bg-yellow-600'}
                  ${gameState.currentScene === SceneId.BONE_MARROW ? 'ring-4 ring-yellow-400 animate-pulse' : ''}
               `}
            >
               {!gameState.unlockedMapNodes.includes(SceneId.BONE_MARROW) ? <Lock size={40} className="text-gray-400" /> : <GraduationCap size={48} className="text-white"/>}
               <span className="opacity-0 group-hover/node:opacity-100 bg-black/80 text-white text-xs px-2 py-1 rounded absolute -bottom-8 whitespace-nowrap z-20">前往骨髓</span>
               {/* 连接线 */}
               <div className="absolute top-1/2 right-full h-1 w-32 bg-white/30 -z-10 origin-right rotate-[-20deg]"></div>
            </button>

            {/* 肺部 (右上) */}
            <button 
               onClick={() => handleMapTravel(SceneId.LUNG_BATTLE)}
               className={`absolute top-[20%] left-[75%] w-28 h-28 rounded-full border-4 border-white shadow-[0_0_20px_rgba(255,255,255,0.5)] flex items-center justify-center group/node bg-pink-600 hover:scale-110 transition-transform
                  ${gameState.currentScene === SceneId.LUNG_BATTLE ? 'ring-4 ring-yellow-400 animate-pulse' : ''}
               `}
            >
               {gameState.currentScene === SceneId.ALARM ? (
                  <ShieldAlert className="text-white animate-bounce" size={40} />
               ) : (
                  <Activity className="text-white" size={40} />
               )}
               <span className="opacity-0 group-hover/node:opacity-100 bg-black/80 text-white text-xs px-2 py-1 rounded absolute -bottom-8 whitespace-nowrap z-20">前往肺部</span>
               {/* 连接线 */}
               <div className="absolute top-1/2 right-full h-1 w-48 bg-white/30 -z-10 origin-right rotate-[15deg]"></div>
            </button>

            {/* 淋巴结 (左下) */}
            <button 
               onClick={() => handleMapTravel(SceneId.SHOP)}
               className={`absolute top-[70%] left-[30%] w-24 h-24 rounded-full border-4 border-white shadow-[0_0_20px_rgba(255,255,255,0.5)] flex items-center justify-center group/node bg-green-600 hover:scale-110 transition-transform
                  ${gameState.currentScene === SceneId.SHOP ? 'ring-4 ring-yellow-400 animate-pulse' : ''}
               `}
            >
               <ShoppingBag className="text-white" size={32} />
               <span className="opacity-0 group-hover/node:opacity-100 bg-black/80 text-white text-xs px-2 py-1 rounded absolute -bottom-8 whitespace-nowrap z-20">前往淋巴结</span>
               {/* 连接线 */}
               <div className="absolute bottom-full left-1/2 w-1 h-32 bg-white/30 -z-10"></div>
            </button>

            {/* 胸腺 (右下) - 动态解锁 */}
            <button 
               onClick={() => gameState.unlockedMapNodes.includes(SceneId.THYMUS_PRISON) && handleMapTravel(SceneId.THYMUS_PRISON)}
               disabled={!gameState.unlockedMapNodes.includes(SceneId.THYMUS_PRISON)}
               className={`absolute top-[70%] left-[70%] w-24 h-24 rounded-full border-4 border-white shadow-[0_0_20px_rgba(255,255,255,0.5)] flex items-center justify-center group/node transition-transform
                  ${gameState.unlockedMapNodes.includes(SceneId.THYMUS_PRISON) ? 'bg-orange-600 hover:scale-110 cursor-pointer' : 'bg-gray-800 cursor-not-allowed grayscale'}
                  ${gameState.currentScene === SceneId.THYMUS_PRISON ? 'ring-4 ring-yellow-400 animate-pulse' : ''}
               `}
            >
               {gameState.unlockedMapNodes.includes(SceneId.THYMUS_PRISON) ? <Dumbbell size={40} className="text-white"/> : <Lock size={24} className="text-gray-500"/>}
               <span className="opacity-0 group-hover/node:opacity-100 bg-black/80 text-white text-xs px-2 py-1 rounded absolute -bottom-8 whitespace-nowrap z-20">
                  {gameState.unlockedMapNodes.includes(SceneId.THYMUS_PRISON) ? '前往胸腺' : '胸腺 (未解锁)'}
               </span>
               {/* 连接线 */}
               <div className="absolute bottom-full right-1/2 w-1 h-24 bg-white/30 -z-10"></div>
            </button>

          </div>
        </div>
      )}

      {/* INVENTORY MODAL (背包/图鉴弹窗) */}
      {uiState.showInventory && (
        <div className="absolute inset-0 bg-black/60 z-50 flex items-center justify-center">
           <div className="bg-orange-100 w-[800px] h-[500px] rounded-3xl border-8 border-orange-800 shadow-2xl relative flex flex-col overflow-hidden">
              <button onClick={() => setUiState(p => ({ ...p, showInventory: false }))} className="absolute top-4 right-4 bg-orange-800 text-white p-2 rounded-full z-10"><X/></button>
              
              {/* 标签页切换 */}
              <div className="flex bg-orange-200 border-b-4 border-orange-800 pt-2 px-4 gap-2">
                <button 
                  onClick={() => setUiState(p => ({ ...p, inventoryTab: 'items' }))}
                  className={`px-8 py-3 rounded-t-xl font-bold border-t-4 border-x-4 border-orange-800 -mb-1 z-10 transition-colors ${uiState.inventoryTab === 'items' ? 'bg-orange-100 text-orange-900' : 'bg-orange-800/40 text-orange-900/60 hover:bg-orange-800/60'}`}
                >
                  道具包
                </button>
                <button 
                  onClick={() => isEncyclopediaUnlocked && setUiState(p => ({ ...p, inventoryTab: 'dex' }))}
                  className={`px-8 py-3 rounded-t-xl font-bold border-t-4 border-x-4 border-orange-800 -mb-1 z-10 transition-colors flex items-center gap-2 ${uiState.inventoryTab === 'dex' ? 'bg-orange-100 text-orange-900' : 'bg-orange-800/40 text-orange-900/60 hover:bg-orange-800/60'} ${!isEncyclopediaUnlocked ? 'cursor-not-allowed opacity-70' : ''}`}
                >
                   {!isEncyclopediaUnlocked && <Lock size={14}/>} 图鉴
                </button>
              </div>

              {/* 内容区域 */}
              <div className="flex-1 p-8 bg-orange-100 overflow-hidden">
                 
                 {/* 标签页: 物品 */}
                 {uiState.inventoryTab === 'items' && (
                   <div className="flex gap-8 h-full">
                      {/* 物品网格列表 */}
                      <div className="w-1/2 grid grid-cols-3 gap-4 content-start overflow-y-auto">
                          {gameState.inventory.map(item => (
                            <div 
                              key={item.id} 
                              onClick={() => setUiState(p => ({ ...p, selectedItem: item }))}
                              className={`aspect-square bg-orange-200 rounded-xl border-4 flex items-center justify-center text-4xl cursor-pointer hover:bg-orange-300 transition-colors shadow-sm
                                ${uiState.selectedItem?.id === item.id ? 'border-orange-600 ring-2 ring-orange-300' : 'border-orange-400'}
                              `}
                            >
                              {item.icon}
                            </div>
                          ))}
                          {/* 填充空白格子 */}
                          {Array.from({length: Math.max(0, 9 - gameState.inventory.length)}).map((_, i) => (
                            <div key={i} className="aspect-square bg-orange-50 rounded-xl border-2 border-orange-200/50"></div>
                          ))}
                      </div>
                      
                      {/* 物品详细信息 */}
                      <div className="w-1/2 bg-white/60 rounded-xl p-6 border-2 border-orange-300 flex flex-col h-full overflow-hidden">
                          {uiState.selectedItem ? (
                             <>
                                <div className="flex-none flex items-center gap-4 mb-4 border-b-2 border-orange-200 pb-2">
                                   <div className="text-6xl">{uiState.selectedItem.icon}</div>
                                   <h3 className="text-2xl font-bold text-orange-900">{uiState.selectedItem.name}</h3>
                                </div>
                                
                                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                                   <p className="text-orange-900 leading-relaxed text-lg whitespace-pre-line mb-4">{uiState.selectedItem.description}</p>
                                   
                                   {/* Diary Read Button */}
                                   {uiState.selectedItem.id === 'diary' && (
                                      <button 
                                         onClick={() => setUiState(p => ({ ...p, showDiary: true, diaryPage: 0, showInventory: false }))}
                                         className="w-full bg-pink-500 hover:bg-pink-600 text-white py-2 rounded-xl font-bold flex items-center justify-center gap-2 border-b-4 border-pink-700 active:border-b-0 active:translate-y-1 transition-all mb-2"
                                      >
                                         <BookOpen size={20} /> 阅读日记
                                      </button>
                                   )}

                                   {/* Key Go Now Button */}
                                   {uiState.selectedItem.id === 'key' && (
                                       <button 
                                         onClick={() => {
                                            setUiState(p => ({ ...p, showInventory: false, showMap: true }));
                                         }}
                                         className="w-full bg-yellow-600 hover:bg-yellow-700 text-white py-2 rounded-xl font-bold flex items-center justify-center gap-2 border-b-4 border-yellow-800 active:border-b-0 active:translate-y-1 transition-all mb-2"
                                       >
                                         <MapIcon size={20} /> 立即前往
                                       </button>
                                   )}
                                </div>
                             </>
                          ) : (
                             <div className="flex-1 flex items-center justify-center text-orange-800/50 italic text-lg">
                                点击左侧物品查看详情...
                             </div>
                          )}
                          <div className="flex-none mt-auto pt-4 border-t-2 border-orange-200 text-right font-bold text-orange-900">
                             当前积分: {gameState.points}
                          </div>
                      </div>
                   </div>
                 )}

                 {/* 标签页: 图鉴 (Contact List) */}
                 {uiState.inventoryTab === 'dex' && (
                    <div className="h-full grid grid-cols-4 gap-4 overflow-y-auto p-2">
                       {gameState.contacts.map(cid => (
                          <div 
                            key={cid}
                            onClick={() => setUiState(p => ({ ...p, selectedBioId: cid }))} // 复用详情弹窗
                            className="bg-white rounded-xl p-3 border-2 border-orange-300 hover:border-orange-600 cursor-pointer shadow-sm hover:shadow-md transition-all flex flex-col items-center gap-2"
                          >
                             <div className="w-20 h-20 rounded-full bg-gray-100 overflow-hidden border border-gray-200">
                                <img src={CHARACTER_ASSETS[cid].avatar} className="w-full h-full object-cover" />
                             </div>
                             <span className="font-bold text-sm text-center text-gray-800">{CHARACTER_ASSETS[cid].name}</span>
                          </div>
                       ))}
                       {/* 未解锁占位符 */}
                       {Array.from({length: Math.max(0, 8 - gameState.contacts.length)}).map((_, i) => (
                          <div key={i} className="bg-black/10 rounded-xl border-2 border-dashed border-gray-400 flex items-center justify-center">
                             <span className="text-gray-400 text-2xl">?</span>
                          </div>
                       ))}
                    </div>
                 )}
              </div>
           </div>
        </div>
      )}

      {/* Global CSS for Animations */}
      <style>{`
        .animate-shake { animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both; }
        @keyframes shake {
          10%, 90% { transform: translate3d(-1px, 0, 0); }
          20%, 80% { transform: translate3d(2px, 0, 0); }
          30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
          40%, 60% { transform: translate3d(4px, 0, 0); }
        }
        .animate-fade-in-up { animation: fadeInUp 0.5s ease-out; }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-bounce-slow { animation: bounce 3s infinite; }
        
        /* Custom Scrollbar */
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(251, 146, 60, 0.1); 
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(234, 88, 12, 0.5); 
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(234, 88, 12, 0.7); 
        }
      `}</style>
    </div>
  );
};

export default App;
