import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

export interface McqQuestion {
  question: string;
  correctAnswer: string;
  wrongAnswers: string[];
}

export interface UnorderedQuestion {
  question: string;
  correctAnswer: string;
  unorderedAnswers: string[];
  answered?: boolean;
  isCorrect?: boolean;
}

@Component({
  selector: 'app-test',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.css']
})
export class TestComponent implements OnChanges {
  @Input() data: McqQuestion[] = [];
  unorderedQuestions: UnorderedQuestion[] = [];
  score: number = 0;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data']) {
      this.processQuestions();
    }
  }

  processQuestions(): void {
    console.log('Processing questions:', this.data);
    this.unorderedQuestions = this.data.map((question) => {
      const answers = [...question.wrongAnswers, question.correctAnswer];
      return {
        question: question.question,
        correctAnswer: question.correctAnswer,
        unorderedAnswers: this.shuffle(answers),
        answered: false,
        isCorrect: false
      };
    });
  }

  checkAnswer(questionIndex: number, answerIndex: number): void {
    const question = this.unorderedQuestions[questionIndex];
    question.answered = true;
    question.isCorrect = question.unorderedAnswers[answerIndex] === question.correctAnswer;
    if (question.isCorrect) {
      this.score++;
    }
  }

  allQuestionsAnswered(): boolean {
    return this.unorderedQuestions.every(question => question.answered);
  }

  resetTest(): void {
    this.score = 0;
    this.unorderedQuestions.forEach(question => {
      question.answered = false;
      question.isCorrect = false;
    });
  }

  // Fisher-Yates shuffle algorithm
  private shuffle<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}