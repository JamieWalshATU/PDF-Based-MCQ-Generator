import { Injectable } from '@angular/core';
import { Coursedetails } from './coursedetails.model';

@Injectable({
  providedIn: 'root'
})
export class CourseServiceService {
  constructor() { }

  courseDetails : Coursedetails[] = [];

  createCourse(name : string, color : string) {
    this.courseDetails.push(new Coursedetails(name, color)); // Create a new course and add it to the list.
  }
  getCourseDetails() {
    return this.courseDetails;
  }

  getCourseById(id : string): Coursedetails | undefined {
    return this.courseDetails.find(course => course.id === id);
  }

  updateCourse(course : Coursedetails) {
    const index = this.courseDetails.findIndex(c => c.id === course.id);
    if (index !== -1) {
      this.courseDetails[index] = course;
    }
  }
  
}
