import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashHeader } from './header';

describe('DashHeader', () => {
  let component: DashHeader;
  let fixture: ComponentFixture<DashHeader>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashHeader]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashHeader);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
