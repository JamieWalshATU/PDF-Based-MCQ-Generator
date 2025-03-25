import { v4 as uuidv4 } from 'uuid';

export interface McqQuestion {
  question: string;
  correctAnswer: string;
  wrongAnswers: string[];
}

export interface QuestionSet {
  id: string;
  name: string;
  questions: McqQuestion[];
}

export class CourseDetails {
  id: string;
  name: string;
  color: string;
  description: string;
  questionSets: QuestionSet[];

  constructor(name: string, color: string) {
    this.id = uuidv4();
    this.name = name;
    this.color = color;
    this.description = '';
    this.questionSets = [];
  }

  addQuestionSet(name: string, questions: McqQuestion[]): void {
    const newSet: QuestionSet = {
      name,
      id: uuidv4(),
      questions,
    };
    this.questionSets.push(newSet);
  }
}
