import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { CourseServiceService } from '../course-service.service';
import { Coursedetails, QuestionSet, McqQuestion } from '../coursedetails.model';
import { EditDescriptionModalComponent } from '../edit-description-modal/edit-description-modal.component';
import { PdfParserComponent } from '../pdf-parser/pdf-parser.component';

@Component({
  selector: 'app-course-page',
  standalone: true,
  imports: [CommonModule, PdfParserComponent, EditDescriptionModalComponent],
  template: `
    <div *ngIf="course" class="course-container" [style.backgroundColor]="secondaryColor">
      <div class="course-header" >
        <h1 [style.color]="course.color">{{course.name}}</h1>
      </div>
      <div class="course-details" [style.backgroundColor]="course.color">
        <p>Course ID: {{courseId}}</p>
        <p>Course Description: {{course.description}}</p>
        <app-pdf-parser *ngIf="courseId" [id]="courseId" [color]="secondaryColor"></app-pdf-parser>
      </div>
      <div class="course-actions">
        <button (click)="goBack()" [style.backgroundColor]="course.color">Back</button>
        <button (click)="editDesc()" [style.backgroundColor]="course.color">Edit Description</button>
      </div>
      <div *ngIf="course.questionSets && course.questionSets.length > 0" class="question-sets-container" [style.backgroundColor]="secondaryColor">
        <h2>Generated Question Sets</h2>
        <div *ngFor="let questionSet of course.questionSets; let i = index">
          <button (click)="viewQuestions(questionSet)" [style.backgroundColor]="course.color"> 
            {{ questionSet.name }}
          </button>
        </div>
      </div>
      <div *ngIf="selectedQuestionSet" class="selected-question-set" [style.backgroundColor]="secondaryColor">
        <h3>{{ selectedQuestionSet.name }}</h3>
        <ul>
          <li *ngFor="let question of selectedQuestionSet.questions">
            <strong>Q:</strong> {{ question.question }}<br>
            <strong>A:</strong> {{ question.correctAnswer }}<br>
            <strong>W1:</strong> {{ question.wrongAnswers[0] }}<br>
            <strong>W2:</strong> {{ question.wrongAnswers[1] }}<br>
            <strong>W3:</strong> {{ question.wrongAnswers[2] }}<br>
          </li>
        </ul>
      </div>
    </div>
  `,
  styles: [`
    .course-container {
      display: grid;
      grid-template-columns: 1fr;
      grid-template-rows: auto auto auto;
      gap: 10px;
      padding: 20px;
      border-radius: 10px;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;
    }
    .course-container:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
    }
    .course-header {
      grid-row: 1;
      text-align: center;
    }
    .course-details {
      grid-row: 2;
      padding: 15px;
      border-radius: 5px;
      transition: background-color 0.3s ease;
      background-color: #e0f7fa;
    }
    .course-actions {
      grid-row: 3;
      text-align: center;
    }
    h1 {
      font-size: 2.5em;
      margin: 0;
      color: #4a4a4a;
    }
    button {
      padding: 10px 20px;
      font-size: 1em;
      border: none;
      border-radius: 5px;
      color: #4a4a4a;
      cursor: pointer;
      transition: background-color 0.3s ease;
    }
    button:hover {
      opacity: 0.9;
      filter: brightness(105%);
    }
    .question-sets-container {
      margin-top: 15px;
      padding: 15px;
      border-radius: 5px;
      background-color: inherit; /* Inherits the parent's background color */
    }
    .selected-question-set {
      margin-top: 15px;
      padding: 15px;
      border-radius: 5px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    ul {
      list-style-type: none;
      padding: 0;
    }
    li {
      background-color: rgba(255, 255, 255, 0.7);
      margin-bottom: 10px;
      padding: 10px;
      border-radius: 5px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
  `]
})
export class CoursePageComponent implements OnInit {
  courseId: string | null = null;
  course: Coursedetails | undefined;
  secondaryColor: string = '';
  buttonColor: string = '';  // Add new property for button color
  selectedQuestionSet: QuestionSet | null = null;
  
  constructor(
    private route: ActivatedRoute,
    private courseService: CourseServiceService,
    public dialog: MatDialog
  ) {}

  ngOnInit(): void {
    // Get the route parameter
    this.route.paramMap.subscribe(params => {
      // Reset selected question set when route changes
      this.selectedQuestionSet = null;
      
      this.courseId = params.get('id');
      if (this.courseId) {
        // Find the course in the service
        this.courseService.getCourseById(this.courseId)
          .then((course: Coursedetails | undefined) => {
            this.course = course;
            if (this.course && this.course.color) {
              this.secondaryColor = this.calculateSecondaryColor(this.course.color);
              this.buttonColor = this.calculateButtonColor(this.course.color);  // Calculate button color
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

  goBack(): void {
    window.history.back();
  }

  editDesc(): void {
    const dialogRef = this.dialog.open(EditDescriptionModalComponent, {
      width: '300px',
      data: { description: this.course?.description }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result !== undefined && this.course) {
        this.course.description = result;
        this.courseService.updateCourse(this.course);
      }
    });
  }

  calculateSecondaryColor(primaryColor: string): string {
    // Get the primary color components
    let color = primaryColor.replace('#', '');
    let r = parseInt(color.substring(0, 2), 16);
    let g = parseInt(color.substring(2, 4), 16);
    let b = parseInt(color.substring(4, 6), 16);

    // Determine if the primary color is dark or light
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    if (luminance > 0.5) {
      // For lighter colors, make the secondary color much darker
      r = Math.max(0, Math.floor(r * 0.5));
      g = Math.max(0, Math.floor(g * 0.5));
      b = Math.max(0, Math.floor(b * 0.5));
    } else {
      // For darker colors, make the secondary color much lighter
      r = Math.min(255, Math.floor(r * 2));
      g = Math.min(255, Math.floor(g * 2));
      b = Math.min(255, Math.floor(b * 2));
    }
    
    return `#${this.componentToHex(r)}${this.componentToHex(g)}${this.componentToHex(b)}`;
  }

  calculateButtonColor(primaryColor: string): string {
    // Get the primary color components
    let color = primaryColor.replace('#', '');
    let r = parseInt(color.substring(0, 2), 16);
    let g = parseInt(color.substring(2, 4), 16);
    let b = parseInt(color.substring(4, 6), 16);

    // Create a more distinct color for buttons
    r = Math.min(255, (r + 100) % 256);
    g = Math.min(255, (g + 50) % 256);
    b = Math.min(255, (b + 75) % 256);
    
    return `#${this.componentToHex(r)}${this.componentToHex(g)}${this.componentToHex(b)}`;
  }

  componentToHex(c: number): string {
    const hex = c.toString(16);
    return hex.length == 1 ? '0' + hex : hex;
  }

  viewQuestions(questionSet: QuestionSet): void {
    this.selectedQuestionSet = questionSet; // Set the selected question set
  }
}
