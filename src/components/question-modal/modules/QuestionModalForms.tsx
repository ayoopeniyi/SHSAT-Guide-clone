// Question Modal Form Renderers
import React from 'react';
import { FormRendererProps } from './QuestionModalTypes';
import { DnDSubtype } from '../types';
import { MultipleChoiceForm } from '../question-types/MultipleChoiceForm';
import { MultiAnswerForm } from '../question-types/MultiAnswerForm';
import { TrueFalseForm } from '../question-types/TrueFalseForm';
import { BlankForm } from '../question-types/BlankForm';
import { DragDropForm } from '../question-types/DragDropForm';
import { TableGridForm } from '../question-types/TableGridForm';
import { RaySelectorForm } from '../question-types/RaySelectorForm';
import { GraphSelectorForm } from '../question-types/GraphSelectorForm';
import { RCForm } from '../question-types/RCForm';
import { EquationCalculatorForm } from '../question-types/EquationCalculatorForm';
import { HotTextForm } from '../question-types/HotTextForm';
import { GraphSelectorPoint } from '../../../services/graphSelectorService';

interface QuestionModalFormsProps extends FormRendererProps {
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
  rcPassage: string;
  setRcPassage: (passage: string) => void;
  rcTopicId: number | undefined;
  setRcTopicId: (id: number | undefined) => void;
  rcSubTopicId: number | undefined;
  setRcSubTopicId: (id: number | undefined) => void;
  rcImageUrl: string | undefined;
  setRcImageUrl: (url: string | undefined) => void;
  rcStartPage: number | undefined;
  setRcStartPage: (page: number | undefined) => void;
  rcEndPage: number | undefined;
  setRcEndPage: (page: number | undefined) => void;
  rcDifficulty: number;
  setRcDifficulty: (difficulty: number) => void;
  dndSubtype: DnDSubtype;
  userName: string;
}

