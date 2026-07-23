import { useRef } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Switch } from "./ui/switch";
import { X, Trash2, Plus, Tags } from "lucide-react";
import { ChoiceTagEditor, TagSlot } from "./shared/ChoiceTagEditor";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "./ui/dialog";

interface HotTextRegion {
  phrase: string;
  start_idx: number;
  end_idx: number;
  is_correct: boolean;
}

interface HotTextEditorProps {
  question: string;
  setQuestion: (q: string) => void;
  prompt?: string;
  setPrompt?: (p: string) => void;
  passage: string;
  setPassage: (p: string) => void;
  minSelections: number;
  setMinSelections: (n: number) => void;
  maxSelections: number;
  setMaxSelections: (n: number) => void;
  regions: HotTextRegion[];
  setRegions: React.Dispatch<React.SetStateAction<HotTextRegion[]>>;
  difficulty: number;
  setDifficulty: (d: number) => void;
  onCancel: () => void;
  istestpack?: boolean;
  // Tagging
  regionTagSlots?: Record<string, TagSlot[]>;
  setRegionTagSlots?: React.Dispatch<React.SetStateAction<Record<string, TagSlot[]>>>;
}

/**
 * Given a full `passage` and a selected `phrase`, returns the first matching
 * start and end indices for the phrase in the passage text.
 *
 * Accounts for multiple identical words by using a `usedIndices` Set to skip used matches.
 */
function getWordPosition(
  passage: string,
  phrase: string,
  usedIndices: Set<number>,
): { start_idx: number; end_idx: number } | null {
  // Strip punctuation from phrase for comparison
  const cleanPhrase = phrase.replace(/[.,!?;:]/g, "");

  // Find all word boundaries in the passage
  const words = passage.split(/\b/);
  let currentIndex = 0;

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const cleanWord = word.replace(/[.,!?;:]/g, "");

    if (cleanWord === cleanPhrase && !usedIndices.has(currentIndex)) {
      const start_idx = currentIndex;
      const end_idx = currentIndex + word.length;
      return { start_idx, end_idx };
    }

    currentIndex += word.length;
  }

  return null;
}

/**
 * Enhanced selection handling with drag-to-select functionality
 */
