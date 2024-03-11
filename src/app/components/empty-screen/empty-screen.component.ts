import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-empty-screen',
  templateUrl: './empty-screen.component.html',
  styleUrls: ['./empty-screen.component.scss'],
})
export class EmptyScreenComponent implements OnInit {
  @Input() model: any;
  constructor() {}

  ngOnInit() {}
}
