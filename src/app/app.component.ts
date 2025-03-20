import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CourseServiceService } from './course-service.service';
import { FormsModule } from '@angular/forms';
import { NgComponentOutlet, NgFor } from '@angular/common';
import { CourseButtonComponent } from './course-button/course-button.component';
import { MatDialogModule } from '@angular/material/dialog';
import { PdfParserComponent } from "./pdf-parser/pdf-parser.component";

@Component({
  selector: 'app-root',
  imports: [FormsModule, CourseButtonComponent, RouterOutlet, MatDialogModule],
  standalone: true,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  constructor(public courseService: CourseServiceService) { }
  title = 'studyapptest';
  courseName: string = '';
  courseColor: string = '';

  generateCourse() {
    if (this.courseName === '' || this.courseColor === '') {
      alert('Please fill in all the fields!');
      return;
    }
    // Check if a course with the same name already exists
    if (this.courseService.getCourseDetails().some((course: { name: string }) => course.name === this.courseName)) {
      alert('Course already exists!');
      return;
    }
    this.courseService.createCourse(this.courseName, this.courseColor);
    console.log(this.courseService.getCourseDetails());
  }
}

