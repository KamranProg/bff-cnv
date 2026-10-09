import { Component, input } from '@angular/core';

@Component({
  selector: 'app-blog-details-page',
  imports: [],
  templateUrl: './blog-details-page.html',
  styleUrl: './blog-details-page.scss',
})
export class BlogDetailsPage {
  blogId = input.required<string>();
}
