
export enum SceneId {
  BEDROOM = 'BEDROOM',
  ARTERY = 'ARTERY',
  BONE_MARROW = 'BONE_MARROW',
  ALARM = 'ALARM',
  LUNG_BATTLE = 'LUNG_BATTLE',
  VICTORY = 'VICTORY',
  SHOP = 'SHOP',
  DEATH_QUIZ = 'DEATH_QUIZ',
  THYMUS_PRISON = 'THYMUS_PRISON',
  ANTIGEN_PRESENTATION = 'ANTIGEN_PRESENTATION'
}

export enum CharacterId {
  PLAYER = 'PLAYER',
  RBC_08 = 'RBC_08',
  MACROPHAGE = 'MACROPHAGE',
  B_CELL = 'B_CELL',
  KILLER_T = 'KILLER_T',
  DENDRITIC = 'DENDRITIC',
  VIRUS = 'VIRUS',
  PLATELET = 'PLATELET',
  ELDER = 'ELDER'
}

export interface InventoryItem {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export interface GameState {
  currentScene: SceneId;
  dialogueIndex: number;
  hp: number;
  maxHp: number;
  points: number;
  unlockedMapNodes: string[];
  contacts: CharacterId[];
  inventory: InventoryItem[];
  flags: {
    metMacrophage: boolean;
    metBCell: boolean;
    battlePhase: 'CALL_ALLY' | 'EQUIP_WEAPON' | 'NONE';
    deathCount: number;
    quizCorrectCount: number;
    hasNewContact: boolean; // Added for UI notification
  };
}

export interface ScriptLine {
  id: string;
  speaker: CharacterId | 'SYSTEM' | '???';
  text: string;
  nextTrigger?: 'AUTO' | 'CLICK' | 'MAP_OPEN' | 'CHOICE' | 'WEAPON_SELECT' | 'SHOP_OPEN' | 'THYMUS_GAME' | 'QUIZ_START' | 'PHONE_CALL';
  background?: string; // CSS class for bg
  showCharacters?: CharacterId[];
  nextIndex?: number; // For jumping to specific dialogue lines
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  rewardHp: number;
}
