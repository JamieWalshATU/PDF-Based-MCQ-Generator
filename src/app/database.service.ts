import { Injectable } from '@angular/core';
import { createRxDatabase, RxCollection, RxDatabase, addRxPlugin } from 'rxdb/plugins/core';
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie';
import { CourseDetails } from './course-details.model';
import { v4 as uuidv4 } from 'uuid';
import { RxDBDevModePlugin } from 'rxdb/plugins/dev-mode';
import { getRxStorageMemory } from 'rxdb/plugins/storage-memory';
import { wrappedValidateAjvStorage } from 'rxdb/plugins/validate-ajv';

// Define the McqQuestion schema
const mcqQuestionSchema = {
  title: 'mcq question schema',
  version: 0,
  description: 'describes a multiple choice question',
  type: 'object',
  properties: {
    question: {
      type: 'string'
    },
    correctAnswer: {
      type: 'string'
    },
    wrongAnswers: {
      type: 'array',
      items: {
        type: 'string'
      }
    }
  },
  required: ['question', 'correctAnswer', 'wrongAnswers']
};

// Define the QuestionSet schema
const questionSetSchema = {
  title: 'question set schema',
  version: 0,
  description: 'describes a set of questions',
  primaryKey: 'id',  
  type: 'object',
  properties: {
    id: {
      type: 'string',
      maxLength: 36  // Add this for UUID length
    },
    name: {
      type: 'string'
    },
    questions: {
      type: 'array',
      items: mcqQuestionSchema
    }
  },
  required: ['id', 'name', 'questions']
};

// Define the CourseDetails schema
const courseDetailsSchema = {
  title: 'course details schema',
  version: 0,
  description: 'describes a course with its details and question sets',
  primaryKey: 'id',  
  type: 'object',
  properties: {
    id: {
      type: 'string',
      maxLength: 36  // Add maxLength for the primary key
    },
    name: {
      type: 'string'
    },
    color: {
      type: 'string'
    },
    description: {
      type: 'string'
    },
    questionSets: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            maxLength: 36  // Add maxLength here too
          },
          name: {
            type: 'string'
          },
          questions: {
            type: 'array',
            items: mcqQuestionSchema
          }
        },
        required: ['id', 'name']
      }
    }
  },
  required: ['id', 'name', 'color']
};

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  private db: RxDatabase | null = null;
  private isInitializing = false;
  private initPromise: Promise<void> | null = null;

  constructor() { }

  async initDatabase() {
    // If already initialized, return immediately
    if (this.db) {
      return;
    }

    // If already initializing, wait for that to complete
    if (this.isInitializing && this.initPromise) {
      return this.initPromise;
    }

    // Start initialization
    this.isInitializing = true;
    
    // Create a promise to track initialization
    this.initPromise = new Promise<void>(async (resolve, reject) => {
      try {
        // Add the required plugins
        addRxPlugin(RxDBDevModePlugin);

        // Create the storage with validator
        const storage = wrappedValidateAjvStorage({
          storage: getRxStorageDexie()
        });

        // Create the database
        this.db = await createRxDatabase({
          name: 'studytrackerdb',
          storage: storage,
          multiInstance: true,
          eventReduce: true,
          ignoreDuplicate: true
        });

        await this.db.addCollections({
          courseDetails: {
            schema: courseDetailsSchema
          },
          questionSet: {
            schema: questionSetSchema
          }
        });
        
        console.log('RxDB Database & Collection Ready:', this.db);
        this.isInitializing = false;
        resolve();
      } catch (error) {
        console.error('Database initialization error:', error);
        this.isInitializing = false;
        this.db = null;
        reject(error);
      }
    });

    return this.initPromise;
  }

  async addCourse(course: CourseDetails) {
    try {
      await this.ensureDbInitialized();
      
      if (!this.db || !this.db.collections || !this.db.collections['courseDetails']) {
        throw new Error('Database or collection not available');
      }
      
      await this.db.collections['courseDetails'].insert(course);
      return course;
    } catch (error) {
      console.error('Error adding course:', error);
      throw error;
    }
  }

  async getCourses() {
    try {
      await this.ensureDbInitialized();
      
      if (!this.db || !this.db.collections || !this.db.collections['courseDetails']) {
        return [];
      }
      
      const results = await this.db.collections['courseDetails'].find().exec();
      return results || [];
    } catch (error) {
      console.error('Error getting courses:', error);
      return [];
    }
  }

  async getCourseById(id: string) {
    try {
      await this.ensureDbInitialized();
       
      if (!this.db || !this.db.collections) {
        return null;
      }
      
      const courseCollection = this.db.collections['courseDetails'];
      if (!courseCollection) {
        return null;
      }
      
      // Find the document by ID - this returns the actual RxDocument
      return await courseCollection.findOne(id).exec();
    } catch (error) {
      console.error('Error getting course by ID:', error);
      return null;
    }
  }

  async updateCourse(updatedCourse: CourseDetails) {
    try {
      await this.ensureDbInitialized();
       
      if (!this.db || !this.db.collections) {
        throw new Error('Database not initialized properly');
      }
      
      const courseCollection = this.db.collections['courseDetails'];
      if (!courseCollection) {
        throw new Error('CourseDetails collection not available');
      }
      
      // Find the document by ID
      const id = updatedCourse.id;
      const rxDocument = await courseCollection.findOne(id).exec();
      
      if (!rxDocument) {
        // If document doesn't exist, insert it
        await courseCollection.upsert(updatedCourse);
        return updatedCourse;
      } else {
        // If document exists, use patch which is more reliable than atomicUpdate
        await rxDocument.patch(updatedCourse);
        return updatedCourse;
      }
    } catch (error) {
      console.error('Error updating course:', error);
      throw error;
    }
  }

  // Helper method to ensure DB is initialized
  private async ensureDbInitialized() {
    if (!this.db) {
      await this.initDatabase();
    }
  }

  // Add this to your DatabaseService class
  async testDatabase() {
    try {
      await this.initDatabase();
      console.log('Database initialized successfully');
      
      // Try to access collections
      if (!this.db || !this.db.collections) {
        console.error('Database or collections not available');
        return false;
      }
      
      console.log('Available collections:', Object.keys(this.db.collections));
      
      // Test courseDetails collection
      const courseCollection = this.db.collections['courseDetails'];
      if (!courseCollection) {
        console.error('courseDetails collection not found');
        return false;
      }
      
      // Try a simple query
      const count = await courseCollection.count().exec();
      console.log('Number of courses in database:', count);
      
      return true;
    } catch (error) {
      console.error('Database test failed:', error);
      return false;
    }
  }
}