import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { CourseDetails } from '../course-details.model';
import { Router } from '@angular/router';
import { CourseService } from '../course.service';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-course-button',
  imports: [CommonModule, MatButtonModule],
  templateUrl: './course-button.component.html',
  styleUrl: './course-button.component.css',
  standalone: true
})
export class CourseButtonComponent implements OnInit {
  courses: CourseDetails[] = [];
  
  constructor(private courseService: CourseService, private router: Router) { }

  ngOnInit() {
    // Initial load
    this.courses = this.courseService.getCourseDetails();
    
    // Initialize the database if needed
    this.courseService.init().then(() => {
      // Refresh courses after DB initialization
      this.courses = this.courseService.getCourseDetails();
      console.log('Courses loaded in button component:', this.courses.length);
    });
  }
  
  navigateToPage(courseID: string) {
    this.router.navigate(['/course-page', courseID]);
  }
}

