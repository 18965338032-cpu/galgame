export interface Choice {
  id: string;
  text: string;
  actionType: 'neutral' | 'romantic' | 'aggressive' | 'funny';
}

export interface StoryNode {
  narrative: string;
  speakerName: string;
  dialogue: string;
  visualDescription: string;
  choices: Choice[];
  backgroundStyle: string; // e.g., "city", "cafe", "space"
  soundEffectText?: string; // e.g. "BOOM!", "WHAM!"
}

export interface GameState {
  history: StoryNode[];
  currentTurn: StoryNode | null;
  currentImage: string | null;
  isLoadingText: boolean;
  isLoadingImage: boolean;
  gameStarted: boolean;
  error: string | null;
  playerName: string;
  genre: string;
}

export enum GameGenre {
  SUPERHERO = "Superhero Romance",
  NOIR = "Detective Noir",
  SCI_FI = "Sci-Fi Space Opera",
  HIGHSCHOOL = "High School Drama"
}