export default function HotTextEditor({
  question,
  setQuestion,
  prompt,
  setPrompt,
  passage,
  setPassage,
  minSelections,
  setMinSelections,
  maxSelections,
  setMaxSelections,
  regions,
  setRegions,
  difficulty,
  setDifficulty,
  onCancel,
  istestpack = false,
  regionTagSlots = {},
  setRegionTagSlots,
}: HotTextEditorProps) {
  const passageRef = useRef<HTMLDivElement>(null);

  // Add a derived variable for selected count
  const selectedCount = regions.length;

  // Handle number input changes
  const handleMinSelectionsChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      setMinSelections(value);
      // Ensure maxSelections is not less than minSelections
      if (maxSelections < value) {
        setMaxSelections(value);
      }
    }
  };

  const handleMaxSelectionsChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= minSelections) {
      setMaxSelections(value);
    }
  };

  // ⭐ NEW: Browser detection for debugging
  const getBrowserInfo = () => {
    const userAgent = navigator.userAgent;
    if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) return 'Safari';
    if (userAgent.includes('Edg')) return 'Edge';
    return 'Unknown';
  };

  // ⭐ NEW: Enhanced tokenizer that preserves spaces and positions
  const getDetailedTokens = (text: string) => {
    const tokens: {
      word: string;
      start: number;
      end: number;
      isWord: boolean;
      index: number;
    }[] = [];

    let index = 0;
    let tokenIndex = 0;

    // Split into words and spaces, preserving both
    const segments = text.split(/(\s+)/);
    let position = 0;

    segments.forEach((segment) => {
      if (segment.length > 0) {
        const isWord = !/^\s+$/.test(segment);
        tokens.push({
          word: segment,
          start: position,
          end: position + segment.length,
          isWord,
          index: tokenIndex++,
        });
        position += segment.length;
      }
    });

    return tokens;
  };

  // ⭐ NEW: Simple and reliable word selection using text selection API
  const getSelectedText = (): { text: string; start: number; end: number } | null => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return null;

    const range = selection.getRangeAt(0);
    const selectedText = range.toString().trim();

    if (!selectedText) return null;

    // Get the text content of the passage
    const passageText = passageRef.current?.textContent || "";

    // Find the start and end positions in the passage
    const startContainer = range.startContainer;
    const endContainer = range.endContainer;

    let startPos = 0;
    let endPos = 0;

    // Calculate start position
    if (startContainer.nodeType === Node.TEXT_NODE) {
      startPos = getTextNodeOffset(passageRef.current!, startContainer as Text, range.startOffset);
    }

    // Calculate end position
    if (endContainer.nodeType === Node.TEXT_NODE) {
      endPos = getTextNodeOffset(passageRef.current!, endContainer as Text, range.endOffset);
    }

    return {
      text: selectedText,
      start: startPos,
      end: endPos
    };
  };

  // Helper function to get text node offset
  const getTextNodeOffset = (root: Node, textNode: Text, offset: number): number => {
    let totalOffset = 0;
    const walker = document.createTreeWalker(
      root,
      NodeFilter.SHOW_TEXT,
      null
    );

    let node;
    while ((node = walker.nextNode())) {
      if (node === textNode) {
        return totalOffset + offset;
      }
      totalOffset += node.textContent?.length || 0;
    }

    return totalOffset;
  };



  // ⭐ NEW: Handle text selection - much simpler and more reliable
  const handleTextSelection = () => {
    const selection = getSelectedText();
    if (!selection) return;

    const { start, end } = selection;
    if (start === end) return;

    // Check for overlaps with existing regions
    const hasOverlap = regions.some(
      (region) => start < region.end_idx && end > region.start_idx,
    );
    if (hasOverlap) {
      console.warn("Selection overlaps with existing region");
      return;
    }
    // Check selection limits
    if (regions.length >= maxSelections) {
      console.warn("Maximum selections reached");
      return;
    }
    // Add the new region using indices only
    const newRegion: HotTextRegion = {
      phrase: passage.slice(start, end),
      start_idx: start,
      end_idx: end,
      is_correct: true,
    };
    setRegions((prev) => [...prev, newRegion]);
  };

  // Toggle correctness for a region
  const toggleCorrectness = (index: number) => {
    setRegions((prev) =>
      prev.map((region, i) =>
        i === index ? { ...region, is_correct: !region.is_correct } : region,
      ),
    );
  };

  // ⭐ NEW: Simple passage renderer
  const renderPassage = () => {
    if (!passage) return null;
    const result: React.ReactNode[] = [];
    let lastIndex = 0;
    // Sort regions by start position
    const sortedRegions = [...regions].sort(
      (a, b) => a.start_idx - b.start_idx,
    );
    sortedRegions.forEach((region, index) => {
      // Add text before this region
      if (lastIndex < region.start_idx) {
        result.push(
          <span key={`text-${index}`}>{passage.slice(lastIndex, region.start_idx)}</span>
        );
      }
      // Add the highlighted region (always use passage.slice for accuracy)
      result.push(
        <span
          key={`region-${index}`}
          className={
            region.is_correct
              ? "bg-blue-100 text-blue-800 border-2 border-blue-500 rounded px-1"
              : "bg-red-100 text-red-800 border-2 border-red-500 rounded px-1"
          }
        >
          {passage.slice(region.start_idx, region.end_idx)}
        </span>
      );
      lastIndex = region.end_idx;
    });
    // Add remaining text
    if (lastIndex < passage.length) {
      result.push(<span key="text-final">{passage.slice(lastIndex)}</span>);
    }
    return result;
  };

  // Validate selection count
  const isSelectionCountValid = () => {
    const count = regions.length;
    return count >= minSelections && count <= maxSelections;
  };

  // Handle save
  // const handleSave = () => {
  //   if (!isSelectionCountValid()) {
  //     console.warn(
  //       "Selection count must be between",
  //       minSelections,
  //       "and",
  //       maxSelections,
  //     );
  //     return;
  //   }
  //   const payload = {
  //     question,
  //     prompt,
  //     passage,
  //     min_selections: minSelections,
  //     max_selections: maxSelections,
  //     regions: regions,
  //     // difficulty: istestpack ? difficulty : undefined,
  //   };
  //   // onSave(payload); // This prop is removed, so this line is removed
  // };

  // Handler to delete a region
  const handleDeleteRegion = (idx: number) => {
    setRegions((prev) => prev.filter((_, i) => i !== idx));
    if (setRegionTagSlots) {
      setRegionTagSlots((prev) => {
        const newSlots: Record<string, TagSlot[]> = {};
        Object.entries(prev).forEach(([key, value]) => {
          const keyInt = parseInt(key);
          if (keyInt < idx) {
            newSlots[key] = value;
          } else if (keyInt > idx) {
            newSlots[(keyInt - 1).toString()] = value;
          }
        });
        return newSlots;
      });
    }
  };

  // ⭐ NEW: Clear all selections
  const handleClearSelections = () => {
    setRegions([]);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="question">Question</Label>
          <Input
            id="question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Enter your question"
          />
        </div>
        <div>
          <Label htmlFor="passage">Passage</Label>
          <Textarea
            id="passage"
            value={passage}
            onChange={(e) => setPassage(e.target.value)}
            placeholder="Enter the passage text"
            className="min-h-[100px]"
          />
        </div>
        <div>
          <Label htmlFor="difficulty">Difficulty (1-5)</Label>
          <Input
            id="difficulty"
            type="number"
            min="1"
            max="5"
            value={difficulty}
            onChange={(e) => setDifficulty(Number(e.target.value))}
            placeholder="Enter difficulty level (1-5)"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="minSelections">Minimum Selections</Label>
            <Input
              id="minSelections"
              type="number"
              min="1"
              value={minSelections.toString()}
              onChange={handleMinSelectionsChange}
            />
          </div>
          <div>
            <Label htmlFor="maxSelections">Maximum Selections</Label>
            <Input
              id="maxSelections"
              type="number"
              min={minSelections.toString()}
              value={maxSelections.toString()}
              onChange={handleMaxSelectionsChange}
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label>Passage Preview - Click and Drag to Select Text</Label>
          {regions.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearSelections}
              className="text-red-600 hover:text-red-700"
            >
              Clear All
            </Button>
          )}
        </div>

        <div className="relative">
          <div
            ref={passageRef}
            className="p-4 border rounded-lg bg-white min-h-[200px] max-h-[300px] overflow-y-auto leading-relaxed"
            onMouseUp={handleTextSelection}
          >
            {passage ? (
              renderPassage()
            ) : (
              <span className="text-gray-400">
                Enter passage text above to start selecting regions
              </span>
            )}
          </div>
        </div>

        <div className="text-sm space-y-1">
          <div className="text-gray-600">
            💡 <strong>How to use:</strong> Select text with your mouse to create hot text regions
          </div>
          <div className="text-gray-500">
            Selected regions: {regions.length} / {maxSelections}
            {!isSelectionCountValid() && (
              <span className="ml-2 text-red-500">
                (Must select between {minSelections} and {maxSelections}{" "}
                regions)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Preview all selected regions with correctness and controls */}
      {regions.length > 0 && (
        <div className="space-y-2">
          <Label>Selected Regions</Label>
          <div className="space-y-2">
            {regions.map((region, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 p-2 border rounded"
              >
                <Switch
                  checked={region.is_correct}
                  onCheckedChange={() => toggleCorrectness(idx)}
                />
                <span
                  className={
                    region.is_correct
                      ? "bg-blue-100 text-blue-800 border-2 border-blue-500 rounded px-2 py-1 flex-1"
                      : "bg-red-100 text-red-800 border-2 border-red-500 rounded px-2 py-1 flex-1"
                  }
                >
                  "{region.phrase}"
                </span>
                <span className="text-xs text-gray-500">
                </span>
                <button
                  type="button"
                  className="text-red-500 hover:text-red-700"
                  onClick={() => handleDeleteRegion(idx)}
                  title="Delete region"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                {/* Tagging Dialog */}
                {setRegionTagSlots && !region.is_correct && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className={`h-8 flex items-center gap-1.5 transition-all ${
                          (regionTagSlots[idx]?.filter(s => s.tag_name.trim()).length || 0) > 0
                            ? "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:border-blue-300 shadow-sm"
                            : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                        }`}
                        title="Tag this region"
                      >
                        <Tags className="h-3.5 w-3.5" />
                        <span className="text-xs font-medium">
                          Edit Tags ({regionTagSlots[idx]?.filter(s => s.tag_name.trim()).length || 0})
                        </span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col p-0 border-none shadow-2xl">
                      <DialogHeader className="p-6 border-b border-gray-100 bg-white sticky top-0 z-10">
                        <DialogTitle className="text-xl font-bold text-gray-900 flex items-center justify-between gap-3 w-full">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-100">
                              <Tags className="h-5 w-5" />
                            </div>
                            Tagging Region: <span className="text-blue-600">"{region.phrase}"</span>
                          </div>
                          <DialogClose asChild>
                            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400">
                              <X className="h-5 w-5" />
                            </button>
                          </DialogClose>
                        </DialogTitle>
                      </DialogHeader>
                      <div className="flex-1 overflow-y-auto px-6 pb-6 custom-scrollbar min-h-0">
                        <ChoiceTagEditor
                          choiceType={istestpack ? "test_pack" : "pre_shsat"}
                          localSlots={regionTagSlots[idx] || []}
                          onLocalSlotsChange={(newSlots) => {
                            setRegionTagSlots(prev => ({
                              ...prev,
                              [idx]: newSlots
                            }));
                          }}
                        />
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
