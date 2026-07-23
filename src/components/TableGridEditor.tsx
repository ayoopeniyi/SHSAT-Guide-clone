import React from "react";
import { Tags, X } from "lucide-react";
import { Button } from "./ui/button";
import { ChoiceTagEditor, TagSlot } from "./shared/ChoiceTagEditor";
import { ChoiceTagPills } from "./question-card/ChoiceTagPills";
import type { ChoiceTag } from "../services/tagService";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "./ui/dialog";

interface TableGridEditorProps {
  rowLabels: string[];
  columnLabels: string[];
  answerMatrix: {
    row_index: number;
    column_index: number;
    is_correct: boolean;
    id?: number | string;
  }[];
  selectionMode: "single" | "multiple";
  onRowLabelChange: (idx: number, value: string) => void;
  onColumnLabelChange: (idx: number, value: string) => void;
  onCellToggle: (rowIdx: number, colIdx: number) => void;
  onAddRow: () => void;
  onRemoveRow: (idx: number) => void;
  onAddColumn: () => void;
  onRemoveColumn: (idx: number) => void;
  errors?: string[];
  previewOnly?: boolean;
  firstColumnHeader?: string;
  alwaysShowCorrect?: boolean;
  istestpack?: boolean;
  // Tagging
  cellTagSlots?: Record<string, TagSlot[]>;
  setCellTagSlots?: React.Dispatch<React.SetStateAction<Record<string, TagSlot[]>>>;
  // Read-only tags for preview mode (keyed by String(cell.id))
  readOnlyCellTags?: Record<string, ChoiceTag[]>;
}

