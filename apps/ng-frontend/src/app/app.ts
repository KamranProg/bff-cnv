import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './layout/header/header';

@Component({
  imports: [RouterOutlet, Header],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
  host: { class: 'flex flex-col h-full' },
})
export class App {}
