import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BlogDetailsPage } from './blog-details-page';

describe('BlogDetailsPage', () => {
  let fixture: ComponentFixture<BlogDetailsPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BlogDetailsPage],
    }).compileComponents();

    fixture = TestBed.createComponent(BlogDetailsPage);
    fixture.componentRef.setInput('blogId', 'hello-world');
    fixture.detectChanges();
  });

  it('should render the blog id', () => {
    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      'hello-world'
    );
  });
});
