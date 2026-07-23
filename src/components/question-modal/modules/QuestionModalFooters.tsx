// Question Modal Footer Renderers
import React from 'react';
import { DialogFooter } from '../../ui/dialog';
import { Button } from '../../ui/button';
import { FooterRendererProps } from './QuestionModalTypes';

interface QuestionModalFootersProps extends FooterRendererProps {
  // Modal state hooks
  mc: any;
  ma: any;
  tf: any;
  dnd: any;
  blank: any;
  tableGrid: any;
  graphSelector: any;
  raySelector: any;
  hotText: any;
  equationCalculatorState: any;
  // Local state
  equationQuestion: string;
  equationCorrectAnswer: string;
  equationIsValid: boolean;
  rcPassage: string;
  rcStartPage: number | undefined;
  rcEndPage: number | undefined;
  // Handlers
  handleSave: () => void;
}

export const QuestionModalFooters: React.FC<QuestionModalFootersProps> = ({
  questionType,
  shouldEditPassage,
  canSave,
  onClose,
  onSave,
  mc,
  ma,
  tf,
  dnd,
  blank,
  tableGrid,
  graphSelector,
  raySelector,
  hotText,
  equationCalculatorState,
  equationQuestion,
  equationCorrectAnswer,
  equationIsValid,
  rcPassage,
  rcStartPage,
  rcEndPage,
  handleSave,
}) => {
  // Footer Renderers Map
  const footerRenderers: Record<string, JSX.Element | null> = {
    MC: (
      <DialogFooter className="mt-6">
        <Button variant="outline" onClick={mc.handleClose || onClose}>
          Cancel
        </Button>
        <Button onClick={mc.save} disabled={!mc.mcValid || mc.isSaving}>
          {mc.isSaving ? "Saving..." : "Save"}
        </Button>
      </DialogFooter>
    ),
    MA: (
      <DialogFooter className="mt-6">
        <Button variant="outline" onClick={ma.handleClose || onClose}>
          Cancel
        </Button>
        <Button onClick={ma.save} disabled={!ma.maValid || ma.isSaving}>
          {ma.isSaving ? "Saving..." : "Save"}
        </Button>
      </DialogFooter>
    ),
    TF: (
      <DialogFooter className="mt-6">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={tf.save} disabled={!tf.tfValid}>
          Save
        </Button>
      </DialogFooter>
    ),
    BLANK: (
      <DialogFooter className="mt-6">
        <Button variant="outline" onClick={blank.handleClose || onClose}>
          Cancel
        </Button>
        <Button onClick={blank.save} disabled={!blank.blankValid}>
          Save
        </Button>
      </DialogFooter>
    ),
    DND: (
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={dnd.handleClose || onClose}>
          Cancel
        </Button>
        <Button onClick={dnd.save} disabled={!dnd.dndValid || dnd.isSaving}>
          {dnd.isSaving ? "Saving..." : "Save"}
        </Button>
      </div>
    ),
    RAY_SELECTOR: (
      <DialogFooter className="mt-6">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button
          onClick={raySelector.save}
          disabled={!raySelector.raySelectorValid}
        >
          Save
        </Button>
      </DialogFooter>
    ),
    GRAPH_SELECTOR: (
      <DialogFooter className="mt-6">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={graphSelector.save} disabled={!graphSelector.graphSelectorValid}>
          Save
        </Button>
      </DialogFooter>
    ),
    HOT_TEXT: (
      <DialogFooter className="mt-6">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button
          onClick={hotText.save}
          disabled={!hotText.hotTextValid}
        >
          Save
        </Button>
      </DialogFooter>
    ),
    TABLE_GRID: (
      <DialogFooter className="mt-6">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={tableGrid.save} disabled={tableGrid.tgErrors.length > 0}>
          Save
        </Button>
      </DialogFooter>
    ),
    EQUATION_CALCULATOR: (
      <DialogFooter className="mt-6">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button
          onClick={() => {
            /* console.log("🔍 [EQUATION_CALCULATOR Save Button] Clicked:", {
              equationIsValid,
              equationQuestion: equationQuestion?.length,
              equationCorrectAnswer: equationCorrectAnswer?.length,
              questionType
            }); */
            handleSave();
          }}
        >
          Save
        </Button>
      </DialogFooter>
    ),
    RC: (
      <DialogFooter className="mt-6">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button
          disabled={!canSave("RC")}
          onClick={() => {
            /* console.log("🔍 [Save Button] RC save button clicked:", {
              canSave: canSave("RC"),
              shouldEditPassage,
              rcPassage: rcPassage?.length,
              questionType
            }); */
            handleSave();
          }}
        >
          Save Passage
        </Button>
      </DialogFooter>
    ),
    REA: (
      <DialogFooter className="mt-6">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={() => handleSave()} disabled={!canSave("REA")}>
          Save Passage
        </Button>
      </DialogFooter>
    ),
    REB: (
      <DialogFooter className="mt-6">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={() => handleSave()} disabled={!canSave("REB")}>
          Save Passage
        </Button>
      </DialogFooter>
    ),
  };

  const renderFooter = () => {
    // Use the same logic for footer as form rendering
    const footerType = shouldEditPassage ? "RC" : questionType;
    return footerRenderers[footerType];
  };

  return renderFooter();
};
