import { Component, Input, OnInit } from '@angular/core';
import { CourseServiceService } from '../course-service.service';
import { Coursedetails } from '../coursedetails.model';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CoursePageComponent } from '../course-page/course-page.component';

@Component({
  selector: 'app-course-button',
  templateUrl: './course-button.component.html',
  styleUrls: ['./course-button.component.css'],
  imports: [CommonModule],
  standalone: true
})
export class CourseButtonComponent implements OnInit {

  courses: Coursedetails[] = [];
  constructor(private courseService: CourseServiceService, private router: Router) {}

  ngOnInit() {
    this.courses = this.courseService.getCourseDetails();
    console.log(this.courses);
  }
  
  navigateToPage(courseID: string) {
    this.router.navigate(['/course-page', courseID]);
  }
}