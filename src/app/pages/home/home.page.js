import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html'
})
export class HomePage {
  constructor(router) {
    this.router = router;
  }

  goTo(page) {
    this.router.navigate([`/${page}`]);
  }
}