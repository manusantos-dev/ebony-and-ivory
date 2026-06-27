// TYPE: Pitch & Note models for polyphonic staves
export interface Pitch { letter: string; accidental: string; octave: number; }
export interface Note { rest: boolean; keys: Pitch[]; duration: string; dotted: boolean; dynamic?: string; fingering?: string; lyric?: string; tie?: boolean; slur?: boolean; articulation?: string; grace?: string; ornament?: string; }

// TYPE: Measure & Track definitions
export interface Measure { treble: Note[]; bass: Note[]; repeatStart: boolean; repeatEnd: boolean; directive: string; }

// TYPE: Core Score entity
export interface Score { id: string; plate: number; title: string; composer: string; timeSig: string; keySig: string; bpm: number; difficulty?: string; measures: Measure[]; createdAt: number; updatedAt: number; publisherUid?: string; publisherName?: string; likes?: number; likedBy?: string[]; views?: number; copies?: number; pinned?: boolean; }

// TYPE: User Profile (Phase 7: Social Network Expansion)
export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;

  // SOCIAL: Bio & Identity
  bio?: string;
  role?: 'amateur' | 'professional' | 'band' | 'orchestra' | 'conservatory';
  socialLinks?: { instagram?: string; youtube?: string; website?: string };

  // SOCIAL: Aggregated Stats (to avoid counting queries)
  stats?: { followers: number; following: number; publishedScores: number };
  isPrivate?: boolean;
}

// TYPE: Social Graph (Followers Matrix)
export interface SocialRelationship {
  id: string;
  followerId: string;
  followingId: string;
  status: 'pending' | 'accepted'; // Allows private account flow
  createdAt: number;
}

// TYPE: Notification Center
export interface Notification {
  id: string;
  targetUid: string; // The user receiving the notification
  actorUid: string;  // The user who did the action
  actorName: string;
  actorPhoto?: string;
  type: 'like' | 'follow' | 'follow_request' | 'follow_accept';
  scoreId?: string;  // Attached if it's a 'like' notification
  read: boolean;
  createdAt: number;
}

// TYPE: Global Application State matrices
export interface EditorState { activeMeasure: number; activeStaff: 'treble' | 'bass'; editingNoteIdx: number | null; duration: string; layoutMode: 'continuous' | 'book'; bookSpread: number; }
export interface FilterState { query: string; sortBy: string; filterTime: string; filterKey: string; filterHands: string; }
export interface AppState { lang: string; currentUser: UserProfile | null; currentScore: Score | null; publicScores: Score[]; isViewingPublic: boolean; editorState: EditorState; libraryState: FilterState; codexState: FilterState; }
