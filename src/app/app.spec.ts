import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Component } from '@angular/core';
import { By } from '@angular/platform-browser';
import { App } from './app';
import { Navbar } from './components/navbar/navbar';

@Component({
  selector: 'app-navbar',
  standalone: true,
  template: '<nav>Mock Navbar</nav>'
})
class MockNavbarComponent {}

describe('Feature: Root Application Component', () => {
  let fixture: ComponentFixture<App>;
  let component: App;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter([])
      ]
    })
    .overrideComponent(App, {
      remove: { imports: [Navbar] },
      add: { imports: [MockNavbarComponent] }
    })
    .compileComponents();

    fixture = TestBed.createComponent(App);
    component = fixture.componentInstance;
  });

  describe('Scenario: Component Instantiation and Core Layout Rendering', () => {
    it('should instantiate the root application component successfully', () => {
      expect(component).toBeTruthy();
    });

    it('should render the navigation bar element', () => {
      fixture.detectChanges();
      const navbarElement = fixture.debugElement.query(By.css('app-navbar'));
      expect(navbarElement).not.toBeNull();
    });

    it('should render the router outlet directive for routing navigation', () => {
      fixture.detectChanges();
      const routerOutletElement = fixture.debugElement.query(By.css('router-outlet'));
      expect(routerOutletElement).not.toBeNull();
    });
  });
});