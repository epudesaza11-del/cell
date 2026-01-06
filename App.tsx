import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { Map as MapIcon, Tablet, Heart, Backpack, ShieldAlert, X, Info, Brain, SignalHigh, Contact, Ban, Rocket, Utensils, Zap, ShoppingBag, Lock, Play, GraduationCap } from 'lucide-react';
import { SceneId, CharacterId, GameState, ScriptLine } from './types';
import { SCENE_SCRIPT, CHARACTER_ASSETS, INITIAL_HP, QUIZ_QUESTIONS, ITEMS_DB } from './constants';
import { Button, DialogueBox, CharacterPortrait } from './components/UIComponents';

const App: React.FC = () => {
  // --- State ---
  const [gameState, setGameState] = useState<GameState>({
    currentScene: SceneId.BEDROOM,
    dialogueIndex: 0,
    hp: INITIAL_HP,
    maxHp: 3,
    points: 0,
    unlockedMapNodes: [SceneId.ARTERY],
    contacts: [CharacterId.RBC_08], 
    inventory: [ITEMS_DB['diary']], 
    flags: {
      metMacrophage: false,
      metBCell: false,
      battlePhase: 'NONE',
      deathCount: 0,
      quizCorrectCount: 0,
      hasNewContact: false,
    }
  });

  const [uiState, setUiState] = useState({
    showMap: false,
    showPhone: false,
    showInventory: false,
    showWeaponSelect: false,
    showShop: false,
    showThymusGame: false,
    shake: false,
    isDying: false, // New: For death animation
    isMacrophageAttacking: false, 
    selectedBioId: null as CharacterId | null, 
    thymusInput: '', // For Thymus Game
  });

  // --- Helpers ---
  const currentScript = SCENE_SCRIPT[gameState.currentScene];
  const safeIndex = (currentScript && gameState.dialogueIndex < currentScript.length) ? gameState.dialogueIndex : 0;
  const currentLine: ScriptLine | undefined = currentScript?.[safeIndex];

  const updateFlag = (key: keyof GameState['flags'], value: any) => {
    setGameState(prev => ({ ...prev, flags: { ...prev.flags, [key]: value } }));
  };

  const takeDamage = (amount: number) => {
    setUiState(prev => ({ ...prev, shake: true }));
    setTimeout(() => setUiState(prev => ({ ...prev, shake: false })), 500);
    
    setGameState(prev => {
      const newHp = prev.hp - amount;
      return { ...prev, hp: newHp };
    });
  };

  // --- Logic Hooks ---
  
  // Transition Bone Marrow -> Alarm
  useEffect(() => {
    if (gameState.currentScene === SceneId.BONE_MARROW) {
       const hasMetMacro = gameState.contacts.includes(CharacterId.MACROPHAGE);
       const hasMetBCell = gameState.contacts.includes(CharacterId.B_CELL);
       
       if (hasMetMacro && hasMetBCell && gameState.dialogueIndex === 1) {
          setTimeout(() => {
             setGameState(prev => ({
                ...prev,
                currentScene: SceneId.ALARM,
                dialogueIndex: 0,
             }));
          }, 1500);
       }
    }
  }, [gameState.currentScene, gameState.contacts, gameState.dialogueIndex]);

  // Death Logic
  useEffect(() => {
    if (gameState.hp <= 0 && gameState.currentScene === SceneId.LUNG_BATTLE) {
      // Trigger death effect
      setUiState(prev => ({ ...prev, isDying: true }));

      // Wait for animation then switch scene
      setTimeout(() => {
        setUiState(prev => ({ ...prev, isDying: false }));
        setGameState(prev => ({
          ...prev,
          currentScene: SceneId.DEATH_QUIZ,
          dialogueIndex: 0,
          flags: { ...prev.flags, battlePhase: 'NONE' }
        }));
      }, 2000);
    }
  }, [gameState.hp, gameState.currentScene]);

  // Handle Contact Unlock Notification Reset
  useEffect(() => {
    if (uiState.showPhone) {
      updateFlag('hasNewContact', false);
    }
  }, [uiState.showPhone]);

  // --- Handlers ---
  const handleAdvanceDialogue = () => {
    if (!currentLine) return;
    if (currentLine.nextTrigger === 'MAP_OPEN') return;
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
      if (gameState.currentScene === SceneId.LUNG_BATTLE && gameState.flags.battlePhase === 'NONE') {
         updateFlag('battlePhase', 'CALL_ALLY');
      }
      return;
    }

    // Support jumping to specific index
    if (currentLine.nextIndex !== undefined) {
      setGameState(prev => ({ ...prev, dialogueIndex: currentLine.nextIndex! }));
      return;
    }

    if (gameState.dialogueIndex < currentScript.length - 1) {
      setGameState(prev => ({ ...prev, dialogueIndex: prev.dialogueIndex + 1 }));
    } else {
      // Scene Transition Logic
      if (gameState.currentScene === SceneId.BEDROOM) {
        setGameState(prev => ({ ...prev, currentScene: SceneId.ARTERY, dialogueIndex: 0 }));
      } else if (gameState.currentScene === SceneId.LUNG_BATTLE) {
        setGameState(prev => ({ 
           ...prev, 
           currentScene: SceneId.VICTORY, 
           dialogueIndex: 0,
           points: prev.points + 500 
        }));
        setUiState(prev => ({ ...prev, isMacrophageAttacking: false }));
      } else if (gameState.currentScene === SceneId.ANTIGEN_PRESENTATION) {
         setGameState(prev => ({ ...prev, currentScene: SceneId.SHOP, dialogueIndex: 0 }));
      }
    }
  };

  const handleMapTravel = (destination: SceneId) => {
    setUiState(prev => ({ ...prev, showMap: false }));
    setGameState(prev => ({ 
      ...prev, 
      currentScene: destination, 
      dialogueIndex: 0,
      unlockedMapNodes: [...new Set([...prev.unlockedMapNodes, destination])]
    }));
  };

  const handleContactCall = (id: CharacterId) => {
    setUiState(prev => ({ ...prev, showPhone: false }));
    if (gameState.currentScene === SceneId.LUNG_BATTLE) {
       const findScriptIndex = (scriptId: string) => {
         return SCENE_SCRIPT[SceneId.LUNG_BATTLE].findIndex(line => line.id === scriptId);
       };

       if (id === CharacterId.PLATELET) {
          takeDamage(1);
          setGameState(prev => ({ ...prev, dialogueIndex: findScriptIndex('4_FAIL_P') }));
       } else if (id === CharacterId.B_CELL) {
          takeDamage(1);
          setGameState(prev => ({ ...prev, dialogueIndex: findScriptIndex('4_FAIL_B') }));
       } else if (id === CharacterId.MACROPHAGE) {
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

  const handleWeaponSelect = (weapon: 'MISSILE' | 'SPOON' | 'LASER') => {
    setUiState(prev => ({ ...prev, showWeaponSelect: false }));
    const findScriptIndex = (scriptId: string) => {
      return SCENE_SCRIPT[SceneId.LUNG_BATTLE].findIndex(line => line.id === scriptId);
    };

    if (weapon === 'MISSILE') {
      takeDamage(1);
      setGameState(prev => ({ ...prev, dialogueIndex: findScriptIndex('4_FAIL_MISSILE') }));
    } else if (weapon === 'LASER') {
      takeDamage(1);
      setGameState(prev => ({ ...prev, dialogueIndex: findScriptIndex('4_FAIL_LASER') }));
    } else if (weapon === 'SPOON') {
      setGameState(prev => ({ ...prev, dialogueIndex: findScriptIndex('4_SUCCESS_SPOON') }));
      setUiState(prev => ({ ...prev, isMacrophageAttacking: true }));
    }
  };

  const handleShopBuy = (itemId: string, cost: number) => {
     if (gameState.points >= cost) {
        setGameState(prev => ({
           ...prev,
           points: prev.points - cost,
           inventory: [...prev.inventory, ITEMS_DB[itemId]]
        }));
        if (itemId === 'video') {
           setUiState(prev => ({ ...prev, showShop: false }));
           setGameState(prev => ({ ...prev, currentScene: SceneId.ANTIGEN_PRESENTATION, dialogueIndex: 0 }));
        } else if (itemId === 'key') {
           setGameState(prev => ({ ...prev, unlockedMapNodes: [...prev.unlockedMapNodes, SceneId.THYMUS_PRISON] }));
        }
     } else {
        setUiState(prev => ({ ...prev, shake: true }));
        setTimeout(() => setUiState(prev => ({ ...prev, shake: false })), 500);
     }
  };

  const handleContactRightClick = (e: React.MouseEvent, id: CharacterId) => {
    e.preventDefault();
    if (gameState.currentScene === SceneId.LUNG_BATTLE) return;
    setUiState(prev => ({ ...prev, selectedBioId: id }));
  };

  const handleQuizAnswer = (isCorrect: boolean, reward: number) => {
    if (isCorrect) {
       // Resurrection Logic
       const newHp = Math.min(gameState.maxHp, gameState.hp + reward);
       setGameState(prev => ({
         ...prev,
         hp: newHp,
         flags: { ...prev.flags, quizCorrectCount: prev.flags.quizCorrectCount + 1 }
       }));
       
       // If revived (HP > 0), restart battle
       if (newHp > 0) {
          setTimeout(() => {
             setGameState(prev => ({ ...prev, currentScene: SceneId.LUNG_BATTLE, dialogueIndex: 0, hp: prev.maxHp }));
          }, 1000);
       }
    } else {
       // Incorrect Answer Logic
       const newDeathCount = gameState.flags.deathCount + 1;
       setGameState(prev => ({
          ...prev,
          flags: { ...prev.flags, deathCount: newDeathCount }
       }));

       if (newDeathCount >= 2) {
          // Double failure -> Thymus Prison
          setGameState(prev => ({
             ...prev,
             points: Math.floor(prev.points / 2),
             currentScene: SceneId.THYMUS_PRISON,
             dialogueIndex: 0
          }));
       }
    }
  };

  const handleThymusSubmit = () => {
    if (uiState.thymusInput.trim().includes('胸腺')) {
       // Success
       setUiState(prev => ({ ...prev, showThymusGame: false }));
       setGameState(prev => ({
          ...prev,
          hp: prev.maxHp,
          currentScene: SceneId.LUNG_BATTLE, // Retry battle
          dialogueIndex: 0
       }));
    } else {
       // Fail effect
       setUiState(prev => ({ ...prev, shake: true }));
       setTimeout(() => setUiState(prev => ({ ...prev, shake: false })), 500);
    }
  };

  // --- NPC Interaction Logic (Bone Marrow) ---
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

  // --- Backgrounds ---
  const getBackgroundStyle = () => {
    switch (gameState.currentScene) {
      case SceneId.BEDROOM: return 'bg-gray-900';
      case SceneId.ARTERY: return 'bg-[radial-gradient(circle_at_center,_#ef4444_0%,_#7f1d1d_100%)]';
      case SceneId.BONE_MARROW: return 'bg-[#fdf2f8]';
      case SceneId.ALARM: return 'bg-red-950'; 
      case SceneId.LUNG_BATTLE: return 'bg-[#1a2e26]'; 
      case SceneId.VICTORY: return 'bg-gradient-to-t from-blue-200 to-sky-100';
      case SceneId.SHOP: 
      case SceneId.DEATH_QUIZ: // Reuse Shop/Tree background
          return 'bg-[url(https://www.transparenttextures.com/patterns/wood-pattern.png)] bg-[#5d4037]';
      case SceneId.ANTIGEN_PRESENTATION: return 'bg-black';
      case SceneId.THYMUS_PRISON: return 'bg-[radial-gradient(ellipse_at_top,_#f59e0b_0%,_#78350f_100%)]'; // Dojo style
      default: return 'bg-black';
    }
  };

  // --- Render Interactables (Scene 2 NPCs) ---
  const renderInteractables = () => {
    if (gameState.currentScene === SceneId.BONE_MARROW) {
      const isIdle = gameState.dialogueIndex <= 1;

      return (
        <div className="absolute inset-0 z-10 pointer-events-none">
          {/* Macrophage NPC */}
          <div 
            onClick={() => isIdle && handleMeetCharacter(CharacterId.MACROPHAGE, 2)}
            className={`absolute top-1/3 left-[15%] pointer-events-auto cursor-pointer transition-transform hover:scale-105 group ${!isIdle ? 'opacity-50 grayscale' : ''}`}
          >
             <div className="relative">
                <CharacterPortrait id={CharacterId.MACROPHAGE} />
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-pink-100 text-pink-800 px-3 py-1 rounded-full text-xs font-bold border-2 border-pink-300 shadow-sm group-hover:bg-pink-200 whitespace-nowrap">
                   巨噬细胞
                </div>
                {!gameState.contacts.includes(CharacterId.MACROPHAGE) && (
                   <div className="absolute top-0 right-0 w-6 h-6 bg-yellow-400 rounded-full animate-bounce flex items-center justify-center border-2 border-white text-yellow-900 font-bold">!</div>
                )}
             </div>
          </div>

          {/* B Cell NPC */}
          <div 
            onClick={() => isIdle && handleMeetCharacter(CharacterId.B_CELL, 5)}
            className={`absolute top-1/3 right-[15%] pointer-events-auto cursor-pointer transition-transform hover:scale-105 group ${!isIdle ? 'opacity-50 grayscale' : ''}`}
          >
             <div className="relative">
                <CharacterPortrait id={CharacterId.B_CELL} />
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-bold border-2 border-blue-300 shadow-sm group-hover:bg-blue-200 whitespace-nowrap">
                   B细胞
                </div>
                 {!gameState.contacts.includes(CharacterId.B_CELL) && (
                   <div className="absolute top-0 right-0 w-6 h-6 bg-yellow-400 rounded-full animate-bounce flex items-center justify-center border-2 border-white text-yellow-900 font-bold">!</div>
                )}
             </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Determine which quiz question to show (cycling 0 and 1 for resurrection)
  // Logic: Death Count 0 -> Index 0. Death Count 1 -> Index 1.
  const currentQuizIndex = Math.min(gameState.flags.deathCount, 1); 
  const currentQuiz = QUIZ_QUESTIONS[currentQuizIndex];

  // Helper to get phone contacts based on scene
  const getPhoneContacts = () => {
    // In Lung Battle, we force the 3 specific options for gameplay purposes
    if (gameState.currentScene === SceneId.LUNG_BATTLE) {
       return [CharacterId.MACROPHAGE, CharacterId.B_CELL, CharacterId.PLATELET];
    }
    return gameState.contacts;
  };

  // --- Main Render ---
  return (
    <div className={`w-full h-screen overflow-hidden relative font-sans text-gray-800 select-none ${getBackgroundStyle()} ${uiState.shake ? 'animate-shake' : ''}`}>
      
      {/* ==================== LAYER 0: Background Elements ==================== */}
      <div className="absolute inset-0 z-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
      
      {/* Death Animation Overlay */}
      {uiState.isDying && (
        <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black animate-fade-in-up">
           <div className="text-red-600 font-bold text-6xl animate-pulse">
              SYSTEM CRITICAL
           </div>
           {/* Simulate cracks with CSS/SVG if desired, simplified here as black screen */}
        </div>
      )}

      {/* Alarm Flashing Overlay */}
      {gameState.currentScene === SceneId.ALARM && (
        <div className="absolute inset-0 bg-red-500/20 z-0 animate-pulse pointer-events-none"></div>
      )}

      {/* Lung Battle Fog Overlay */}
      {gameState.currentScene === SceneId.LUNG_BATTLE && (
         <div className="absolute inset-0 z-0 pointer-events-none bg-gradient-to-t from-green-900/40 to-transparent"></div>
      )}

      {/* Shop/Death Tree Overlay */}
      {(gameState.currentScene === SceneId.SHOP || gameState.currentScene === SceneId.DEATH_QUIZ) && (
         <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.6)_100%)] z-10"></div>
      )}

      {/* ==================== LAYER 1: Main Character Display ==================== */}
      <div className="absolute bottom-0 left-0 w-full h-full flex items-end justify-center z-10 pointer-events-none pb-0">
         {currentLine?.showCharacters?.map((charId, index) => (
           <div key={charId} 
                className={`
                   ${index === 0 ? "relative z-20" : "absolute z-10 opacity-70 scale-90 -left-20"}
                   ${charId === CharacterId.MACROPHAGE && uiState.isMacrophageAttacking ? 'transition-transform duration-1000 scale-150 translate-x-32' : ''}
                   ${charId === CharacterId.VIRUS && uiState.isMacrophageAttacking ? 'transition-all duration-500 opacity-0 scale-50' : ''}
                `}
           > 
              <CharacterPortrait id={charId} isEnemy={charId === CharacterId.VIRUS} />
           </div>
         ))}
      </div>

      {/* ==================== LAYER 1.5: Background Interactables ==================== */}
      {gameState.currentScene === SceneId.BONE_MARROW && (
         <div className="absolute inset-0 z-15">
            {renderInteractables()}
         </div>
      )}

      {/* ==================== LAYER 2: HUD ==================== */}
      {gameState.currentScene !== SceneId.BEDROOM && !uiState.isDying && (
        <>
          {/* Top Left: Heart Bar */}
          <div className="absolute top-4 left-4 z-20 flex gap-1">
            {Array.from({ length: gameState.maxHp }).map((_, i) => (
              <Heart key={i} size={32} fill={i < gameState.hp ? "#ef4444" : "transparent"} className={i < gameState.hp ? "text-red-500 drop-shadow-sm" : "text-gray-400"} />
            ))}
          </div>

          {/* Top Right: Tasks & Phone */}
          <div className="absolute top-4 right-4 z-20 flex flex-col gap-4 items-center">
             {/* Task Icon */}
             <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center border-4 border-white shadow-lg animate-bounce">
               <span className="text-2xl font-bold text-yellow-800">!</span>
             </div>
             
             {/* Phone Button */}
             <button 
               onClick={() => {
                 setUiState(p => ({ ...p, showPhone: true }));
                 // Special logic: If in Alarm scene and just starting, advance script to show video
                 if (gameState.currentScene === SceneId.ALARM && gameState.dialogueIndex === 0) {
                    handleAdvanceDialogue();
                 }
               }}
               className={`w-14 h-14 bg-blue-500 rounded-xl flex items-center justify-center border-4 border-blue-300 shadow-lg hover:bg-blue-600 transition-colors relative 
                 ${gameState.currentScene === SceneId.ALARM ? 'animate-[shake_0.5s_infinite] bg-red-600 border-red-400' : ''}`}
             >
               <Tablet className="text-white" size={28} />
               {(gameState.currentScene === SceneId.ALARM || gameState.flags.hasNewContact) && (
                 <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-ping" />
               )}
             </button>
          </div>

          {/* Bottom Left: Map */}
          <div className="absolute bottom-6 left-6 z-20">
             <button 
               onClick={() => {
                 setUiState(p => ({ ...p, showMap: true }));
                 // Unlock Bone Marrow if we are at Artery end
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

          {/* Bottom Right: Backpack */}
          <div className="absolute bottom-6 right-6 z-20">
             <button 
               onClick={() => setUiState(p => ({ ...p, showInventory: true }))}
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

      {/* ==================== LAYER 3: Dialogue ==================== */}
      {currentLine && !uiState.showMap && !uiState.showInventory && !uiState.showWeaponSelect && !uiState.showShop && !uiState.showThymusGame && !uiState.isDying && (
        <DialogueBox 
          speaker={currentLine.speaker === '???' ? '???' : currentLine.speaker === 'SYSTEM' ? '系统' : CHARACTER_ASSETS[currentLine.speaker as CharacterId]?.name || currentLine.speaker} 
          speakerId={currentLine.speaker}
          text={currentLine.text} 
          onClick={handleAdvanceDialogue} 
        />
      )}

      {/* ==================== LAYER 4: Modals (Z-50) ==================== */}

      {/* SHOP MODAL */}
      {uiState.showShop && (
         <div className="absolute inset-0 bg-black/80 z-[70] flex items-center justify-center">
            <div className="bg-[#5d4037] border-8 border-[#3e2723] rounded-3xl p-8 w-[900px] relative shadow-2xl flex flex-col gap-6 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')]">
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
                  {/* Item 1: Video */}
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

                  {/* Item 2: Diary */}
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

                  {/* Item 3: Key */}
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

      {/* WEAPON SELECT MODAL */}
      {uiState.showWeaponSelect && (
         <div className="absolute inset-0 bg-black/50 z-50 flex items-center justify-center animate-fade-in-up">
            <div className="flex flex-col items-center gap-8">
               <h2 className="text-4xl font-bold text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] animate-bounce">选择武器!</h2>
               <div className="flex gap-6">
                  {/* Weapon 1: Missile */}
                  <button onClick={() => handleWeaponSelect('MISSILE')} className="group flex flex-col items-center gap-2 transition-transform hover:scale-110">
                     <div className="w-32 h-32 bg-gray-800 rounded-2xl border-4 border-gray-600 flex items-center justify-center shadow-2xl group-hover:border-red-500 group-hover:bg-gray-700">
                        <Rocket size={64} className="text-gray-300 group-hover:text-red-400" />
                     </div>
                     <span className="bg-black/80 text-white px-3 py-1 rounded-full font-bold">Y型导弹</span>
                  </button>

                  {/* Weapon 2: Spoon */}
                  <button onClick={() => handleWeaponSelect('SPOON')} className="group flex flex-col items-center gap-2 transition-transform hover:scale-110">
                     <div className="w-32 h-32 bg-pink-100 rounded-2xl border-4 border-pink-300 flex items-center justify-center shadow-2xl group-hover:border-pink-500 group-hover:bg-white">
                        <Utensils size={64} className="text-pink-500" />
                     </div>
                     <span className="bg-black/80 text-white px-3 py-1 rounded-full font-bold">大勺子</span>
                  </button>

                  {/* Weapon 3: Laser */}
                  <button onClick={() => handleWeaponSelect('LASER')} className="group flex flex-col items-center gap-2 transition-transform hover:scale-110">
                     <div className="w-32 h-32 bg-blue-900 rounded-2xl border-4 border-blue-600 flex items-center justify-center shadow-2xl group-hover:border-cyan-400 group-hover:bg-blue-800">
                        <Zap size={64} className="text-cyan-300 group-hover:text-white" />
                     </div>
                     <span className="bg-black/80 text-white px-3 py-1 rounded-full font-bold">激光枪</span>
                  </button>
               </div>
            </div>
         </div>
      )}

      {/* THYMUS GAME MODAL */}
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

      {/* BIO MODAL */}
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

      {/* DEATH QUIZ MODAL */}
      {gameState.currentScene === SceneId.DEATH_QUIZ && (
         <div className="absolute inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
             <div className="max-w-xl w-full bg-[#1a2e1a] border-4 border-[#4a7a4a] rounded-xl p-8 text-green-100 shadow-[0_0_50px_rgba(74,222,128,0.2)]">
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

      {/* MAP MODAL */}
      {uiState.showMap && (
        <div className="absolute inset-0 bg-black/60 z-50 flex items-center justify-center p-8">
          <div className="bg-[#f0e6d2] w-full max-w-4xl aspect-video rounded-sm shadow-2xl p-8 relative border-[12px] border-white transform rotate-1">
            <button onClick={() => setUiState(p => ({ ...p, showMap: false }))} className="absolute top-4 right-4 bg-red-500 text-white p-2 rounded-full"><X/></button>
            <h2 className="text-3xl font-bold text-[#4a3b32] mb-8 text-center border-b-2 border-[#4a3b32] pb-2 inline-block w-full">身体地图导览</h2>
            
            {/* Map Line Graphic */}
            <div className="relative w-full h-64 flex items-center justify-between px-16">
              {/* Line */}
              <div className="absolute top-1/2 left-0 w-full h-4 bg-[#4a3b32] -z-10 rounded-full"></div>

              {/* Node: Artery */}
              <div onClick={() => handleMapTravel(SceneId.ARTERY)} className="flex flex-col items-center gap-2 cursor-pointer group">
                 <div className={`w-12 h-12 rounded-full border-4 border-[#4a3b32] flex items-center justify-center bg-red-500 z-10 transition-transform group-hover:scale-125 ${gameState.currentScene === SceneId.ARTERY ? 'ring-4 ring-yellow-400' : ''}`}>
                    <div className="w-4 h-4 bg-white rounded-full"></div>
                 </div>
                 <span className="font-bold text-[#4a3b32] bg-white px-2 py-1 rounded border border-[#4a3b32]">大动脉</span>
              </div>

              {/* Node: Bone Marrow */}
              <div onClick={() => gameState.unlockedMapNodes.includes(SceneId.BONE_MARROW) && handleMapTravel(SceneId.BONE_MARROW)} 
                   className={`flex flex-col items-center gap-2 cursor-pointer group ${!gameState.unlockedMapNodes.includes(SceneId.BONE_MARROW) && 'opacity-50 grayscale'}`}>
                 <div className={`w-16 h-16 rounded-full border-4 border-[#4a3b32] flex items-center justify-center bg-pink-300 z-10 transition-transform group-hover:scale-110 
                   ${gameState.currentScene === SceneId.BONE_MARROW ? 'ring-4 ring-yellow-400' : ''}
                   ${gameState.unlockedMapNodes.includes(SceneId.BONE_MARROW) && gameState.currentScene !== SceneId.BONE_MARROW ? 'animate-pulse ring-4 ring-yellow-400/50' : ''}
                 `}>
                    <div className="text-2xl">🍼</div>
                 </div>
                 <span className="font-bold text-[#4a3b32] bg-white px-2 py-1 rounded border border-[#4a3b32]">骨髓</span>
              </div>

              {/* Node: Lungs */}
              <div onClick={() => handleMapTravel(SceneId.LUNG_BATTLE)} className="flex flex-col items-center gap-2 cursor-pointer group relative">
                 {/* Alarm Alert */}
                 {gameState.currentScene === SceneId.ALARM && (
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-20 animate-bounce">
                        <ShieldAlert className="text-red-600 fill-white" size={40} />
                    </div>
                 )}
                 <div className={`w-14 h-14 rounded-full border-4 border-[#4a3b32] flex items-center justify-center bg-blue-300 z-10 transition-transform group-hover:scale-110 ${gameState.currentScene === SceneId.ALARM ? 'animate-pulse bg-red-500' : ''}`}>
                    <div className="text-2xl">🌬️</div>
                 </div>
                 <span className="font-bold text-[#4a3b32] bg-white px-2 py-1 rounded border border-[#4a3b32]">肺部</span>
              </div>

               {/* Node: Shop */}
               <div onClick={() => handleMapTravel(SceneId.SHOP)} className="flex flex-col items-center gap-2 cursor-pointer group">
                 <div className="w-14 h-14 rounded-full border-4 border-[#4a3b32] flex items-center justify-center bg-green-700 z-10 transition-transform group-hover:scale-110">
                    <div className="text-2xl">🌳</div>
                 </div>
                 <span className="font-bold text-[#4a3b32] bg-white px-2 py-1 rounded border border-[#4a3b32]">淋巴结</span>
              </div>
            </div>
            <div className="absolute bottom-4 left-4 text-[#4a3b32] text-sm opacity-70">CURRENT LOCATION: {gameState.currentScene}</div>
          </div>
        </div>
      )}

      {/* PHONE MODAL */}
      {uiState.showPhone && (
        <div className="absolute inset-0 bg-black/70 z-50 flex items-center justify-center">
          <div className="bg-gray-800 rounded-3xl p-4 w-[90%] max-w-4xl aspect-[16/9] relative shadow-[0_0_0_10px_#374151]">
            <button onClick={() => setUiState(p => ({ ...p, showPhone: false }))} className="absolute -top-10 right-0 text-white bg-gray-700 rounded-full p-2"><X/></button>
            
            {/* Screen Content */}
            <div className="bg-[#e0f2fe] w-full h-full rounded-xl overflow-hidden flex border-4 border-gray-900 bg-[size:20px_20px] bg-[linear-gradient(to_right,#cbd5e1_1px,transparent_1px),linear-gradient(to_bottom,#cbd5e1_1px,transparent_1px)] relative">
               
               {/* 1. Alarm Scene Video Call Mode */}
               {gameState.currentScene === SceneId.ALARM && (
                 <div className="absolute inset-0 z-20 flex flex-col bg-black">
                     {/* Video Feed Header */}
                     <div className="bg-red-600 text-white p-4 flex justify-between items-center animate-pulse">
                        <div className="flex items-center gap-2">
                           <ShieldAlert size={24}/>
                           <span className="font-bold tracking-wider">EMERGENCY BROADCAST</span>
                        </div>
                        <SignalHigh className="animate-pulse" />
                     </div>

                     {/* Video Content */}
                     <div className="flex-1 relative overflow-hidden flex items-center justify-center bg-green-900/20">
                         {/* Static effect overlay */}
                         <div className="absolute inset-0 opacity-10 bg-[url('https://upload.wikimedia.org/wikipedia/commons/7/76/VHS_static_noise.png')] bg-repeat animate-pulse pointer-events-none"></div>
                         
                         {/* Dendritic Cell Appearance */}
                         <img src={CHARACTER_ASSETS[CharacterId.DENDRITIC].avatar} className="h-full object-cover opacity-80" />
                         
                         {/* Scanlines */}
                         <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] pointer-events-none"></div>
                     </div>

                     {/* The dialogue is handled by the main DialogueBox, but we can add visual fluff here */}
                     <div className="h-12 bg-gray-900 flex items-center justify-center text-green-500 font-mono text-xs">
                        CONNECTING TO HQ... SIGNAL WEAK...
                     </div>
                 </div>
               )}

               {/* 2. Normal Phone Mode (including LUNG_BATTLE battle menu) */}
               {gameState.currentScene !== SceneId.ALARM && (
                 <>
                    {/* Left: Contacts */}
                    <div className="w-1/3 bg-white/80 border-r-2 border-gray-300 flex flex-col">
                        <div className={`p-4 text-white font-bold flex items-center gap-2 ${gameState.currentScene === SceneId.LUNG_BATTLE ? 'bg-red-600' : 'bg-blue-500'}`}>
                          <Tablet size={18}/> {gameState.currentScene === SceneId.LUNG_BATTLE ? '战斗支援请求' : '联络人'}
                        </div>
                        {gameState.currentScene === SceneId.LUNG_BATTLE ? (
                           <div className="px-4 py-2 text-xs text-red-800 bg-red-100 flex gap-2 items-center">
                              <Ban size={12} /> 资料数据库连接中断
                           </div>
                        ) : (
                           <div className="px-4 py-2 text-xs text-blue-800 bg-blue-100 flex gap-2 items-center">
                              <Info size={12} /> 右键点击头像查看资料
                           </div>
                        )}
                        <div className="flex-1 overflow-y-auto">
                          {getPhoneContacts().map(cid => (
                            <div key={cid} 
                                 onClick={() => handleContactCall(cid)} 
                                 onContextMenu={(e) => handleContactRightClick(e, cid)}
                                 className={`flex items-center gap-3 p-3 border-b hover:bg-opacity-50 cursor-pointer transition-colors group ${gameState.currentScene === SceneId.LUNG_BATTLE ? 'hover:bg-red-200' : 'hover:bg-blue-50'}`}>
                              <div className={`w-10 h-10 rounded-full bg-gray-200 overflow-hidden border border-gray-400 ${gameState.currentScene === SceneId.LUNG_BATTLE ? 'group-hover:border-red-400' : 'group-hover:border-blue-400'}`}>
                                 <img src={CHARACTER_ASSETS[cid].avatar} className="w-full h-full object-cover" />
                              </div>
                              <span className="font-bold text-sm text-gray-700">{CHARACTER_ASSETS[cid].name}</span>
                            </div>
                          ))}
                        </div>
                    </div>
                    
                    {/* Right: Active Call Placeholder */}
                    <div className="w-2/3 relative flex items-center justify-center p-8">
                        <div className="text-center opacity-50">
                          <div className={`w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center ${gameState.currentScene === SceneId.LUNG_BATTLE ? 'bg-red-300' : 'bg-gray-300'}`}>
                             <Contact size={40} className="text-white"/>
                          </div>
                          <p>{gameState.currentScene === SceneId.LUNG_BATTLE ? '选择即时支援单位' : '选择左侧联络人发起通话'}</p>
                        </div>
                    </div>
                 </>
               )}
            </div>
          </div>
        </div>
      )}

      {/* INVENTORY MODAL (Backpack) */}
      {uiState.showInventory && (
        <div className="absolute inset-0 bg-black/60 z-50 flex items-center justify-center">
           <div className="bg-orange-100 w-[800px] h-[500px] rounded-3xl border-8 border-orange-800 shadow-2xl relative flex flex-col overflow-hidden">
              <button onClick={() => setUiState(p => ({ ...p, showInventory: false }))} className="absolute top-4 right-4 bg-orange-800 text-white p-2 rounded-full z-10"><X/></button>
              
              {/* Tabs */}
              <div className="flex bg-orange-200 border-b-4 border-orange-800">
                <div className="px-8 py-4 bg-orange-100 font-bold text-orange-900 rounded-t-xl mt-2 ml-4 border-t-4 border-x-4 border-orange-800 -mb-1 z-10">道具包</div>
                <div className="px-8 py-4 bg-orange-800/50 text-orange-100 font-bold mt-2 cursor-not-allowed">图鉴 (锁定)</div>
              </div>

              {/* Content */}
              <div className="flex-1 p-8 flex gap-8">
                 {/* Item List */}
                 <div className="w-1/2 grid grid-cols-3 gap-4 content-start">
                    {gameState.inventory.map(item => (
                      <div key={item.id} className="aspect-square bg-orange-200 rounded-xl border-2 border-orange-400 flex items-center justify-center text-4xl cursor-pointer hover:bg-orange-300 transition-colors shadow-sm">
                        {item.icon}
                      </div>
                    ))}
                    {/* Empty Slots */}
                    {Array.from({length: 6}).map((_, i) => (
                      <div key={i} className="aspect-square bg-orange-50 rounded-xl border-2 border-orange-200/50"></div>
                    ))}
                 </div>
                 {/* Details */}
                 <div className="w-1/2 bg-white/50 rounded-xl p-6 border-2 border-orange-200">
                    <h3 className="text-xl font-bold text-orange-900 mb-2">当前积分: {gameState.points}</h3>
                    <p className="text-orange-800/70 text-sm">点击左侧物品查看详情...</p>
                 </div>
              </div>
           </div>
        </div>
      )}

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
      `}</style>
    </div>
  );
};

export default App;
