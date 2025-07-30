import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-date-picker',
  templateUrl: './date-picker.component.html'
})
export class DatePickerComponent {
  @Input() selectedDate: string = new Date().toISOString();

  constructor(private modalController: ModalController) {}

  onDateChange(event: any) {
    this.selectedDate = event.detail.value;
  }

  dismiss() {
    this.modalController.dismiss();
  }

  confirm() {
    this.modalController.dismiss(this.selectedDate, 'confirm');
  }
}