import { Component, Input, Output, EventEmitter, OnInit, SimpleChanges, ElementRef, OnChanges, Renderer2 } from '@angular/core';
import { v4 as uuidv4 } from 'uuid';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { environment } from '../../environments/environment';
import { Mistral } from '@mistralai/mistralai';
import { CommonModule } from '@angular/common';
import { CourseService } from '../course.service';
import { CourseDetails, McqQuestion } from '../course-details.model';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-pdf-parser',
  templateUrl: './pdf-parser.component.html',
  styleUrls: ['./pdf-parser.component.css'],
  standalone: true,
  imports: [HttpClientModule, FormsModule, CommonModule, MatProgressSpinnerModule]
})
export class PdfParserComponent implements OnInit, OnChanges {
  private apiKey = environment.MISTRAL_API_KEY;
  private client = new Mistral({ apiKey: this.apiKey });
  private uploadedPdf: any;
  public questions: McqQuestion[] = []; // Updated type
  public invalid: boolean = true;
  public loading: boolean = false;

  @Input() id: string = '';
  @Input() color: string = '';
  @Output() idChange = new EventEmitter<string>();

  constructor(private courseService: CourseService, private elementRef: ElementRef, private renderer: Renderer2) {}

  ngOnInit() {
    console.log("Initialized with course ID:", this.id); // Debugging statement
    this.setColorVariable(this.color);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['id']) {
      console.log("Course ID changed to:", this.id); // Debugging statement
    }
    if (changes['color']) {
      this.setColorVariable(this.color);
    }
  }

  setColorVariable(color: string) {
    document.documentElement.style.setProperty('--color', color);
  }

  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      // Disable button while parsing PDF
      this.invalid = true;
      this.loading = true;
      this.parsePdf(file);
      console.log("File change detected, course ID:", this.id); // Debugging statement
    }
  }

  async parsePdf(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('purpose', 'ocr');

    try {
      const response = await this.client.files.upload({
        file: {
          fileName: file.name,
          content: await file.arrayBuffer(),
        },
        purpose: 'ocr',
      });

      this.uploadedPdf = response;
      console.log('Uploaded PDF:', this.uploadedPdf);
      // Enable button after PDF is successfully parsed
      this.invalid = false;
      this.loading = false;
    } catch (error) {
      console.error('Error uploading file:', error);
      // Keep button disabled if error occurs
      this.invalid = true;
      this.loading = false;
    }
  }

  async getChatResponse(): Promise<void> {
    if (!this.uploadedPdf) {
      console.error("No PDF uploaded. Please call parsePdf() first.");
      return;
    }
  
    try {
      const signedUrl = await this.client.files.getSignedUrl({
        fileId: this.uploadedPdf.id,
      });
      this.loading = true; // Set loading to true when starting the request
      const chatResponse = await this.client.chat.complete({
        model: "mistral-small-latest",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Can you generate 10 MCQ based questions on this document? Please format each question exactly as follows:\n\nQ: [question text]\nA: [correct answer text]\nW1: [wrong answer 1 text]\nW2: [wrong answer 2 text]\nW3: [wrong answer 3 text]",
              },
              {
                type: "document_url",
                documentUrl: signedUrl.url,
              },
            ],
          },
        ],
      });
  
      if (chatResponse.choices && chatResponse.choices.length > 0) {
        const responseContent = chatResponse.choices[0].message.content as string;
        this.questions = this.parseQuestions(responseContent);
        this.addQuestionsToCourse(this.questions);
      } else {
        console.error("No choices found in chat response.");
      }
    } catch (error) {
      console.error('Error getting chat response:', error);
    } finally {
      this.loading = false; // Set loading to false when the request is complete
    }
  }

  parseQuestions(responseContent: string): McqQuestion[] { // Updated return type
    const questions: McqQuestion[] = [];
    const lines = responseContent.split('\n');
    let currentQuestion: McqQuestion | null = null;

    lines.forEach(line => {
      //console.log("Processing line:", line); // Debugging statement
      if (line.startsWith('Q:')) {
        if (currentQuestion) {
          questions.push(currentQuestion);
          //console.log("Added question:", currentQuestion); // Debugging statement
        }
        const questionText = line.substring(2).trim();
        currentQuestion = {
          question: questionText,
          correctAnswer: '',
          wrongAnswers: []
        };
        //console.log("New question:", currentQuestion); // Debugging statement
      } else if (line.startsWith('A:')) {
        if (currentQuestion) {
          const answerText = line.substring(2).trim();
          currentQuestion.correctAnswer = answerText;
          //console.log("Added correct answer:", currentQuestion.correctAnswer); // Debugging statement
        }
      } else if (line.startsWith('W1:') || line.startsWith('W2:') || line.startsWith('W3:')) {
        if (currentQuestion) {
          const wrongAnswerText = line.substring(line.indexOf(':') + 1).trim();
          currentQuestion.wrongAnswers.push(wrongAnswerText);
          //console.log("Added wrong answer:", wrongAnswerText); // Debugging statement
        }
      }
    });

    if (currentQuestion) {
      questions.push(currentQuestion);
      //console.log("Added final question:", currentQuestion); // Debugging statement
    }

    //console.log("Final questions array:", questions); // Debugging statement
    return questions;
  }

  async addQuestionsToCourse(questions: McqQuestion[]): Promise<void> {
    if (!questions || questions.length === 0) {
      console.error("No questions to add. Please generate questions first.");
      return;
    }
  
    try {
      console.log("Adding questions to course with ID:", this.id);
      const course = await this.courseService.getCourseById(this.id);
      if (!course) {
        console.error("Course not found with ID:", this.id);
        return;
      }
  
      // Create a deep copy of the course object to make it extensible
      const courseCopy = JSON.parse(JSON.stringify(course));
      
      // Ensure questionSets array exists
      if (!courseCopy.questionSets) {
        courseCopy.questionSets = [];
      }
      
      const questionSetName = `Question Set ${courseCopy.questionSets.length + 1}`;
      
      // Create a new question set with a deep copy of the questions
      const newQuestionSet = {
        id: uuidv4(),
        name: questionSetName,
        questions: JSON.parse(JSON.stringify(questions))
      };
      
      // Add the new question set to the course copy
      courseCopy.questionSets.push(newQuestionSet);
  
      // Update the course with the modified copy
      await this.courseService.updateCourse(courseCopy);
      console.log("Updated course with new question set:", questionSetName);
      
      // Clear questions after adding them
      this.questions = [];
    } catch (error) {
      console.error("Error updating course with questions:", error);
    }
  }

  async addQuestionsToQuestionSet(courseId: string, questions: any[]) {
    try {
      // Get the course
      const course = await this.courseService.getCourseById(courseId);
      if (!course) {
        console.error('Course not found');
        return;
      }
      
      // Create a deep copy of the object to make it extensible
      // This is crucial - RxDB documents are frozen objects
      const courseCopy = JSON.parse(JSON.stringify(course));
      
      // Ensure questionSets array exists
      if (!courseCopy.questionSets) {
        courseCopy.questionSets = [];
      }
      
      // Find or create the "Parsed Questions" set
      let questionSet = courseCopy.questionSets.find((set: any) => set.name === 'Parsed Questions');
      
      if (!questionSet) {
        // Create a new question set
        questionSet = {
          id: uuidv4(),
          name: 'Parsed Questions',
          questions: []
        };
        courseCopy.questionSets.push(questionSet);
      } else if (!questionSet.questions) {
        // Ensure questions array exists
        questionSet.questions = [];
      }
      
      // Add the questions to the question set
      questions.forEach((question: any) => {
        questionSet.questions.push(question);
      });
      
      // Update the course
      await this.courseService.updateCourse(courseCopy);
      console.log('Questions added to course successfully');
    } catch (error) {
      console.error('Error updating course with questions:', error);
    }
  }
}
