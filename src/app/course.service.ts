import { Injectable } from '@angular/core';
import { CourseDetails } from './course-details.model'; 
@Injectable({
  providedIn: 'root'
})
export class CourseService {
  private courses: CourseDetails[] = [];


  constructor() { }

  createCourse(name: string, color: string) {
    this.courses.push(new CourseDetails(name, color));
  }

  getCourseDetails() {
    return this.courses;
  }

  async getCourseById(id: string): Promise<CourseDetails | undefined> {
    return this.courses.find(course => course.id === id);
  }

  async updateCourse(updatedCourse: CourseDetails): Promise<CourseDetails> {

    const index = this.courses.findIndex(course => course.id === updatedCourse.id);
    if (index !== -1) {
      this.courses[index] = updatedCourse;
      console.log('Updated course:', updatedCourse);
      return updatedCourse;
    }
    throw new Error('Course not found');
  }

}