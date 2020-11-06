import { ErrorService } from './../../theme/services/error.service';
import { BoAlertError } from './../../theme/utils/error';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.scss']
})
export class AlertComponent {

  flashMessage: BoAlertError;

  /**
   * flash error message if there is any
   * @param errorService ErrorService
   */
  constructor(private errorService: ErrorService) {
    this.errorService.flashMessage.subscribe((flashMessage: BoAlertError) => this.flashMessage = flashMessage);
  }

}
