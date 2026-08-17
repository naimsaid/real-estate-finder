import { Component, ViewEncapsulation } from '@angular/core';
import { HomePage } from './pages/home/home.page';

@Component({
  selector: 'app-root',
  imports: [HomePage],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  encapsulation: ViewEncapsulation.None,
})
export class App {}
