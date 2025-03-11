import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-edit-description-modal',
  template: `
    <h1 mat-dialog-title>Edit Description</h1>
    <div mat-dialog-content>
      <mat-form-field>
        <textarea matInput [(ngModel)]="data.description" placeholder="Course Description"></textarea>
      </mat-form-field>
    </div>
    <div mat-dialog-actions>
      <button mat-button (click)="onCancel()">Cancel</button>
      <button mat-button (click)="onSave()">Save</button>
    </div>
  `,
  styles: [`
    mat-form-field {
      width: 100%;
    }
  `],
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule, FormsModule]
})
export class EditDescriptionModalComponent {
  constructor(
    public dialogRef: MatDialogRef<EditDescriptionModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { description: string }
  ) {}

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    this.dialogRef.close(this.data.description);
  }
}
