import { Injectable } from '@angular/core';
import { Coursedetails, McqQuestion } from './coursedetails.model';

@Injectable({
  providedIn: 'root'
})
export class CourseServiceService {
  private courses: Coursedetails[] = [];

  constructor() {
    // Initialize with any default courses if needed
  }

  createCourse(name : string, color : string) {
    this.courses.push(new Coursedetails(name, color)); // Create a new course and add it to the list.
  }

  getCourseDetails() {
    return this.courses;
  }

  // Make these methods async for proper Promise handling
  async getCourseById(id: string): Promise<Coursedetails | undefined> {
    return this.courses.find(course => course.id === id);
  }

  async updateCourse(updatedCourse: Coursedetails): Promise<Coursedetails> {
    const index = this.courses.findIndex(course => course.id === updatedCourse.id);
    if (index !== -1) {
      this.courses[index] = updatedCourse;
      console.log('Updated course:', updatedCourse);
      return updatedCourse;
    }
    throw new Error('Course not found');
  }

  // Other methods as needed
}
