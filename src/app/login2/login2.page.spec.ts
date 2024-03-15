import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Login2Page } from './login2.page';

describe('Login2Page', () => {
  let component: Login2Page;
  let fixture: ComponentFixture<Login2Page>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(Login2Page);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
