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
  templateUrl: './course-page.component.html',
  styleUrls: ['./course-page.component.css']
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
    // Get the course ID from the route
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        // Reset selected question set when switching courses
        this.selectedQuestionSet = null;
        this.showTest = false;
        this.loadCourse(id);
      }
    });
  }

  async loadCourse(id: string) {
    try {
      this.courseId = id; // Set this first
      this.course = await this.courseService.getCourseById(id);
      if (this.course) {
        console.log('Loaded course in course-page:', this.course.name);
        console.log('Question sets in loaded course:', 
          this.course.questionSets ? this.course.questionSets.length : 0);
        if (this.course.questionSets && this.course.questionSets.length > 0) {
          console.log('Question sets details:', JSON.stringify(this.course.questionSets, null, 2));
        }
      } else {
        console.error('Course not found');
      }
    } catch (error) {
      console.error('Error loading course:', error);
    }
  }

  viewQuestions(questionSet: QuestionSet): void {
    this.selectedQuestionSet = questionSet; // Set the selected question set
    this.showTest = false; // Hide the test when viewing new questions
  }

  generateTest(): void {
    this.showTest = true; // Show the test component when Generate Test is clicked
  }

  toggleQuestions(questionSet: any) {
    questionSet.showQuestions = !questionSet.showQuestions;
  }

  refreshQuestionSets(): void {
    // Reload the current course to get the latest question sets
    if (this.courseId) {
      this.loadCourse(this.courseId);
    }
  }
}
