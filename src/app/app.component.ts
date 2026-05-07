import { Component, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule }     from '@angular/common';
import { MatIconModule }    from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { WebSocketService } from './core/services/websocket.service';
import { JobService }       from './core/services/job.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatIconModule,
    MatTooltipModule,
  ],
  template: `
    <div class="app-shell">

      <nav class="sidebar">
        <div class="sidebar-logo">
          <mat-icon class="logo-icon">lens</mat-icon>
        </div>

        <div class="sidebar-nav">
          <a routerLink="/dashboard"
             routerLinkActive="active"
             matTooltip="Dashboard"
             matTooltipPosition="right"
             class="nav-item">
            <mat-icon>dashboard</mat-icon>
          </a>

          <a routerLink="/jobs"
             routerLinkActive="active"
             matTooltip="Job Tracker"
             matTooltipPosition="right"
             class="nav-item">
            <mat-icon>work</mat-icon>
          </a>
        </div>

        <div class="sidebar-footer">
          <div class="ws-status"
               [class.connected]="wsService.isConnected$ | async"
               matTooltip="Real-time connection status"
               matTooltipPosition="right">
            <span class="status-dot"></span>
          </div>
        </div>
      </nav>

      <main class="main-content">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .app-shell {
      display: grid;
      grid-template-columns: 64px 1fr;
      height: 100vh;
      overflow: hidden;
    }

    .sidebar {
      background: var(--bg-secondary);
      border-right: 1px solid var(--border-color);
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 16px 0;
      z-index: 100;
    }

    .sidebar-logo {
      margin-bottom: 24px;
      .logo-icon {
        color: var(--accent-cyan);
        font-size: 28px;
        width: 28px;
        height: 28px;
      }
    }

    .sidebar-nav {
      display: flex;
      flex-direction: column;
      gap: 4px;
      flex: 1;
    }

    .nav-item {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 44px;
      height: 44px;
      border-radius: var(--radius-md);
      color: var(--text-secondary);
      text-decoration: none;
      transition: all var(--transition);

      mat-icon { font-size: 20px; }

      &:hover {
        background: var(--bg-card);
        color: var(--text-primary);
      }

      &.active {
        background: rgba(56, 189, 248, 0.12);
        color: var(--accent-cyan);
      }
    }

    .sidebar-footer { margin-top: auto; }

    .ws-status {
      width: 44px;
      height: 44px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: default;
    }

    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--text-muted);
      transition: background var(--transition);
    }

    .ws-status.connected .status-dot {
      background: var(--accent-green);
      animation: pulse 2s ease infinite;
    }

    .main-content {
      overflow-y: auto;
      overflow-x: hidden;
      background: var(--bg-primary);
    }
  `],
})
export class AppComponent implements OnInit {
  constructor(
    public wsService: WebSocketService,
    private jobService: JobService,
  ) {}

  ngOnInit(): void {
    this.wsService.connect();
    this.jobService.loadAll();
  }
}