export const QuestionModalForms: React.FC<QuestionModalFormsProps> = ({
  questionType,
  shouldEditPassage,
  initialValues,
  istestpack,
  onClose,
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
  rcPassage,
  setRcPassage,
  rcTopicId,
  setRcTopicId,
  rcSubTopicId,
  setRcSubTopicId,
  rcImageUrl,
  setRcImageUrl,
  rcStartPage,
  setRcStartPage,
  rcEndPage,
  setRcEndPage,
  rcDifficulty,
  setRcDifficulty,
  dndSubtype,
  userName,
}) => {
  // Form Renderers Map
  const formRenderers: Record<string, () => JSX.Element> = {
    MC: () => (
      <MultipleChoiceForm
        mcQuestion={mc.mcQuestion}
        setMcQuestion={mc.setMcQuestion}
        mcChoices={mc.mcChoices}
        mcExplanation={mc.mcExplanation}
        setMcExplanation={mc.setMcExplanation}
        mcVariant={mc.mcVariant}
        setMcVariant={mc.setMcVariant}
        addMcChoice={mc.addMcChoice}
        removeMcChoice={mc.removeMcChoice}
        updateMcChoice={mc.updateMcChoice}
        setCorrectChoice={mc.setCorrectChoice}
        questionImageUrl={mc.questionImageUrl}
        onQuestionImageUploaded={mc.setQuestionImageUrl}
        onQuestionImageDeleted={() => mc.setQuestionImageUrl(undefined)}
        questionId={initialValues?.id}
        userName={userName}
        mcDifficulty={mc.mcDifficulty}
        setMcDifficulty={mc.setMcDifficulty}
        isTestPack={!!istestpack}
        // New hierarchy fields - only show for question bank (not test pack)
        showHierarchyFields={!istestpack}
        mcChapter={mc.mcChapter}
        setMcChapter={mc.setMcChapter}
        mcTopic={mc.mcTopic}
        setMcTopic={mc.setMcTopic}
        mcSubTopic={mc.mcSubTopic}
        setMcSubTopic={mc.setMcSubTopic}
        mcQuestionCategory={mc.mcQuestionCategory}
        setMcQuestionCategory={mc.setMcQuestionCategory}
        hideChoices={!!istestpack && (!!initialValues?.id || !!initialValues?.question_id)}
        choiceTagSlots={mc.choiceTagSlots}
        setChoiceTagSlots={mc.setChoiceTagSlots}
      />
    ),
    MA: () => (
      <MultiAnswerForm
        maQuestion={ma.maQuestion}
        setMaQuestion={ma.setMaQuestion}
        maExplanation={ma.maExplanation}
        setMaExplanation={ma.setMaExplanation}
        maChoices={ma.maChoices}
        addMaChoice={ma.addMaChoice}
        removeMaChoice={ma.removeMaChoice}
        updateMaChoice={ma.updateMaChoice}
        questionImageUrl={ma.questionImageUrl}
        onQuestionImageUploaded={ma.setQuestionImageUrl}
        onQuestionImageDeleted={() => ma.setQuestionImageUrl(undefined)}
        questionId={initialValues?.id}
        userName={userName}
        maDifficulty={ma.maDifficulty}
        setMaDifficulty={ma.setMaDifficulty}
        isTestPack={!!istestpack}
        // Hierarchy fields
        maChapter={ma.maChapter}
        setMaChapter={ma.setMaChapter}
        maTopic={ma.maTopic}
        setMaTopic={ma.setMaTopic}
        maSubTopic={ma.maSubTopic}
        setMaSubTopic={ma.setMaSubTopic}
        maQuestionCategory={ma.maQuestionCategory}
        setMaQuestionCategory={ma.setMaQuestionCategory}
        hideChoices={!!istestpack && (!!initialValues?.id || !!initialValues?.question_id)}
        choiceTagSlots={ma.choiceTagSlots}
        setChoiceTagSlots={ma.setChoiceTagSlots}
      />
    ),
    TF: () => (
      <TrueFalseForm
        tfQuestion={tf.tfQuestion}
        setTfQuestion={tf.setTfQuestion}
        tfAnswer={tf.tfAnswer}
        setTfAnswer={tf.setTfAnswer}
        tfExplanation={tf.tfExplanation}
        setTfExplanation={tf.setTfExplanation}
        tfDifficulty={tf.tfDifficulty}
        setTfDifficulty={tf.setTfDifficulty}
        isTestPack={!!istestpack}
        // Hierarchy fields
        tfChapter={tf.tfChapter}
        setTfChapter={tf.setTfChapter}
        tfTopic={tf.tfTopic}
        setTfTopic={tf.setTfTopic}
        tfSubTopic={tf.tfSubTopic}
        setTfSubTopic={tf.setTfSubTopic}
        tfQuestionCategory={tf.tfQuestionCategory}
        setTfQuestionCategory={tf.setTfQuestionCategory}
      />
    ),
    HOT_TEXT: () => (
      <HotTextForm
        question={hotText.question}
        setQuestion={hotText.setQuestion}
        prompt={hotText.prompt}
        setPrompt={hotText.setPrompt}
        passage={hotText.passage}
        setPassage={hotText.setPassage}
        minSelections={hotText.minSelections}
        setMinSelections={hotText.setMinSelections}
        maxSelections={hotText.maxSelections}
        setMaxSelections={hotText.setMaxSelections}
        regions={hotText.regions}
        setRegions={hotText.setRegions}
        difficulty={hotText.difficulty}
        setDifficulty={hotText.setDifficulty}
        onCancel={onClose}
        istestpack={!!istestpack}
        // Hierarchy fields
        hotTextChapter={hotText.hotTextChapter}
        setHotTextChapter={hotText.setHotTextChapter}
        hotTextTopic={hotText.hotTextTopic}
        setHotTextTopic={hotText.setHotTextTopic}
        hotTextSubTopic={hotText.hotTextSubTopic}
        setHotTextSubTopic={hotText.setHotTextSubTopic}
        hotTextQuestionCategory={hotText.hotTextQuestionCategory}
        setHotTextQuestionCategory={hotText.setHotTextQuestionCategory}
        hotTextExplanation={hotText.hotTextExplanation}
        setHotTextExplanation={hotText.setHotTextExplanation}
        regionTagSlots={hotText.regionTagSlots}
        setRegionTagSlots={hotText.setRegionTagSlots}
      />
    ),
    BLANK: () => (
      <BlankForm
        blankQuestion={blank.blankQuestion}
        setBlankQuestion={blank.setBlankQuestion}
        blankExplanation={blank.blankExplanation}
        setBlankExplanation={blank.setBlankExplanation}
        blankCorrectAnswer={blank.blankCorrectAnswer}
        setBlankCorrectAnswer={blank.setBlankCorrectAnswer}
        blankVariant={blank.blankVariant}
        setBlankVariant={blank.setBlankVariant}
        blankDifficulty={blank.blankDifficulty}
        setBlankDifficulty={blank.setBlankDifficulty}
        isTestPack={!!istestpack}
        // Hierarchy fields
        blankChapter={blank.blankChapter}
        setBlankChapter={blank.setBlankChapter}
        blankTopic={blank.blankTopic}
        setBlankTopic={blank.setBlankTopic}
        blankSubTopic={blank.blankSubTopic}
        setBlankSubTopic={blank.setBlankSubTopic}
        blankQuestionCategory={blank.blankQuestionCategory}
        setBlankQuestionCategory={blank.setBlankQuestionCategory}
        choiceTagSlots={blank.choiceTagSlots}
        setChoiceTagSlots={blank.setChoiceTagSlots}
        choiceId={initialValues?.id || initialValues?.question_id}
      />
    ),
    // Map GI and RESP to BLANK form as they are variants of fill-in-the-blank
    GI: () => (
      <BlankForm
        blankQuestion={blank.blankQuestion}
        setBlankQuestion={blank.setBlankQuestion}
        blankExplanation={blank.blankExplanation}
        setBlankExplanation={blank.setBlankExplanation}
        blankCorrectAnswer={blank.blankCorrectAnswer}
        setBlankCorrectAnswer={blank.setBlankCorrectAnswer}
        blankVariant={blank.blankVariant}
        setBlankVariant={blank.setBlankVariant}
        blankDifficulty={blank.blankDifficulty}
        setBlankDifficulty={blank.setBlankDifficulty}
        isTestPack={!!istestpack}
        blankChapter={blank.blankChapter}
        setBlankChapter={blank.setBlankChapter}
        blankTopic={blank.blankTopic}
        setBlankTopic={blank.setBlankTopic}
        blankSubTopic={blank.blankSubTopic}
        setBlankSubTopic={blank.setBlankSubTopic}
        blankQuestionCategory={blank.blankQuestionCategory}
        setBlankQuestionCategory={blank.setBlankQuestionCategory}
        choiceTagSlots={blank.choiceTagSlots}
        setChoiceTagSlots={blank.setChoiceTagSlots}
        choiceId={initialValues?.id || initialValues?.question_id}
      />
    ),
    RESP: () => (
      <BlankForm
        blankQuestion={blank.blankQuestion}
        setBlankQuestion={blank.setBlankQuestion}
        blankExplanation={blank.blankExplanation}
        setBlankExplanation={blank.setBlankExplanation}
        blankCorrectAnswer={blank.blankCorrectAnswer}
        setBlankCorrectAnswer={blank.setBlankCorrectAnswer}
        blankVariant={blank.blankVariant}
        setBlankVariant={blank.setBlankVariant}
        blankDifficulty={blank.blankDifficulty}
        setBlankDifficulty={blank.setBlankDifficulty}
        isTestPack={!!istestpack}
        blankChapter={blank.blankChapter}
        setBlankChapter={blank.setBlankChapter}
        blankTopic={blank.blankTopic}
        setBlankTopic={blank.setBlankTopic}
        blankSubTopic={blank.blankSubTopic}
        setBlankSubTopic={blank.setBlankSubTopic}
        blankQuestionCategory={blank.blankQuestionCategory}
        setBlankQuestionCategory={blank.setBlankQuestionCategory}
        choiceTagSlots={blank.choiceTagSlots}
        setChoiceTagSlots={blank.setChoiceTagSlots}
        choiceId={initialValues?.id || initialValues?.question_id}
      />
    ),
    DND: () => {
      /* console.log("[QuestionModal] Rendering DND form", {
        questionType,
        dndSubtype,
        initialValuesCategory: initialValues?.question_category,
      }); */
      return (
        <DragDropForm
          dndQuestion={dnd.dndQuestion}
          setDndQuestion={dnd.setDndQuestion}
          dndChoices={dnd.dndChoices}
          updateDndChoice={dnd.updateDndChoice}
          removeDndChoice={dnd.removeDndChoice}
          addDndChoice={dnd.addDndChoice}
          dndBuckets={dnd.dndBuckets}
          updateDndBucket={dnd.updateDndBucket}
          addDndBucket={dnd.addDndBucket}
          removeDndBucket={dnd.removeDndBucket}
          dndCorrectAssignments={dnd.dndCorrectAssignments}
          setDndCorrectAssignments={dnd.setDndCorrectAssignments as React.Dispatch<React.SetStateAction<{ [bucketIdx: number]: number[] }>>}
          poolChoices={dnd.poolChoices as number[]}
          setPoolChoices={dnd.setPoolChoices as React.Dispatch<React.SetStateAction<number[]>>}
          previewAssignments={dnd.previewAssignments as { [bucketIdx: number]: number[] }}
          setPreviewAssignments={dnd.setPreviewAssignments as React.Dispatch<React.SetStateAction<{ [bucketIdx: number]: number[] }>>}
          dndExplanation={dnd.dndExplanation}
          setDndExplanation={dnd.setDndExplanation}
          dndSubtype={dnd.dndSubtype}
          dndDifficulty={dnd.dndDifficulty}
          setDndDifficulty={dnd.setDndDifficulty}
          tableColumnHeaders={dnd.tableColumnHeaders}
          setTableColumnHeaders={dnd.setTableColumnHeaders}
          isTestPack={!!istestpack}
          // Hierarchy fields
          dndChapter={dnd.dndChapter}
          setDndChapter={dnd.setDndChapter}
          dndTopic={dnd.dndTopic}
          setDndTopic={dnd.setDndTopic}
          dndSubTopic={dnd.dndSubTopic}
          setDndSubTopic={dnd.setDndSubTopic}
          dndQuestionCategory={dnd.dndQuestionCategory}
          setDndQuestionCategory={dnd.setDndQuestionCategory}
          choiceTagSlots={dnd.choiceTagSlots}
          setChoiceTagSlots={dnd.setChoiceTagSlots}
        />
      );
    },
    TABLE_GRID: () => (
      <TableGridForm
        tgPrompt={tableGrid.tgPrompt}
        setTgPrompt={tableGrid.setTgPrompt}
        tgSelectionMode={tableGrid.tgSelectionMode}
        setTgSelectionMode={tableGrid.setTgSelectionMode}
        tgRowLabels={tableGrid.tgRowLabels}
        tgColumnLabels={tableGrid.tgColumnLabels}
        tgFirstColumnHeader={tableGrid.tgFirstColumnHeader}
        setTgFirstColumnHeader={tableGrid.setTgFirstColumnHeader}
        tgAnswerMatrix={tableGrid.tgAnswerMatrix}
        handleTgRowLabelChange={tableGrid.handleTgRowLabelChange}
        handleTgColumnLabelChange={tableGrid.handleTgColumnLabelChange}
        handleTgCellToggle={tableGrid.handleTgCellToggle}
        handleTgAddRow={tableGrid.handleTgAddRow}
        handleTgRemoveRow={tableGrid.handleTgRemoveRow}
        handleTgAddColumn={tableGrid.handleTgAddColumn}
        handleTgRemoveColumn={tableGrid.handleTgRemoveColumn}
        tgErrors={tableGrid.tgErrors}
        tgServerError={tableGrid.tgServerError}
        handleTableGridSave={tableGrid.save}
        onClose={onClose}
        tgDifficulty={tableGrid.tgDifficulty}
        setTgDifficulty={tableGrid.setTgDifficulty}
        istestpack={istestpack}
        // Hierarchy fields
        tgChapter={tableGrid.tgChapter}
        setTgChapter={tableGrid.setTgChapter}
        tgTopic={tableGrid.tgTopic}
        setTgTopic={tableGrid.setTgTopic}
        tgSubTopic={tableGrid.tgSubTopic}
        setTgSubTopic={tableGrid.setTgSubTopic}
        tgQuestionCategory={tableGrid.tgQuestionCategory}
        setTgQuestionCategory={tableGrid.setTgQuestionCategory}
        tgExplanation={tableGrid.tgExplanation}
        setTgExplanation={tableGrid.setTgExplanation}
        cellTagSlots={tableGrid.cellTagSlots}
        setCellTagSlots={tableGrid.setCellTagSlots}
      />
    ),
    RAY_SELECTOR: () => (
      <RaySelectorForm
        rayPrompt={raySelector.rayPrompt}
        setRayPrompt={raySelector.setRayPrompt}
        numberlineMin={raySelector.numberlineMin}
        setNumberlineMin={raySelector.setNumberlineMin}
        numberlineMax={raySelector.numberlineMax}
        setNumberlineMax={raySelector.setNumberlineMax}
        tickInterval={raySelector.tickInterval}
        setTickInterval={raySelector.setTickInterval}
        rayTypes={raySelector.rayTypes}
        selectedRayType={raySelector.selectedRayType}
        setSelectedRayType={raySelector.setSelectedRayType}
        selectedRayEndpoint={raySelector.selectedRayEndpoint}
        setSelectedRayEndpoint={raySelector.setSelectedRayEndpoint}
        rayType={raySelector.rayType}
        setRayType={raySelector.setRayType}
        rayEndpoint={raySelector.rayEndpoint}
        setRayEndpoint={raySelector.setRayEndpoint}
        rayExplanation={raySelector.rayExplanation}
        setRayExplanation={raySelector.setRayExplanation}
        raySelectorValid={raySelector.raySelectorValid}
        rayDifficulty={raySelector.rayDifficulty}
        setRayDifficulty={raySelector.setRayDifficulty}
        isTestPack={istestpack}
        // Hierarchy fields
        rayChapter={raySelector.rayChapter}
        setRayChapter={raySelector.setRayChapter}
        rayTopic={raySelector.rayTopic}
        setRayTopic={raySelector.setRayTopic}
        raySubTopic={raySelector.raySubTopic}
        setRaySubTopic={raySelector.setRaySubTopic}
        rayQuestionCategory={raySelector.rayQuestionCategory}
        setRayQuestionCategory={raySelector.setRayQuestionCategory}
        rayTagSlots={raySelector.rayTagSlots}
        setRayTagSlots={raySelector.setRayTagSlots}
        choiceId={initialValues?.id || initialValues?.question_id}
      />
    ),
    GRAPH_SELECTOR: () => (
      <GraphSelectorForm
        graphPrompt={graphSelector.graphPrompt}
        setGraphPrompt={graphSelector.setGraphPrompt}
        xMin={graphSelector.xMin}
        setXMin={graphSelector.setXMin}
        xMax={graphSelector.xMax}
        setXMax={graphSelector.setXMax}
        yMin={graphSelector.yMin}
        setYMin={graphSelector.setYMin}
        yMax={graphSelector.yMax}
        setYMax={graphSelector.setYMax}
        gridInterval={graphSelector.gridInterval}
        setGridInterval={graphSelector.setGridInterval}
        maxSelectablePoints={graphSelector.maxSelectablePoints}
        setMaxSelectablePoints={graphSelector.setMaxSelectablePoints}
        correctPoints={graphSelector.correctPoints}
        setCorrectPoints={graphSelector.setCorrectPoints as (points: GraphSelectorPoint[]) => void}
        graphExplanation={graphSelector.graphExplanation}
        setGraphExplanation={graphSelector.setGraphExplanation}
        graphSelectorValid={graphSelector.graphSelectorValid}
        xAxisLabel={graphSelector.xAxisLabel}
        setXAxisLabel={graphSelector.setXAxisLabel}
        yAxisLabel={graphSelector.yAxisLabel}
        setYAxisLabel={graphSelector.setYAxisLabel}
        graphDifficulty={graphSelector.graphDifficulty}
        setGraphDifficulty={graphSelector.setGraphDifficulty}
        showAxes={graphSelector.showAxes}
        setShowAxes={graphSelector.setShowAxes}
        showLabels={graphSelector.showLabels}
        setShowLabels={graphSelector.setShowLabels}
        snapToGrid={graphSelector.snapToGrid}
        setSnapToGrid={graphSelector.setSnapToGrid}
        graphInstruction={graphSelector.graphInstruction}
        setGraphInstruction={graphSelector.setGraphInstruction}
        availablePoints={graphSelector.availablePoints}
        setAvailablePoints={graphSelector.setAvailablePoints as (points: GraphSelectorPoint[]) => void}
        isTestPack={istestpack}
        // Hierarchy fields
        graphChapter={graphSelector.graphChapter}
        setGraphChapter={graphSelector.setGraphChapter}
        graphTopic={graphSelector.graphTopic}
        setGraphTopic={graphSelector.setGraphTopic}
        graphSubTopic={graphSelector.graphSubTopic}
        setGraphSubTopic={graphSelector.setGraphSubTopic}
        graphQuestionCategory={graphSelector.graphQuestionCategory}
        setGraphQuestionCategory={graphSelector.setGraphQuestionCategory}
        pointTagSlots={graphSelector.pointTagSlots}
        setPointTagSlots={graphSelector.setPointTagSlots}
      />
    ),
    RC: () => (
      <RCForm
        rcPassage={rcPassage}
        setRcPassage={setRcPassage}
        rcTopicId={rcTopicId}
        setRcTopicId={setRcTopicId}
        rcSubTopicId={rcSubTopicId}
        setRcSubTopicId={setRcSubTopicId}
        rcImageUrl={rcImageUrl}
        setRcImageUrl={setRcImageUrl}
        rcStartPage={rcStartPage}
        setRcStartPage={setRcStartPage}
        rcEndPage={rcEndPage}
        setRcEndPage={setRcEndPage}
        rcDifficulty={rcDifficulty}
        setRcDifficulty={setRcDifficulty}
      />
    ),
    // Handle ANY question with passage (RC, REA, REB, MC, MA, etc.) - combine all RC variants
    REA: () => (
      <RCForm
        rcPassage={rcPassage}
        setRcPassage={setRcPassage}
        rcTopicId={rcTopicId}
        setRcTopicId={setRcTopicId}
        rcSubTopicId={rcSubTopicId}
        setRcSubTopicId={setRcSubTopicId}
        rcImageUrl={rcImageUrl}
        setRcImageUrl={setRcImageUrl}
        rcStartPage={rcStartPage}
        setRcStartPage={setRcStartPage}
        rcEndPage={rcEndPage}
        setRcEndPage={setRcEndPage}
        rcDifficulty={rcDifficulty}
        setRcDifficulty={setRcDifficulty}
      />
    ),
    REB: () => (
      <RCForm
        rcPassage={rcPassage}
        setRcPassage={setRcPassage}
        rcTopicId={rcTopicId}
        setRcTopicId={setRcTopicId}
        rcSubTopicId={rcSubTopicId}
        setRcSubTopicId={setRcSubTopicId}
        rcImageUrl={rcImageUrl}
        setRcImageUrl={setRcImageUrl}
        rcStartPage={rcStartPage}
        setRcStartPage={setRcStartPage}
        rcEndPage={rcEndPage}
        setRcEndPage={setRcEndPage}
        rcDifficulty={rcDifficulty}
        setRcDifficulty={setRcDifficulty}
      />
    ),
    EQUATION_CALCULATOR: () => {
      /* console.log("🔍 [QuestionModalForms] Rendering EQUATION_CALCULATOR form with:", {
        istestpack,
        equationCalculatorState: {
          eqChapter: equationCalculatorState.eqChapter,
          eqTopic: equationCalculatorState.eqTopic,
          eqSubTopic: equationCalculatorState.eqSubTopic,
          eqQuestionCategory: equationCalculatorState.eqQuestionCategory,
          setEqChapter: !!equationCalculatorState.setEqChapter,
          setEqTopic: !!equationCalculatorState.setEqTopic,
          setEqSubTopic: !!equationCalculatorState.setEqSubTopic,
          setEqQuestionCategory: !!equationCalculatorState.setEqQuestionCategory,

        }
      }); */

      return (
        <EquationCalculatorForm
          question={equationCalculatorState.question}
          setQuestion={equationCalculatorState.setQuestion}
          correctAnswer={equationCalculatorState.correctAnswer}
          setCorrectAnswer={equationCalculatorState.setCorrectAnswer}
          questionImageUrl={equationCalculatorState.questionImageUrl}
          onQuestionImageUploaded={equationCalculatorState.setQuestionImageUrl}
          onQuestionImageDeleted={() => equationCalculatorState.setQuestionImageUrl(undefined)}
          difficulty={equationCalculatorState.difficulty}
          setDifficulty={equationCalculatorState.setDifficulty}
          questionId={istestpack ? initialValues?.question_id : initialValues?.id}
          userName={userName}
          isTestPack={istestpack}
          allowTemporary={istestpack ? !initialValues?.question_id : !initialValues?.id}
          // Hierarchy fields
          eqChapter={equationCalculatorState.eqChapter}
          setEqChapter={equationCalculatorState.setEqChapter}
          eqTopic={equationCalculatorState.eqTopic}
          setEqTopic={equationCalculatorState.setEqTopic}
          eqSubTopic={equationCalculatorState.eqSubTopic}
          setEqSubTopic={equationCalculatorState.setEqSubTopic}
          eqQuestionCategory={equationCalculatorState.eqQuestionCategory}
          setEqQuestionCategory={equationCalculatorState.setEqQuestionCategory}
          explanation={equationCalculatorState.explanation}
          setExplanation={equationCalculatorState.setExplanation}
          eqTagSlots={equationCalculatorState.eqTagSlots}
          setEqTagSlots={equationCalculatorState.setEqTagSlots}
        />
      );
    },
  };

  const renderForm = () => {
    /* console.log(
      "🎨 Rendering form for questionType:",
      questionType,
      "Available renderers:",
      Object.keys(formRenderers),
      "passage_id:",
      initialValues?.passage_id,
      "initialValues.question_type:",
      initialValues?.question_type
    ); */

    // For passage editing, always use RC form
    // For DND questions, always use DND form regardless of passage_id
    // For other questions with passage_id, use RC form to edit passage content
    // For other questions without passage, use the actual questionType
    const renderType = shouldEditPassage ? "RC" : questionType;

    /* console.log("🎨 Final renderType:", renderType); */

    const renderer = formRenderers[renderType];
    if (!renderer) {
      console.error(
        "❌ No renderer found for renderType:",
        renderType,
      );
      return <div>Error: No form renderer for {renderType}</div>;
    }
    /* console.log("✅ Using renderer for:", renderType); */
    return renderer();
  };

  return renderForm();
};