const TableGridEditor: React.FC<TableGridEditorProps> = ({
  rowLabels,
  columnLabels,
  answerMatrix,
  selectionMode,
  onRowLabelChange,
  onColumnLabelChange,
  onCellToggle,
  onAddRow,
  onRemoveRow,
  onAddColumn,
  onRemoveColumn,
  errors = [],
  previewOnly = false,
  firstColumnHeader,
  alwaysShowCorrect = false,
  istestpack = false,
  cellTagSlots = {},
  setCellTagSlots,
  readOnlyCellTags,
}) => {
  // Helper to get if a cell is correct
  const isCellCorrect = (rowIdx: number, colIdx: number) =>
    answerMatrix.some(
      (a) =>
        a.row_index === rowIdx && a.column_index === colIdx && a.is_correct,
    );

  // The single-select logic is now handled in the parent component's onCellToggle function

  return (
    <div>
      {errors.length > 0 && (
        <div className="mb-2 text-red-600">
          {errors.map((err, i) => (
            <div key={i}>{err}</div>
          ))}
        </div>
      )}
      <div className="w-full overflow-x-auto">
        <table className="min-w-full border border-gray-300 mb-4">
          <thead>
            <tr>
              <th className="border border-gray-300 bg-gray-50 px-3 py-2 font-semibold">
                {firstColumnHeader || ""}
              </th>
              {columnLabels.map((col, colIdx) => (
                <th
                  key={colIdx}
                  className="border border-gray-300 bg-gray-50 px-3 py-2"
                >
                  {previewOnly ? (
                    <span>{col}</span>
                  ) : (
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        value={col}
                        onChange={(e) =>
                          onColumnLabelChange(colIdx, e.target.value)
                        }
                        className="border rounded px-1 py-0.5 w-32"
                      />
                      <button
                        type="button"
                        onClick={() => onRemoveColumn(colIdx)}
                        disabled={columnLabels.length <= 2}
                        className="text-red-500"
                      >
                        ×
                      </button>
                    </div>
                  )}
                </th>
              ))}
              {!previewOnly && (
                <th className="border border-gray-300 bg-gray-50">
                  <button
                    type="button"
                    onClick={onAddColumn}
                    className="text-green-600"
                  >
                    + Col
                  </button>
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {rowLabels.map((row, rowIdx) => (
              <tr key={rowIdx}>
                <td className="border border-gray-300 font-bold px-3 py-2">
                  {previewOnly ? (
                    <span>{row}</span>
                  ) : (
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        value={row}
                        onChange={(e) =>
                          onRowLabelChange(rowIdx, e.target.value)
                        }
                        className="border rounded px-1 py-0.5 w-28"
                      />
                      <button
                        type="button"
                        onClick={() => onRemoveRow(rowIdx)}
                        disabled={rowLabels.length <= 1}
                        className="text-red-500"
                      >
                        ×
                      </button>
                    </div>
                  )}
                </td>
                {columnLabels.map((_, colIdx) => (
                  <td
                    key={colIdx}
                    className="border border-gray-300 text-center"
                  >
                    {selectionMode === "single" ? (
                      <input
                        type="radio"
                        name={`row-${rowIdx}`}
                        checked={
                          alwaysShowCorrect
                            ? isCellCorrect(rowIdx, colIdx)
                            : previewOnly
                              ? false
                              : isCellCorrect(rowIdx, colIdx)
                        }
                        onChange={() =>
                          !previewOnly && onCellToggle(rowIdx, colIdx)
                        }
                        disabled={previewOnly}
                      />
                    ) : (
                      <input
                        type="checkbox"
                        checked={
                          alwaysShowCorrect
                            ? isCellCorrect(rowIdx, colIdx)
                            : previewOnly
                              ? false
                              : isCellCorrect(rowIdx, colIdx)
                        }
                        onChange={() =>
                          !previewOnly && onCellToggle(rowIdx, colIdx)
                        }
                        disabled={previewOnly}
                      />
                    )}

                    {/* Read-only tag display in preview mode */}
                    {previewOnly && readOnlyCellTags && (() => {
                      const matrixCell = answerMatrix.find(a => a.row_index === rowIdx && a.column_index === colIdx);
                      const tags = matrixCell?.id != null ? (readOnlyCellTags[String(matrixCell.id)] || []) : [];
                      return <ChoiceTagPills tags={tags} />;
                    })()}

                    {/* Tagging Dialog */}
                    {!previewOnly && setCellTagSlots && !isCellCorrect(rowIdx, colIdx) && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className={`h-7 px-2 flex items-center gap-1.5 transition-all ml-2 ${(cellTagSlots[`${rowIdx}-${colIdx}`]?.filter(s => s.tag_name.trim()).length || 0) > 0
                                ? "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:border-blue-300 shadow-sm"
                                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                              }`}
                            title="Tag this cell"
                          >
                            <Tags className="h-3 w-3" />
                            <span className="text-[10px] font-medium leading-none">
                              Edit Tags ({cellTagSlots[`${rowIdx}-${colIdx}`]?.filter(s => s.tag_name.trim()).length || 0})
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
                                Tagging Choice: <span className="text-blue-600">{rowLabels[rowIdx]} / {columnLabels[colIdx]}</span>
                              </div>
                              <DialogClose asChild>
                                <button className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400">
                                  <X className="h-5 w-5" />
                                </button>
                              </DialogClose>
                            </DialogTitle>
                          </DialogHeader>
                          <div className="flex-1 overflow-y-auto px-6 pb-6 custom-scrollbar min-h-0 pt-4 text-left">
                            <ChoiceTagEditor
                              choiceType={istestpack ? "test_pack" : "pre_shsat"}
                              localSlots={cellTagSlots[`${rowIdx}-${colIdx}`] || []}
                              onLocalSlotsChange={(newSlots) => {
                                setCellTagSlots(prev => ({
                                  ...prev,
                                  [`${rowIdx}-${colIdx}`]: newSlots
                                }));
                              }}
                            />
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                  </td>
                ))}
                {!previewOnly && (
                  <td className="border border-gray-300 text-center">
                    <button
                      type="button"
                      onClick={() => onRemoveRow(rowIdx)}
                      disabled={rowLabels.length <= 1}
                      className="text-red-500"
                    >
                      ×
                    </button>
                  </td>
                )}
              </tr>
            ))}
            {!previewOnly && (
              <tr>
                <td
                  colSpan={columnLabels.length + 2}
                  className="text-center py-2"
                >
                  <button
                    type="button"
                    onClick={onAddRow}
                    className="text-green-600"
                  >
                    + Row
                  </button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TableGridEditor;
