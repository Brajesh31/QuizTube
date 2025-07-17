export interface MCQuestion {
  question: string;
  options: string[];
  correctIndex: number;
}

export interface MCQResponse {
  questions: MCQuestion[];
}