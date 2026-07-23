import { TestPack, TestPackQuestion } from "../types";

const BASE_URL = import.meta.env.VITE_API_URL;

const testPackService = {
  async getAll(showAll: boolean = false): Promise<TestPack[]> {
    const response = await fetch(`${BASE_URL}/api/test-pack/tests?show_all=${showAll}`);
    if (!response.ok) throw new Error("Failed to fetch test packs");
    return response.json();
  },

  async getById(id: number): Promise<TestPack> {
    const response = await fetch(`${BASE_URL}/api/test-pack/tests/${id}`);
    if (!response.ok) throw new Error("Failed to fetch test pack");
    return response.json();
  },

  async create(data: {
    name: string;
    test_description?: string;
    default_test_text?: string;
  }): Promise<TestPack> {
    const response = await fetch(`${BASE_URL}/api/test-pack/tests`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to create test pack");
    return response.json();
  },

  async delete(id: number): Promise<void> {
    const response = await fetch(`${BASE_URL}/api/test-pack/tests/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete test pack");
  },

  async getQuestions(testId: number): Promise<TestPackQuestion[]> {
    const response = await fetch(
      `${BASE_URL}/api/test-pack/tests/${testId}/questions-with-choices`,
    );
    if (!response.ok) throw new Error("Failed to fetch test questions");
    return response.json();
  },

  async addQuestion(
    testId: number,
    questionData: any,
  ): Promise<TestPackQuestion> {
    const response = await fetch(
      `${BASE_URL}/api/test-pack/tests/${testId}/questions`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(questionData),
      },
    );
    if (!response.ok) throw new Error("Failed to add question");
    return response.json();
  },

  async removeQuestion(testId: number, questionId: number): Promise<void> {
    const response = await fetch(
      `${BASE_URL}/api/test-pack/tests/${testId}/questions/${questionId}`,
      {
        method: "DELETE",
      },
    );
    if (!response.ok) throw new Error("Failed to remove question");
  },

  async cloneQuestions(
    sourceTestId: number,
    targetTestId: number,
  ): Promise<any> {
    const response = await fetch(
      `${BASE_URL}/api/test-pack/tests/${targetTestId}/clone`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source_test_id: sourceTestId }),
      },
    );
    if (!response.ok) throw new Error("Failed to clone questions");
    return response.json();
  },

  async toggleQuestionActive(
    questionId: number,
    testId: number,
    isActive: boolean,
  ): Promise<TestPackQuestion> {
    const response = await fetch(
      `${BASE_URL}/api/test-pack/questions/${questionId}/active`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ test_id: testId, is_active: isActive }),
      },
    );
    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        error.detail || "Failed to toggle question active status",
      );
    }
    return response.json();
  },

  async createMCQuestion(questionData: any): Promise<TestPackQuestion> {
    const response = await fetch(`${BASE_URL}/api/test-pack/mc/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(questionData),
    });
    if (!response.ok) throw new Error("Failed to add MC question");
    return response.json();
  },

  async createMAQuestion(questionData: any): Promise<TestPackQuestion> {
    // Ensure type is set
    const payload = {
      ...questionData,
      question_type: "MA",
      question_type_acronym: "MA",
    };
    const response = await fetch(`${BASE_URL}/api/test-pack/ma/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error("Failed to add MA question");
    return response.json();
  },

  // Edit functions for different question types
  async editMCQuestion(
    questionId: number,
    questionData: any,
  ): Promise<TestPackQuestion> {
    const response = await fetch(
      `${BASE_URL}/api/test-pack/mc/edit/${questionId}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(questionData),
      },
    );
    if (!response.ok) throw new Error("Failed to edit MC question");
    return response.json();
  },

  async editMAQuestion(
    questionId: number,
    questionData: any,
  ): Promise<TestPackQuestion> {
    const response = await fetch(
      `${BASE_URL}/api/test-pack/ma/put/${questionId}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(questionData),
      },
    );
    if (!response.ok) throw new Error("Failed to edit MA question");
    return response.json();
  },

  async editTableGridQuestion(
    questionId: number,
    questionData: any,
  ): Promise<any> {
    const response = await fetch(
      `${BASE_URL}/api/test-pack/table-grid/put/${questionId}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(questionData),
      },
    );
    if (!response.ok) throw new Error("Failed to edit Table Grid question");
    return response.json();
  },

  async editGraphSelectorQuestion(
    questionId: number,
    questionData: any,
  ): Promise<any> {
    const response = await fetch(
      `${BASE_URL}/api/test-pack/graph-selector/put/${questionId}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(questionData),
      },
    );
    if (!response.ok) throw new Error("Failed to edit Graph Selector question");
    return response.json();
  },

  async editHotTextQuestion(
    questionId: number,
    questionData: any,
  ): Promise<any> {
    const response = await fetch(
      `${BASE_URL}/api/test-pack/hot-text/update/${questionId}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(questionData),
      },
    );
    if (!response.ok) throw new Error("Failed to edit Hot Text question");
    return response.json();
  },

  // Delete functions
  async deleteMCQuestion(questionId: number): Promise<void> {
    const response = await fetch(
      `${BASE_URL}/api/test-pack/mc/delete/${questionId}`,
      {
        method: "DELETE",
      },
    );
    if (!response.ok) throw new Error("Failed to delete MC question");
  },

  async deleteMAQuestion(questionId: number): Promise<void> {
    const response = await fetch(
      `${BASE_URL}/api/test-pack/ma/delete/${questionId}`,
      {
        method: "DELETE",
      },
    );
    if (!response.ok) throw new Error("Failed to delete MA question");
  },

  async deleteTableGridQuestion(questionId: number): Promise<void> {
    const response = await fetch(
      `${BASE_URL}/api/test-pack/table-grid/delete/${questionId}`,
      {
        method: "DELETE",
      },
    );
    if (!response.ok) throw new Error("Failed to delete Table Grid question");
  },

  async deleteGraphSelectorQuestion(questionId: number): Promise<void> {
    const response = await fetch(
      `${BASE_URL}/api/test-pack/graph-selector/delete/${questionId}`,
      {
        method: "DELETE",
      },
    );
    if (!response.ok)
      throw new Error("Failed to delete Graph Selector question");
  },

  // Create functions for new question types
  async createTableGridQuestion(questionData: any): Promise<any> {
    const response = await fetch(
      `${BASE_URL}/api/test-pack/table-grid/create`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(questionData),
      },
    );
    if (!response.ok) throw new Error("Failed to create Table Grid question");
    return response.json();
  },

  async createGraphSelectorQuestion(questionData: any): Promise<any> {
    const response = await fetch(
      `${BASE_URL}/api/test-pack/graph-selector/create`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(questionData),
      },
    );
    if (!response.ok)
      throw new Error("Failed to create Graph Selector question");
    return response.json();
  },

  // Get individual question functions
  async getMCQuestion(questionId: number): Promise<any> {
    const response = await fetch(
      `${BASE_URL}/api/test-pack/mc/get/${questionId}`,
    );
    if (!response.ok) throw new Error("Failed to get MC question");
    return response.json();
  },

  async getMAQuestion(questionId: number): Promise<any> {
    const response = await fetch(
      `${BASE_URL}/api/test-pack/ma/get/${questionId}`,
    );
    if (!response.ok) throw new Error("Failed to get MA question");
    return response.json();
  },

  async getTableGridQuestion(questionId: number): Promise<any> {
    const response = await fetch(
      `${BASE_URL}/api/test-pack/table-grid/get/${questionId}`,
    );
    if (!response.ok) throw new Error("Failed to get Table Grid question");
    return response.json();
  },

  async getGraphSelectorQuestion(questionId: number): Promise<any> {
    const response = await fetch(
      `${BASE_URL}/api/test-pack/graph-selector/get/${questionId}`,
    );
    if (!response.ok) throw new Error("Failed to get Graph Selector question");
    return response.json();
  },

  // BLANK question methods
  async createBlankQuestion(questionData: any): Promise<any> {
    const endpoint =
      questionData.question_category === "fill_box"
        ? `${BASE_URL}/api/test-pack/blank/fill-box`
        : `${BASE_URL}/api/test-pack/blank/placeholder`;

    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(questionData),
    });
    if (!response.ok) throw new Error("Failed to create BLANK question");
    return response.json();
  },

  async editBlankQuestion(questionId: number, questionData: any): Promise<any> {
    const endpoint =
      questionData.question_category === "fill_box"
        ? `${BASE_URL}/api/test-pack/blank/fill-box/put/${questionId}`
        : `${BASE_URL}/api/test-pack/blank/placeholder/put/${questionId}`;

    const response = await fetch(endpoint, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(questionData),
    });
    if (!response.ok) throw new Error("Failed to edit BLANK question");
    return response.json();
  },

  async getBlankQuestion(questionId: number): Promise<any> {
    const response = await fetch(
      `${BASE_URL}/api/test-pack/blank/get/${questionId}`,
    );
    if (!response.ok) throw new Error("Failed to get BLANK question");
    return response.json();
  },

  async deleteBlankQuestion(questionId: number): Promise<void> {
    const response = await fetch(
      `${BASE_URL}/api/test-pack/blank/delete/${questionId}`,
      {
        method: "DELETE",
      },
    );
    if (!response.ok) throw new Error("Failed to delete BLANK question");
  },

  async getQuestionTypeMap(): Promise<Record<number, string>> {
    const response = await fetch(`${BASE_URL}/api/test-pack/question-types`);
    if (!response.ok) throw new Error("Failed to fetch question type map");
    const data = await response.json();
    // Assume API returns [{id: 40, acronym: 'MC'}, ...]
    const map: Record<number, string> = {};
    for (const row of data) {
      map[row.id] = row.acronym;
    }
    return map;
  },

  async getHotTextQuestion(questionId: number): Promise<any> {
    const response = await fetch(
      `${BASE_URL}/api/test-pack/hot-text/get/${questionId}`,
    );
    if (!response.ok) throw new Error("Failed to get Hot Text question");
    return response.json();
  },

  // Ray Selector methods
  async createRaySelectorQuestion(questionData: any): Promise<any> {
    const response = await fetch(
      `${BASE_URL}/api/test-pack/ray-selector/create`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(questionData),
      },
    );
    if (!response.ok) throw new Error("Failed to create Ray Selector question");
    return response.json();
  },

  async editRaySelectorQuestion(
    questionId: number,
    questionData: any,
  ): Promise<any> {
    const response = await fetch(
      `${BASE_URL}/api/test-pack/ray-selector/update/${questionId}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(questionData),
      },
    );
    if (!response.ok) throw new Error("Failed to edit Ray Selector question");
    return response.json();
  },

  async getRaySelectorQuestion(questionId: number): Promise<any> {
    const response = await fetch(
      `${BASE_URL}/api/test-pack/ray-selector/get/${questionId}`,
    );
    if (!response.ok) throw new Error("Failed to get Ray Selector question");
    return response.json();
  },

  async deleteRaySelectorQuestion(questionId: number): Promise<void> {
    const response = await fetch(
      `${BASE_URL}/api/test-pack/ray-selector/delete/${questionId}`,
      {
        method: "DELETE",
      },
    );
    if (!response.ok) throw new Error("Failed to delete ray selector question");
  },

  async listRaySelectorQuestions(testId: number): Promise<any[]> {
    const response = await fetch(
      `${BASE_URL}/api/test-pack/ray-selector/${testId}`,
    );
    if (!response.ok) throw new Error("Failed to fetch ray selector questions");
    return response.json();
  },

  // Equation Calculator functions
  async createEquationCalculatorQuestion(questionData: any): Promise<any> {
    const response = await fetch(
      `${BASE_URL}/api/test-pack/equation-calculator/create`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(questionData),
      },
    );
    if (!response.ok) throw new Error("Failed to create equation calculator question");
    return response.json();
  },

  async editEquationCalculatorQuestion(
    questionId: number,
    questionData: any,
  ): Promise<any> {
    const response = await fetch(
      `${BASE_URL}/api/test-pack/equation-calculator/update/${questionId}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(questionData),
      },
    );
    if (!response.ok) throw new Error("Failed to edit equation calculator question");
    return response.json();
  },

  async getEquationCalculatorQuestion(questionId: number): Promise<any> {
    const response = await fetch(
      `${BASE_URL}/api/test-pack/equation-calculator/get/${questionId}`,
    );
    if (!response.ok) throw new Error("Failed to fetch equation calculator question");
    return response.json();
  },

  async deleteEquationCalculatorQuestion(questionId: number): Promise<void> {
    const response = await fetch(
      `${BASE_URL}/api/test-pack/equation-calculator/delete/${questionId}`,
      {
        method: "DELETE",
      },
    );
    if (!response.ok) throw new Error("Failed to delete equation calculator question");
  },

  async listEquationCalculatorQuestions(testId: number): Promise<any[]> {
    const response = await fetch(
      `${BASE_URL}/api/test-pack/equation-calculator/all?test_id=${testId}`,
    );
    if (!response.ok) throw new Error("Failed to fetch equation calculator questions");
    return response.json();
  },

  async editPassage(passageId: number, data: any): Promise<any> {
    const response = await fetch(
      `${BASE_URL}/api/test-pack/passages/update/${passageId}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }
    );
    if (!response.ok) throw new Error("Failed to update test pack passage");
    return response.json();
  },

  async toggleTestStatus(
    testId: number,
    field: "is_active" | "is_live",
    value: boolean,
  ): Promise<TestPack> {
    const response = await fetch(`${BASE_URL}/api/test-pack/tests/${testId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ field, value }),
    });
    if (!response.ok) throw new Error("Failed to toggle test status");
    return response.json();
  },
};

export { testPackService };
