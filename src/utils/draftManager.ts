// Draft Management Utility for Question Modal
// Handles comprehensive state persistence across refreshes and network issues

export interface DraftData {
  // Meta information
  questionType: string;
  isTestPack: boolean;
  timestamp: number;
  initialValues?: any; // For editing existing questions
  
  // Common fields
  subject?: string;
  categoryId?: string;
  
  // MC (Multiple Choice) fields
  mcQuestion?: string;
  mcChoices?: any[];
  mcExplanation?: string;
  mcVariant?: string;
  mcDifficulty?: number;
  questionImageUrl?: string;
  
  // MA (Multiple Answer) fields
  maQuestion?: string;
  maChoices?: any[];
  maDifficulty?: number;
  
  // BLANK fields
  blankQuestion?: string;
  blankCorrectAnswer?: string;
  blankExplanation?: string;
  blankVariant?: string;
  blankDifficulty?: number;
  
  // TF (True/False) fields
  tfQuestion?: string;
  tfAnswer?: boolean | null;
  tfExplanation?: string;
  tfDifficulty?: number;
  
  // DND (Drag and Drop) fields
  dndQuestion?: string;
  dndSubtype?: string;
  dndChoices?: any[];
  dndBuckets?: any[];
  dndCorrectAssignments?: any;
  dndExplanation?: string;
  dndDifficulty?: number;
  
  // TABLE_GRID fields
  tgPrompt?: string;
  tgRowLabels?: string[];
  tgColumnLabels?: string[];
  tgSelectionMode?: string;
  tgFirstColumnHeader?: string;
  tgAnswerMatrix?: any[];
  tgDifficulty?: number;
  
  // HOT_TEXT fields
  hotTextQuestion?: string;
  hotTextPrompt?: string;
  hotTextPassage?: string;
  hotTextMinSelections?: number;
  hotTextMaxSelections?: number;
  hotTextRegions?: any[];
  hotTextDifficulty?: number;
  
  // RAY_SELECTOR fields
  rayPrompt?: string;
  numberlineMin?: string;
  numberlineMax?: string;
  tickInterval?: string;
  rayType?: string;
  rayEndpoint?: string;
  rayExplanation?: string;
  selectedRayType?: string;
  selectedRayEndpoint?: number;
  rayDifficulty?: number;
  
  // GRAPH_SELECTOR fields
  graphPrompt?: string;
  xMin?: string;
  xMax?: string;
  yMin?: string;
  yMax?: string;
  gridInterval?: string;
  maxSelectablePoints?: string;
  showAxes?: boolean;
  showLabels?: boolean;
  snapToGrid?: boolean;
  graphInstruction?: string;
  graphExplanation?: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  graphDifficulty?: number;
  availablePoints?: any[];
  correctPoints?: any[];
  
  // RC (Reading Comprehension) fields
  rcPassage?: string;
  rcTopicId?: number;
  rcSubTopicId?: number;
  rcImageUrl?: string;
  rcStartPage?: number;
  rcEndPage?: number;
  rcDifficulty?: number;
}

export class DraftManager {
  private static readonly DRAFT_PREFIX = 'question_modal_draft_';
  private static readonly MAX_DRAFT_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
  
  /**
   * Generate a unique draft key based on context and question type
   */
  private static getDraftKey(isTestPack: boolean, questionType: string, editingId?: number): string {
    const context = isTestPack ? 'testpack' : 'regular';
    const suffix = editingId ? `_edit_${editingId}` : '_new';
    return `${this.DRAFT_PREFIX}${context}_${questionType}${suffix}`;
  }
  
  /**
   * Save draft data to localStorage
   */
  static saveDraft(draftData: DraftData, editingId?: number): void {
    try {
      const key = this.getDraftKey(draftData.isTestPack, draftData.questionType, editingId);
      const dataWithTimestamp = {
        ...draftData,
        timestamp: Date.now()
      };
      
      localStorage.setItem(key, JSON.stringify(dataWithTimestamp));
      /* console.log('🔄 Draft saved:', key); */
    } catch (error) {
      console.error('❌ Failed to save draft:', error);
    }
  }
  
  /**
   * Load draft data from localStorage
   */
  static loadDraft(isTestPack: boolean, questionType: string, editingId?: number): DraftData | null {
    try {
      const key = this.getDraftKey(isTestPack, questionType, editingId);
      const stored = localStorage.getItem(key);
      
      if (!stored) {
        return null;
      }
      
      const draftData: DraftData = JSON.parse(stored);
      
      // Check if draft is too old
      if (Date.now() - draftData.timestamp > this.MAX_DRAFT_AGE) {
        this.clearDraft(isTestPack, questionType, editingId);
        return null;
      }
      
      /* console.log('📖 Draft loaded:', key); */
      return draftData;
    } catch (error) {
      console.error('❌ Failed to load draft:', error);
      return null;
    }
  }
  
  /**
   * Clear specific draft
   */
  static clearDraft(isTestPack: boolean, questionType: string, editingId?: number): void {
    try {
      const key = this.getDraftKey(isTestPack, questionType, editingId);
      localStorage.removeItem(key);
      /* console.log('🗑️ Draft cleared:', key); */
    } catch (error) {
      console.error('❌ Failed to clear draft:', error);
    }
  }
  
  /**
   * Clear all drafts (for cleanup)
   */
  static clearAllDrafts(): void {
    try {
      const keys = Object.keys(localStorage).filter(key => key.startsWith(this.DRAFT_PREFIX));
      keys.forEach(key => localStorage.removeItem(key));
      /* console.log('🗑️ All drafts cleared'); */
    } catch (error) {
      console.error('❌ Failed to clear all drafts:', error);
    }
  }
  
  /**
   * Get all existing drafts (for debugging)
   */
  static getAllDrafts(): { [key: string]: DraftData } {
    const drafts: { [key: string]: DraftData } = {};
    
    try {
      const keys = Object.keys(localStorage).filter(key => key.startsWith(this.DRAFT_PREFIX));
      
      keys.forEach(key => {
        const stored = localStorage.getItem(key);
        if (stored) {
          try {
            drafts[key] = JSON.parse(stored);
          } catch (error) {
            console.error(`❌ Failed to parse draft ${key}:`, error);
          }
        }
      });
    } catch (error) {
      console.error('❌ Failed to get all drafts:', error);
    }
    
    return drafts;
  }
  
  /**
   * Check if a draft exists for the given context
   */
  static hasDraft(isTestPack: boolean, questionType: string, editingId?: number): boolean {
    const key = this.getDraftKey(isTestPack, questionType, editingId);
    return localStorage.getItem(key) !== null;
  }
  
  /**
   * Clean up old drafts (call this periodically)
   */
  static cleanupOldDrafts(): void {
    try {
      const keys = Object.keys(localStorage).filter(key => key.startsWith(this.DRAFT_PREFIX));
      const now = Date.now();
      
      keys.forEach(key => {
        const stored = localStorage.getItem(key);
        if (stored) {
          try {
            const draftData: DraftData = JSON.parse(stored);
            if (now - draftData.timestamp > this.MAX_DRAFT_AGE) {
              localStorage.removeItem(key);
              /* console.log('🗑️ Cleaned up old draft:', key); */
            }
          } catch (error) {
            // If we can't parse it, remove it
            localStorage.removeItem(key);
            /* console.log('🗑️ Removed invalid draft:', key); */
          }
        }
      });
    } catch (error) {
      console.error('❌ Failed to cleanup old drafts:', error);
    }
  }
}

// Auto-cleanup on module load
DraftManager.cleanupOldDrafts();