import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { HeaderLinks } from './header-links';

describe('HeaderLinks', () => {
  let fixture: ComponentFixture<HeaderLinks>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderLinks],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderLinks);
    fixture.detectChanges();
  });

  it('should render a link per nav entry', () => {
    const links = (fixture.nativeElement as HTMLElement).querySelectorAll('a');
    expect(Array.from(links, (a) => a.getAttribute('href'))).toEqual([
      '/about',
      '/blog',
      '/dashboard',
    ]);
  });
});
