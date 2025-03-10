import { Component, ViewContainerRef,  ComponentFactoryResolver, Type } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CourseServiceService } from './course-service.service';
import { FormsModule } from '@angular/forms';
import { NgComponentOutlet, NgFor } from '@angular/common';
import { CourseButtonComponent } from './course-button/course-button.component';
import { Routes } from '@angular/router';


@Component({
  selector: 'app-root',
  imports: [FormsModule, NgComponentOutlet, NgFor, CourseButtonComponent, RouterOutlet],
  standalone: true,
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
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
    if (this.courseService.courseDetails.some(course => course.name === this.courseName)) {
      alert('Course already exists!');
      return;
    }
    this.courseService.createCourse(this.courseName, this.courseColor);
    console.log(this.courseService.getCourseDetails());
  }
}

