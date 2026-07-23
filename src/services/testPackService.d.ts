import { TestPack, TestPackQuestion } from "../types";

declare const testPackService: {
  getAll(): Promise<TestPack[]>;
  getById(id: number): Promise<TestPack>;
  create(data: {
    name: string;
    test_description?: string;
    default_test_text?: string;
  }): Promise<TestPack>;
  delete(id: number): Promise<void>;
  getQuestions(testPackId: number): Promise<TestPackQuestion[]>;
  addQuestion(testPackId: number, questionData: any): Promise<TestPackQuestion>;
  removeQuestion(testPackId: number, questionId: number): Promise<void>;
  cloneQuestions(sourceTestId: number, targetTestId: number): Promise<void>;
};

export default testPackService;
