import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CallPage } from './call.page';

describe('CallPage', () => {
  let component: CallPage;
  let fixture: ComponentFixture<CallPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CallPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
