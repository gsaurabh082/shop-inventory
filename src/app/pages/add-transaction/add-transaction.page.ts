import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GMBTransactionService } from '../../services/gmb-transaction.service';
import { Transaction } from '../../models/inventory.model';

@Component({
  selector: 'app-add-transaction',
  templateUrl: './add-transaction.page.html',
})
export class AddTransactionPage implements OnInit {
  vendorId: string = '';
  amount: number = 0;
  description: string = '';
  notes: string = '';
  type: 'debit' | 'credit' | '' = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private gmbTransactionService: GMBTransactionService
  ) {}

  ngOnInit() {
    this.vendorId = this.route.snapshot.paramMap.get('vendorId') || '';
  }

  async addTransaction() {
    if (this.amount && this.description && this.type) {
      const transaction = new Transaction(
        this.gmbTransactionService.generateId(),
        this.vendorId,
        this.type as 'debit' | 'credit',
        this.amount,
        this.description,
        this.notes
      );
      await this.gmbTransactionService.addTransaction(transaction);
      this.router.navigate(['/vendor', this.vendorId]);
    }
  }
}