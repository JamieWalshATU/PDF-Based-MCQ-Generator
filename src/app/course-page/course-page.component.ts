import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CourseServiceService } from '../course-service.service';
import { Coursedetails } from '../coursedetails.model';

@Component({
  selector: 'app-course-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="course">
      <h1 [style.color]="course.color">{{course.name}}</h1>
      <p>Course ID: {{courseId}}</p>
      <button (click)="goBack()">Back</button>
    </div>
  `,
  styles: [`
    div {
      padding: 20px;
    }
    h1 {
      font-size: 2em;
    }
  `]
})
export class CoursePageComponent implements OnInit {
  courseId: string | null = null;
  course: Coursedetails | undefined;

  constructor(
    private route: ActivatedRoute,
    private courseService: CourseServiceService
  ) {}

  ngOnInit(): void {
    // Get the route parameter
    this.route.paramMap.subscribe(params => {
      this.courseId = params.get('id');
      if (this.courseId) {
        // Find the course in the service
        this.course = this.courseService.getCourseById(this.courseId);
      }
    });
  }

  goBack(): void {
    window.history.back();
  }
}
