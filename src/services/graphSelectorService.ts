import { api } from "./api";

// Types for Graph Selector question and point (simplified, adjust as needed)
export interface GraphSelectorPoint {
  x: number;
  y: number;
  is_correct: boolean;
  point_label?: string;
}

export interface GraphSelectorQuestionPayload {
  question: string;
  x_min: number;
  x_max: number;
  y_min: number;
  y_max: number;
  max_selectable_points?: number;
  graph_instruction?: string;
  graph_type?: string;
  show_axes?: boolean;
  show_labels?: boolean;
  snap_to_grid?: boolean;
  grid_interval?: number;
  x_axis_label?: string;
  y_axis_label?: string;
  points: GraphSelectorPoint[];
  test_id?: number; // Only for test pack
  difficulty: number;
  question_number?: number;
  is_active?: boolean;
  created_by?: string;
  last_edited_by?: string;
}

export interface GraphSelectorQuestionResponse
  extends GraphSelectorQuestionPayload {
  question_id: number;
  points: (GraphSelectorPoint & { id: number; question_id: number })[];
  created_at?: string;
  updated_at?: string;
}

export type GraphSelectorMode = "test_pack" | "question_bank";

const getBasePath = (mode: GraphSelectorMode) =>
  mode === "test_pack" ? "/test-pack-graph-selector" : "/graph-selector";

export const graphSelectorService = {
  create: async (
    data: GraphSelectorQuestionPayload,
    mode: GraphSelectorMode,
  ) => {
    const path = `${getBasePath(mode)}/create`;
    const response = await api.post<GraphSelectorQuestionResponse>(path, data);
    return response.data;
  },
  get: async (questionId: number, mode: GraphSelectorMode) => {
    const path =
      mode === "test_pack"
        ? `/test-pack-graph-selector/get/${questionId}`
        : `/graph-selector/get-details/${questionId}`;
    const response = await api.get<GraphSelectorQuestionResponse>(path);
    return response.data;
  },
  update: async (
    questionId: number,
    data: GraphSelectorQuestionPayload,
    mode: GraphSelectorMode,
  ) => {
    const path =
      mode === "test_pack"
        ? `/test-pack-graph-selector/put/${questionId}`
        : `/graph-selector/update/${questionId}`;
    // PATCH for test_pack, PUT for question_bank
    const method = mode === "test_pack" ? api.patch : api.put;
    const response = await method<GraphSelectorQuestionResponse>(path, data);
    return response.data;
  },
  delete: async (questionId: number, mode: GraphSelectorMode) => {
    const path = `${getBasePath(mode)}/delete/${questionId}`;
    const response = await api.delete(path);
    return response.data;
  },
  list: async (
    mode: GraphSelectorMode,
    testId?: number,
    limit = 50,
    offset = 0,
  ) => {
    if (mode === "test_pack") {
      if (!testId) throw new Error("testId is required for test_pack mode");
      const path = `/test-pack-graph-selector/get/${testId}`;
      const response = await api.get<GraphSelectorQuestionResponse[]>(path);
      return response.data;
    } else {
      const path = `/graph-selector/list`;
      const response = await api.get<{
        questions: GraphSelectorQuestionResponse[];
        count: number;
      }>(path, {
        params: { limit, offset },
      });
      return response.data;
    }
  },
};

export default graphSelectorService;
