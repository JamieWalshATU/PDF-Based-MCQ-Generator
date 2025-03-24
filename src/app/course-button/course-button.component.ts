import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { CourseDetails } from '../course-details.model';
import { Router } from '@angular/router';
import { CourseService } from '../course.service';

@Component({
  selector: 'app-course-button',
  imports: [CommonModule, ],
  templateUrl: './course-button.component.html',
  styleUrl: './course-button.component.css',
  standalone: true
})
export class CourseButtonComponent {
  courses: CourseDetails[] = [];
  constructor(private courseService: CourseService, private router: Router) { } // Inject the course service and router

  ngOnInit() {
    this.courses = this.courseService.getCourseDetails();
    console.log(this.courses); // Log the courses
  }
  
  navigateToPage(courseID: string) {
    this.router.navigate(['/course-page', courseID]); // Navigate to the course page
  }
}

