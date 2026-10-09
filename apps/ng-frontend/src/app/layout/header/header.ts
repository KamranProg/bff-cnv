import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatToolbar } from '@angular/material/toolbar';
import { HeaderActions } from '../header-actions/header-actions';
import { HeaderLinks } from '../header-links/header-links';

@Component({
  selector: 'app-header',
  imports: [RouterLink, MatToolbar, HeaderActions, HeaderLinks],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {}
