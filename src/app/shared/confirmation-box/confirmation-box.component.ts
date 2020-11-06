import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Component, OnInit, Inject } from '@angular/core';

@Component({
  selector: 'app-confirmation-box',
  templateUrl: './confirmation-box.component.html',
  styleUrls: ['./confirmation-box.component.scss']
})
export class ConfirmationBoxComponent {

  message: string;
  title: string;
  ignoreAvailable: false;
  constructor(public dialogRef: MatDialogRef<ConfirmationBoxComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
    this.message = data.message;
    this.title = data.title;
    this.ignoreAvailable = !!data.ignoreAvailable ? data.ignoreAvailable : this.ignoreAvailable;
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

}
