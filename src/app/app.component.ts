import { Component, OnInit, Renderer2 } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatToolbarModule, MatButtonModule, MatIconModule],
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
  dark = (localStorage.getItem('theme') || 'light') === 'dark';

  constructor(private r2: Renderer2) {}

  ngOnInit(): void {
    this.applyTheme();
  }

  toggleTheme(): void {
    this.dark = !this.dark;
    localStorage.setItem('theme', this.dark ? 'dark' : 'light');
    this.applyTheme();
  }

  private applyTheme() {
    // agrega/quita una clase en <body> para tema oscuro
    const body = document.body;
    if (this.dark) {
      this.r2.addClass(body, 'dark-theme');
    } else {
      this.r2.removeClass(body, 'dark-theme');
    }
  }
}
