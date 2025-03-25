import { Component, OnInit } from '@angular/core';
import { CourseService } from '../course.service';
import { CourseDetails, QuestionSet } from '../course-details.model';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NgIf } from '@angular/common';
import { PdfParserComponent } from "../pdf-parser/pdf-parser.component";
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TestComponent } from '../test/test.component';

@Component({
  selector: 'app-course-page',
  standalone: true,
  imports: [CommonModule, NgIf, PdfParserComponent, MatProgressSpinnerModule, TestComponent],
  template: `
    <div *ngIf="course" class="course-container">
      <div class="course-header">
        <h1 [style.color]="course.color">{{ course.name }}</h1>
      </div>
      <div class="course-details">
        <p>Course ID: {{ courseId }}</p>
        <p *ngIf="course?.description">
          Course Description: {{ course.description }}
        </p>
        <app-pdf-parser *ngIf="courseId" [id]="courseId" [color]="course.color"></app-pdf-parser>
      </div>
    </div>
    <div
      *ngIf="course?.questionSets?.length ?? 0 > 0"
      class="question-sets-container"
    >
      <h2>Generated Question Sets</h2>
      <div *ngFor="let questionSet of course?.questionSets; let i = index">
        <button
          (click)="viewQuestions(questionSet)"
          [style.backgroundColor]="course?.color"
        >
          {{ questionSet.name }}
        </button>
      </div>
    </div>
    <div *ngIf="selectedQuestionSet" class="selected-question-set">
      <h3>{{ selectedQuestionSet.name }}</h3>
      <ul>
        <li *ngFor="let question of selectedQuestionSet.questions">
          <strong>Q:</strong> {{ question.question }}<br />
        </li>
      </ul>
      <button (click)="generateTest()" [style.backgroundColor]="course?.color">Generate Test</button>
      <button (click)="selectedQuestionSet = null" [style.backgroundColor]="course?.color">Close</button>
      <app-test *ngIf="showTest" [data]="selectedQuestionSet.questions"></app-test>
    </div>
  `,
})
export class CoursePageComponent implements OnInit {
  course: CourseDetails | undefined;
  courseId: string | null = null;
  courseColor: string | null = null;
  selectedQuestionSet: QuestionSet | null = null;
  loading: boolean = true;
  showTest: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private courseService: CourseService,
    public dialog: MatDialog
  ) {}
  ngOnInit(): void {
    // Get the route parameter
    this.route.paramMap.subscribe((params) => {
      // Reset selected question set when route changes
      this.selectedQuestionSet = null;
      this.showTest = false;

      this.courseId = params.get('id');
      if (this.courseId) {
        // Find the course in the service
        this.courseService
          .getCourseById(this.courseId)
          .then((course: CourseDetails | undefined) => {
            this.course = course;
            if (this.course && this.course.color) {
              this.courseColor = this.course.color;
            } else {
              console.error('Course not found');
              window.history.back();
            }
          })
          .catch((error: Error) => {
            console.error('Error fetching course:', error);
            window.history.back();
          });
      }
    });
  }

  viewQuestions(questionSet: QuestionSet): void {
    this.selectedQuestionSet = questionSet; // Set the selected question set
    this.showTest = false; // Hide the test when viewing new questions
  }

  generateTest(): void {
    this.showTest = true; // Show the test component when Generate Test is clicked
  }
}
