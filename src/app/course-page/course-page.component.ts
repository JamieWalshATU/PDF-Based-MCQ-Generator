import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { CourseServiceService } from '../course-service.service';
import { Coursedetails } from '../coursedetails.model';
import { EditDescriptionModalComponent } from '../edit-description-modal/edit-description-modal.component';

@Component({
  selector: 'app-course-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="course" class="course-container" [style.backgroundColor]="secondaryColor">
      <div class="course-header">
        <h1 [style.color]="'#4a4a4a'">{{course.name}}</h1>
      </div>
      <div class="course-details">
        <p>Course ID: {{courseId}}</p>
        <p>Course Description: {{course.description}}</p>
      </div>
      <div class="course-actions">
        <button (click)="goBack()">Back</button>
        <button (click)="editDesc()">Edit Description</button>
      </div>
    </div>
  `,
  styles: [`
    .course-container {
      display: grid;
      grid-template-columns: 1fr;
      grid-template-rows: auto auto auto;
      gap: 10px;
      padding: 20px;
      border-radius: 10px;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;
      background-color: #f9f9f9;
    }
    .course-container:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
    }
    .course-header {
      grid-row: 1;
      text-align: center;
    }
    .course-details {
      grid-row: 2;
      padding: 15px;
      border-radius: 5px;
      transition: background-color 0.3s ease;
      background-color: #e0f7fa;
    }
    .course-actions {
      grid-row: 3;
      text-align: center;
    }
    h1 {
      font-size: 2.5em;
      margin: 0;
      color: #4a4a4a;
    }
    button {
      padding: 10px 20px;
      font-size: 1em;
      border: none;
      border-radius: 5px;
      background-color: #ffccbc;
      color: #4a4a4a;
      cursor: pointer;
      transition: background-color 0.3s ease;
    }
    button:hover {
      background-color: #ffab91;
    }
  `]
})
export class CoursePageComponent implements OnInit {
  courseId: string | null = null;
  course: Coursedetails | undefined;
  secondaryColor: string = '';

  constructor(
    private route: ActivatedRoute,
    private courseService: CourseServiceService,
    public dialog: MatDialog
  ) {}

  ngOnInit(): void {
    // Get the route parameter
    this.route.paramMap.subscribe(params => {
      this.courseId = params.get('id');
      if (this.courseId) {
        // Find the course in the service
        this.course = this.courseService.getCourseById(this.courseId);
        if (this.course) {
          this.secondaryColor = this.calculateSecondaryColor(this.course.color);
        }
      }
    });
  }

  goBack(): void {
    window.history.back();
  }

  editDesc(): void {
    const dialogRef = this.dialog.open(EditDescriptionModalComponent, {
      width: '300px',
      data: { description: this.course?.description }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result !== undefined && this.course) {
        this.course.description = result;
        this.courseService.updateCourse(this.course);
      }
    });
  }

  calculateSecondaryColor(primaryColor: string): string {
    // Simple formula to lighten the primary color
    let color = primaryColor.replace('#', '');
    let r = parseInt(color.substring(0, 2), 16);
    let g = parseInt(color.substring(2, 4), 16);
    let b = parseInt(color.substring(4, 6), 16);

    // Lighten the color by 20%
    r = Math.min(255, Math.floor(r * 1.2));
    g = Math.min(255, Math.floor(g * 1.2));
    b = Math.min(255, Math.floor(b * 1.2));

    return `#${this.componentToHex(r)}${this.componentToHex(g)}${this.componentToHex(b)}`;
  }

  componentToHex(c: number): string {
    const hex = c.toString(16);
    return hex.length == 1 ? '0' + hex : hex;
  }
}
