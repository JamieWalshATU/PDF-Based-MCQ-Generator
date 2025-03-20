import { Component, Input, Output, EventEmitter, OnInit, SimpleChanges } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { environment } from '../../environments/environment';
import { Mistral } from '@mistralai/mistralai';
import { CommonModule } from '@angular/common';
import { CourseServiceService } from '../course-service.service';
import { Coursedetails, McqQuestion } from '../coursedetails.model'; // Import the interface
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-pdf-parser',
  templateUrl: './pdf-parser.component.html',
  styleUrls: ['./pdf-parser.component.css'],
  standalone: true,
  imports: [HttpClientModule, FormsModule, CommonModule, MatProgressSpinnerModule]
})
export class PdfParserComponent implements OnInit {
  private apiKey = environment.MISTRAL_API_KEY;
  private client = new Mistral({ apiKey: this.apiKey });
  private uploadedPdf: any;
  public questions: McqQuestion[] = []; // Updated type
  public invalid : boolean = true;
  public loading: boolean = false;
  
  constructor(private courseService: CourseServiceService) {}
  @Input() id: string = '';
  @Input() color: string = '';
  @Output() idChange = new EventEmitter<string>();

  ngOnInit() {
    // Apply the color to the spinner when the component initializes
    this.applySpinnerColor();
  }
  
  // Apply this method when color changes
  ngOnChanges(changes: SimpleChanges) {
    if (changes['color']) {
      this.applySpinnerColor();
    }
  }
  
  applySpinnerColor() {
    if (this.color) {
      // Create a style element to apply the custom color
      const styleEl = document.createElement('style');
      styleEl.innerHTML = `
        app-pdf-parser .mat-spinner circle {
          stroke: ${this.color} !important;
        }
      `;
      document.head.appendChild(styleEl);
    }
  }

  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      // Disable button while parsing PDF
      this.invalid = true;
      this.parsePdf(file);
      console.log(this.id);
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
    } catch (error) {
      console.error('Error uploading file:', error);
      // Keep button disabled if error occurs
      this.invalid = true;
    }
  }

  async APIchatResponse(): Promise<void> {
    if (!this.uploadedPdf) {
      console.error("No PDF uploaded. Please call parsePdf() first.");
      return;
    }

    try {
      const signedUrl = await this.client.files.getSignedUrl({
        fileId: this.uploadedPdf.id,
      });

      const ocrResponse = await this.client.ocr.process({
        model: "mistral-ocr-latest",
        document: {
          type: "document_url",
          documentUrl: signedUrl.url,
        },
      });

      console.log('OCR Response:', ocrResponse);
    } catch (error) {
      console.error('Error getting OCR response:', error);
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
      this.loading = true;
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
        //console.log("Response Content:", responseContent); // Debugging statement
        this.questions = this.parseQuestions(responseContent);
        //console.log("Parsed Questions:", this.questions); // Debugging statement
        this.addQuestionsToCourse(this.questions);
        this.loading = false;
      } else {
        console.error("No choices found in chat response.");
      }
    } catch (error) {
      console.error('Error getting chat response:', error);
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
    if (this.questions.length === 0) {
      console.error("No questions to add. Please call getChatResponse() first.");
      return;
    }

    try {
      const course = await this.courseService.getCourseById(this.id);
      if (!course) {
        console.error("Course not found.");
        return;
      }

      // Add a new question set to the course
      const questionSetName = `Question Set ${course.questionSets.length + 1}`;
      course.addQuestionSet(questionSetName, this.questions);

      // Update the course
      await this.courseService.updateCourse(course);
      console.log("Updated course with questions:", course); // Debugging statement
      
      // Optional: Clear the questions after adding them to prevent duplicates
      this.questions = [];
    } catch (error) {
      console.error("Error updating course with questions:", error);
    }
  }
}
