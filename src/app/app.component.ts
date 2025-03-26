import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CourseService } from './course.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CourseButtonComponent } from './course-button/course-button.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet, 
    FormsModule, 
    CommonModule, 
    CourseButtonComponent, 
    MatProgressSpinnerModule, 
    MatInputModule, 
    MatFormFieldModule, 
    MatSidenavModule, 
    MatListModule, 
    MatToolbarModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  standalone: true
})
export class AppComponent {
  title = 'studyAppNew';
  constructor(public courseService: CourseService) { }
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
