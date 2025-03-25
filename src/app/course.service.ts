import { Injectable } from '@angular/core';
import { CourseDetails } from './course-details.model';
import { DatabaseService } from './database.service';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CourseService {
  private courses: CourseDetails[] = [];
  private coursesSubject = new BehaviorSubject<CourseDetails[]>([]);
  private dbInitialized = false;

  constructor(private DatabaseService: DatabaseService) {
    this.init();
  }

  // Get courses as a regular array
  getCourseDetails() {
    return this.courses;
  }

  // Get courses as an observable for reactive components
  getCourseDetailsObservable() {
    return this.coursesSubject.asObservable();
  }

  createCourse(name: string, color: string) {
    const newCourse = new CourseDetails(name, color);
    this.courses.push(newCourse);
    
    // Also add to database if available
    if (this.dbInitialized) {
      this.DatabaseService.addCourse(newCourse)
        .then(() => {
          console.log('Course added to database');
          this.coursesSubject.next([...this.courses]);
        })
        .catch(error => console.error('Error adding course to database:', error));
    } else {
      this.coursesSubject.next([...this.courses]);
    }
  }

  async getCourseById(id: string): Promise<CourseDetails | undefined> {
    // Try to get from database first if initialized
    if (this.dbInitialized) {
      try {
        const dbCourse = await this.DatabaseService.getCourseById(id);
        if (dbCourse) {
          // Convert to plain object if it's an RxDB document
          return dbCourse.toJSON ? dbCourse.toJSON() : dbCourse;
        }
      } catch (error) {
        console.error('Error getting course from database:', error);
      }
    }
    
    // Fall back to in-memory array
    return this.courses.find(course => course.id === id);
  }

  async updateCourse(course: CourseDetails): Promise<CourseDetails> {
    try {
      if (!this.dbInitialized) {
        await this.init();
      }
      
      // Create a plain copy of the course to ensure it's a regular object
      const plainCourse = JSON.parse(JSON.stringify(course));
      
      const updatedCourse = await this.DatabaseService.updateCourse(plainCourse);
      
      // Update our local cache
      const index = this.courses.findIndex(c => c.id === course.id);
      if (index !== -1) {
        this.courses[index] = updatedCourse;
      } else {
        this.courses.push(updatedCourse);
      }
      
      // Notify subscribers
      this.coursesSubject.next([...this.courses]);
      
      return updatedCourse;
    } catch (error) {
      console.error('Error updating course:', error);
      throw error;
    }
  }

  async init() {
    try {
      await this.DatabaseService.initDatabase();
      console.log('Database initialized in CourseService');
      
      const courses = await this.DatabaseService.getCourses();
      console.log('Courses loaded in CourseService:', courses.length);
      
      // Debug: Check if courses have question sets
      courses.forEach(course => {
        console.log(`Course ${course.name} has ${course.questionSets ? course.questionSets.length : 0} question sets`);
        if (course.questionSets && course.questionSets.length > 0) {
          console.log('Question sets:', JSON.stringify(course.questionSets, null, 2));
        }
      });
      
      // Make sure to convert RxDocument to plain object if needed
      this.courses = courses.map(course => course.toJSON ? course.toJSON() : course);
      
      this.coursesSubject.next(this.courses);
      this.dbInitialized = true;
      
      return this.courses;
    } catch (error) {
      console.error('Failed to initialize CourseService:', error);
      return this.courses;
    }
  }
}