import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyBlogsPage } from './my-blogs-page';

describe('MyBlogsPage', () => {
  let component: MyBlogsPage;
  let fixture: ComponentFixture<MyBlogsPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyBlogsPage],
    }).compileComponents();

    fixture = TestBed.createComponent(MyBlogsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
