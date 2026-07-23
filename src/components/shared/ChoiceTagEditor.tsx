import React, { useEffect, useRef, useState } from "react";
import { fetchChoiceTags, ChoiceType, fetchAvailableTags, TagDefinition } from "../../services/tagService";
import { Loader2, Tag, ChevronsUpDown, Check, X } from "lucide-react";
import { toast } from "sonner";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TagSlot {
  tag_id?: string;
  tag_name: string;
  tag_category: string;
  rationale: string;
}

export const EMPTY_SLOT: TagSlot = { tag_name: "", tag_category: "", rationale: "" };

interface ChoiceTagEditorProps {
  /** DB choice ID. Required for DB-backed (edit) mode. */
  choiceId?: string | number;
  choiceType: ChoiceType;

  // ── Controlled mode ──
  /** Parent-managed tag slots */
  localSlots: TagSlot[];
  onLocalSlotsChange: (slots: TagSlot[]) => void;

  disabled?: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Free-form tag editor per answer choice.
 *
 * Styled to match the Explanation (optional) field pattern.
 * Label + count on one row, combobox directly below.
 * Selected pills live inside the combobox trigger at all times.
 * Dropdown uses 2-column grid for compact, no-scroll browsing.
 */
export const ChoiceTagEditor: React.FC<ChoiceTagEditorProps> = ({
  choiceId,
  choiceType,
  localSlots,
  onLocalSlotsChange,
  disabled = false,
}) => {
  const [loading, setLoading] = useState(false);
  const [availableTags, setAvailableTags] = useState<TagDefinition[]>([]);
  const [comboOpen, setComboOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const onSlotsChangeRef = useRef(onLocalSlotsChange);

  // Sync ref with latest prop
  useEffect(() => {
    onSlotsChangeRef.current = onLocalSlotsChange;
  }, [onLocalSlotsChange]);

  // ── Load available tags ──
  useEffect(() => {
    fetchAvailableTags(choiceType).then(setAvailableTags);
  }, [choiceType]);

  // ── Load from DB on edit mode ──
  useEffect(() => {
    if (!choiceId) return;
    setLoading(true);
    fetchChoiceTags(choiceId, choiceType)
      .then((existing) => {
        if (existing.length > 0) {
          onSlotsChangeRef.current(
            existing.map((t) => ({
              tag_id: t.tag_id,
              tag_name: t.tag_name || "",
              tag_category: t.tag_category || "",
              rationale: t.rationale || "",
            })),
          );
        }
      })
      .finally(() => setLoading(false));
  }, [choiceId, choiceType]);

  // ── Helpers ───────────────────────────────────────────────────────────────

  const toggleTag = (tag: TagDefinition) => {
    if (disabled) return;
    const isSelected = localSlots.some((s) => s.tag_name === tag.name);
    if (isSelected) {
      onLocalSlotsChange(localSlots.filter((s) => s.tag_name !== tag.name));
    } else if (localSlots.length < 3) {
      onLocalSlotsChange([
        ...localSlots,
        {
          tag_id: tag.id,
          tag_name: tag.name,
          tag_category: tag.category || "General",
          rationale: "",
        },
      ]);
    } else {
      toast.error("Maximum 3 tags allowed per choice");
    }
  };

  const removeSlot = (idx: number) => {
    onLocalSlotsChange(localSlots.filter((_, i) => i !== idx));
  };

  const updateSlot = (idx: number, partial: Partial<TagSlot>) => {
    onLocalSlotsChange(localSlots.map((s, i) => (i === idx ? { ...s, ...partial } : s)));
  };

  // ── Order helpers (commented out — reordering disabled for now) ──
  // const moveSlotUp = (idx: number) => { ... };
  // const moveSlotDown = (idx: number) => { ... };

  const filledCount = localSlots.length;
  const canAddMore = !disabled && filledCount < 3;

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="mt-4 space-y-4 animate-in fade-in duration-300">

      {/* ── Label row: matches Explanation (optional) label style ── */}
      <div className="flex items-center justify-between ml-1">
        <label className="text-xs font-bold tracking-widest text-gray-600 uppercase">
          Select Reasoning Patterns
        </label>
        <span
          className={cn(
            "text-xs font-bold px-2 py-0.5 rounded border",
            filledCount >= 3
              ? "bg-amber-50 border-amber-200 text-amber-700"
              : "bg-gray-50 border-gray-200 text-gray-400",
          )}
        >
          {filledCount} / 3
        </span>
      </div>

      {/* ── Combobox ── */}
      {loading ? (
        <div className="flex items-center gap-2 text-sm text-gray-400 py-1">
          <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
          Loading patterns…
        </div>
      ) : (
        <Popover open={comboOpen} onOpenChange={setComboOpen}>
          {/* Trigger — matches explanation textarea style */}
          <PopoverTrigger asChild>
            <button
              ref={triggerRef}
              type="button"
              role="combobox"
              aria-expanded={comboOpen}
              disabled={disabled}
              className={cn(
                "w-full flex items-center flex-wrap gap-1.5 min-h-[40px] px-4 py-2",
                "bg-gray-50 border border-gray-200 rounded-lg text-left transition-all",
                "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                comboOpen && "ring-2 ring-blue-500 border-blue-500",
                disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:border-gray-300",
              )}
            >
              {localSlots.length > 0 ? (
                <>
                  {localSlots.map((slot, idx) => (
                    <span
                      key={`trigger-pill-${slot.tag_name}-${idx}`}
                      className="inline-flex items-center gap-1 bg-white border border-blue-200 text-blue-700 text-sm font-semibold px-2.5 py-0.5 rounded-md shadow-sm"
                    >
                      {slot.tag_name}
                      {!disabled && (
                        <span
                          role="button"
                          tabIndex={0}
                          onPointerDown={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            removeSlot(idx);
                          }}
                          className="ml-0.5 text-blue-300 hover:text-red-500 transition-colors cursor-pointer"
                          title={`Remove ${slot.tag_name}`}
                        >
                          <X className="h-3 w-3" />
                        </span>
                      )}
                    </span>
                  ))}
                  {canAddMore && (
                    <span className="text-sm text-gray-400">Add more…</span>
                  )}
                </>
              ) : (
                <span className="text-sm text-gray-400">Search and select tags…</span>
              )}
              <ChevronsUpDown className="h-4 w-4 text-gray-400 shrink-0 ml-auto" />
            </button>
          </PopoverTrigger>

          {/* Dropdown: 2-column grid, no scroll */}
          <PopoverContent
            className="w-[--radix-popover-trigger-width] p-0 rounded-xl border border-gray-200 shadow-lg"
            align="start"
            side="bottom"
          >
            <Command>
              <CommandInput placeholder="Search tags…" className="h-9 text-sm" />
              <CommandList className="max-h-none overflow-visible">
                <CommandEmpty className="py-4 text-center text-sm text-gray-400">
                  No tags found.
                </CommandEmpty>
                <CommandGroup className="p-2">
                  <div className="grid grid-cols-2 gap-1">
                    {availableTags.map((tag) => {
                      const isSelected = localSlots.some((s) => s.tag_name === tag.name);
                      return (
                        <CommandItem
                          key={tag.id}
                          value={tag.name}
                          onSelect={() => {
                            toggleTag(tag);
                            // Stay open for multi-select; close when max reached
                            if (!isSelected && localSlots.length >= 2) {
                              setComboOpen(false);
                            } else {
                              setComboOpen(true);
                            }
                          }}
                          disabled={!isSelected && filledCount >= 3}
                          className={cn(
                            "flex items-center gap-2 cursor-pointer px-2.5 py-2 rounded-lg transition-all",
                            isSelected ? "bg-blue-50 text-blue-700" : "hover:bg-gray-50 text-gray-700",
                            !isSelected && filledCount >= 3 ? "opacity-40" : "",
                          )}
                        >
                          <Check
                            className={cn(
                              "h-3.5 w-3.5 shrink-0 text-blue-600",
                              isSelected ? "opacity-100" : "opacity-0",
                            )}
                          />
                          <div className="flex flex-col min-w-0 flex-1">
                            <span className="text-sm font-semibold truncate leading-tight">
                              {tag.name}
                            </span>
                            {tag.category && (
                              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 leading-tight">
                                {tag.category}
                              </span>
                            )}
                            {/* Description commented out */}
                            {/* {tag.description && (
                              <span className="text-xs text-gray-400 truncate">{tag.description}</span>
                            )} */}
                          </div>
                        </CommandItem>
                      );
                    })}
                  </div>
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      )}

      {/* ── Selected tag detail cards ── */}
      {localSlots.length > 0 && (
        <div
          className={cn(
            "grid gap-3",
            localSlots.length === 1
              ? "grid-cols-1"
              : localSlots.length === 2
              ? "grid-cols-1 sm:grid-cols-2"
              : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3",
          )}
        >
          {localSlots.map((slot, idx) => {
            // const tagDef = availableTags.find((t) => t.name === slot.tag_name);
            return (
              <div
                key={`${slot.tag_name}-${idx}`}
                className="group relative  rounded-lg border border-gray-200 bg-gray-50 p-3 transition-all hover:border-blue-300 hover:bg-white hover:shadow-sm"
              >
                {/* Left accent */}
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-l-lg opacity-0 group-hover:opacity-100 transition-opacity" />

                {/* Header: tag name + remove */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Tag className="h-3 w-3 text-blue-500 shrink-0" />
                    <span className="text-sm font-bold text-blue-700 truncate">{slot.tag_name}</span>
                  </div>

                  {/* Category badge — commented out */}
                  {/* <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400 border border-gray-200 px-1.5 py-0.5 rounded shrink-0">
                    {slot.tag_category || "General"}
                  </span> */}

                  {/* Description — commented out */}
                  {/* {tagDef?.description && (
                    <p className="text-[11px] text-gray-400 italic truncate">{tagDef.description}</p>
                  )} */}

                  {/* Reorder buttons — commented out */}
                  {/* {!disabled && localSlots.length > 1 && ( ... )} */}

                  {!disabled && (
                    <button
                      type="button"
                      onClick={() => removeSlot(idx)}
                      className="shrink-0 text-gray-300 hover:text-red-500 transition-colors p-0.5 rounded hover:bg-red-50"
                      title="Remove tag"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                {/* Rationale */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    Rationale
                  </label>
                  <textarea
                    value={slot.rationale}
                    onChange={(e) => updateSlot(idx, { rationale: e.target.value })}
                    disabled={disabled}
                    rows={2}
                    placeholder={`Why "${slot.tag_name}"?`}
                    className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
