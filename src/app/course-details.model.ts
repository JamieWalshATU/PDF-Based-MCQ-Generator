import { v4 as uuidv4 } from 'uuid';

export interface McqQuestion {
  question: string;
  correctAnswer: string;
  wrongAnswers: string[];
} // Define the structure of a multiple choice question

export interface QuestionSet {
  name: string;
  id: string;
  questions: McqQuestion[];
} // Define the structure of a set of questions
export class CourseDetails {
  name: string;
  id: string;
  color: string;
  description: string = '';
  questionSets: QuestionSet[] = []; // Store multiple sets of questions
  questions: any;

  constructor(name: string, color: string) {
    this.name = name;
    this.color = color;
    this.id = uuidv4(); // Generate a unique id for each course
    this.description = `This is a course on ${name}`;
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
