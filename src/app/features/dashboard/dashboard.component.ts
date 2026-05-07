import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule }     from '@angular/common';
import { MatIconModule }    from '@angular/material/icon';
import { NgxEchartsModule } from 'ngx-echarts';
import { EChartsOption }    from 'echarts';
import { Subject, combineLatest } from 'rxjs';
import { takeUntil }              from 'rxjs/operators';
import { JobService }        from '../../core/services/job.service';
import { WebSocketService }  from '../../core/services/websocket.service';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card.component';
import { JOB_STATUS_CONFIG } from '../../core/models/job.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    NgxEchartsModule,
    StatCardComponent,
  ],
  template: `
    <div class="dashboard-page">

      <header class="page-header">
        <div>
          <h1 class="page-title">
            <span class="title-prism">◈</span> Dashboard
          </h1>
          <p class="page-subtitle">Your job search at a glance</p>
        </div>

        <div class="market-ticker" *ngIf="latestPulse">
          <span class="ticker-label">Live Market</span>
          <span class="ticker-sector">{{ latestPulse.sector }}</span>
          <span class="ticker-value text-cyan">{{ latestPulse.newPostings }} new roles</span>
          <span class="ticker-dot animate-pulse">●</span>
        </div>
      </header>

      <section class="stats-grid">
        <app-stat-card
          label="Total Applications"
          [value]="stats.total"
          icon="send"
          iconColor="var(--accent-cyan)"
          iconBg="rgba(56,189,248,0.12)">
        </app-stat-card>

        <app-stat-card
          label="Response Rate"
          [value]="stats.responseRate"
          suffix="%"
          icon="reply"
          iconColor="var(--accent-green)"
          iconBg="rgba(63,185,80,0.12)">
        </app-stat-card>

        <app-stat-card
          label="Active Interviews"
          [value]="stats.interviews"
          icon="groups"
          iconColor="var(--accent-amber)"
          iconBg="rgba(210,153,34,0.12)">
        </app-stat-card>

        <app-stat-card
          label="Avg. Days to Response"
          [value]="stats.avgDays"
          suffix=" days"
          icon="schedule"
          iconColor="var(--accent-purple)"
          iconBg="rgba(163,113,247,0.12)">
        </app-stat-card>
      </section>

      <section class="charts-grid">
        <div class="chart-card card">
          <div class="chart-header">
            <h2 class="chart-title">Application Pipeline</h2>
            <span class="chart-subtitle">Jobs by stage</span>
          </div>
          <div echarts
               [options]="pipelineChartOptions"
               [initOpts]="{ renderer: 'svg' }"
               class="chart-body">
          </div>
        </div>

        <div class="chart-card card">
          <div class="chart-header">
            <h2 class="chart-title">Applications Over Time</h2>
            <span class="chart-subtitle">Weekly volume</span>
          </div>
          <div echarts
               [options]="trendChartOptions"
               [initOpts]="{ renderer: 'svg' }"
               class="chart-body">
          </div>
        </div>
      </section>

      <section class="bottom-grid">
        <div class="chart-card card">
          <div class="chart-header">
            <h2 class="chart-title">Application Sources</h2>
          </div>
          <div echarts
               [options]="sourceChartOptions"
               [initOpts]="{ renderer: 'svg' }"
               class="chart-body">
          </div>
        </div>

        <div class="card live-feed">
          <div class="chart-header">
            <h2 class="chart-title">Live Market Feed</h2>
            <span class="ticker-dot animate-pulse text-green" style="font-size:10px">● LIVE</span>
          </div>
          <div class="feed-list">
            <div *ngFor="let event of liveFeed" class="feed-item animate-fade-in">
              <div class="feed-sector">{{ event.sector }}</div>
              <div class="feed-details">
                <span class="text-cyan">{{ event.newPostings }} new roles</span>
                <span class="text-secondary">·</span>
                <span class="text-secondary">\${{ event.avgSalaryK }}k avg</span>
                <span class="text-secondary">·</span>
                <span class="text-muted">{{ event.competitionRatio }}x competition</span>
              </div>
            </div>
            <div *ngIf="liveFeed.length === 0" class="feed-empty">
              <span class="animate-pulse text-muted">Waiting for live data...</span>
            </div>
          </div>
        </div>
      </section>

    </div>
  `,
  styles: [`
    .dashboard-page {
      padding: 32px;
      display: flex;
      flex-direction: column;
      gap: 24px;
      max-width: 1400px;
    }

    .page-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 16px;
    }

    .page-title {
      font-size: 24px;
      font-weight: 700;
      color: var(--text-primary);
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .title-prism    { color: var(--accent-cyan); }
    .page-subtitle  { font-size: 13px; color: var(--text-secondary); margin-top: 4px; }

    .market-ticker {
      display: flex;
      align-items: center;
      gap: 10px;
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-lg);
      padding: 8px 16px;
      font-size: 13px;
    }

    .ticker-label  { color: var(--text-muted); font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; }
    .ticker-sector { color: var(--text-primary); font-weight: 600; }
    .ticker-dot    { color: var(--accent-green); font-size: 8px; }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
    }

    .charts-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .bottom-grid {
      display: grid;
      grid-template-columns: 1fr 2fr;
      gap: 16px;
    }

    .chart-card    { padding: 20px; }

    .chart-header {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      margin-bottom: 16px;
    }

    .chart-title   { font-size: 15px; font-weight: 600; }
    .chart-subtitle { font-size: 12px; color: var(--text-muted); }
    .chart-body    { height: 240px; }

    .live-feed { padding: 20px; }

    .feed-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
      max-height: 240px;
      overflow-y: auto;
    }

    .feed-item {
      padding: 10px 14px;
      background: var(--bg-secondary);
      border-radius: var(--radius-sm);
      border: 1px solid var(--border-color);
    }

    .feed-sector  { font-weight: 600; font-size: 13px; margin-bottom: 4px; }
    .feed-details { display: flex; align-items: center; gap: 8px; font-size: 12px; }
    .feed-empty   { text-align: center; padding: 40px; }
  `],
})
export class DashboardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  pipelineChartOptions: EChartsOption = {};
  trendChartOptions:    EChartsOption = {};
  sourceChartOptions:   EChartsOption = {};

  stats = { total: 0, responseRate: 0, interviews: 0, avgDays: 0 };

  liveFeed: { sector: string; newPostings: number; avgSalaryK: number; competitionRatio: number }[] = [];
  latestPulse: typeof this.liveFeed[0] | null = null;

  constructor(
    private jobService: JobService,
    private wsService: WebSocketService,
  ) {}

  ngOnInit(): void {
    this.loadStats();
    this.subscribeToLiveFeed();
  }

  private loadStats(): void {
    combineLatest([
      this.jobService.getTotalJobs(),
      this.jobService.getResponseRate(),
      this.jobService.getAvgDaysToResponse(),
      this.jobService.getJobsByStatus(),
      this.jobService.getApplicationsPerWeek(),
      this.jobService.getAllJobs(),
    ])
    .pipe(takeUntil(this.destroy$))
    .subscribe(([total, responseRate, avgDays, byStatus, perWeek, allJobs]) => {
      this.stats = {
        total,
        responseRate,
        avgDays,
        interviews: byStatus['interview'] || 0,
      };
      this.buildPipelineChart(byStatus);
      this.buildTrendChart(perWeek);
      this.buildSourceChart(allJobs);
    });
  }

  private buildPipelineChart(byStatus: Record<string, number>): void {
    const statuses = Object.keys(JOB_STATUS_CONFIG) as (keyof typeof JOB_STATUS_CONFIG)[];
    this.pipelineChartOptions = {
      tooltip: {
        trigger: 'axis',
        formatter: (params: unknown) => {
          const p = (params as { name: string; value: number }[])[0];
          return `<strong>${p.name}</strong><br/>${p.value} applications`;
        },
        backgroundColor: 'var(--bg-card)',
        borderColor: 'var(--border-color)',
        textStyle: { color: 'var(--text-primary)' },
      },
      grid: { left: 16, right: 16, top: 8, bottom: 24, containLabel: true },
      xAxis: {
        type: 'category',
        data: statuses.map(s => JOB_STATUS_CONFIG[s].label),
        axisLabel: { color: 'var(--text-muted)', fontSize: 11 },
        axisLine: { lineStyle: { color: 'var(--border-color)' } },
      },
      yAxis: {
        type: 'value',
        axisLabel: { color: 'var(--text-muted)' },
        splitLine: { lineStyle: { color: 'var(--border-color)', type: 'dashed' } },
      },
      series: [{
        type: 'bar',
        data: statuses.map(s => ({
          value: byStatus[s] || 0,
          itemStyle: {
            color: JOB_STATUS_CONFIG[s].color,
            borderRadius: [4, 4, 0, 0],
          },
        })),
        barMaxWidth: 48,
      }],
    };
  }

  private buildTrendChart(perWeek: { week: string; count: number }[]): void {
    this.trendChartOptions = {
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'var(--bg-card)',
        borderColor: 'var(--border-color)',
        textStyle: { color: 'var(--text-primary)' },
      },
      grid: { left: 16, right: 16, top: 8, bottom: 24, containLabel: true },
      xAxis: {
        type: 'category',
        data: perWeek.map(d => d.week),
        axisLabel: { color: 'var(--text-muted)', fontSize: 11 },
        axisLine: { lineStyle: { color: 'var(--border-color)' } },
      },
      yAxis: {
        type: 'value',
        axisLabel: { color: 'var(--text-muted)' },
        splitLine: { lineStyle: { color: 'var(--border-color)', type: 'dashed' } },
      },
      series: [{
        type: 'line',
        data: perWeek.map(d => d.count),
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: { color: 'var(--accent-cyan)', width: 2 },
        itemStyle: { color: 'var(--accent-cyan)' },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(56,189,248,0.3)' },
              { offset: 1, color: 'rgba(56,189,248,0.0)' },
            ],
          },
        },
      }],
    };
  }

  private buildSourceChart(jobs: { source: string }[]): void {
    const sourceCounts: Record<string, number> = {};
    jobs.forEach(j => {
      sourceCounts[j.source] = (sourceCounts[j.source] || 0) + 1;
    });

    const colors = [
      'var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)',
      'var(--chart-4)', 'var(--chart-5)',
    ];

    this.sourceChartOptions = {
      tooltip: {
        trigger: 'item',
        backgroundColor: 'var(--bg-card)',
        borderColor: 'var(--border-color)',
        textStyle: { color: 'var(--text-primary)' },
        formatter: '{b}: {c} ({d}%)',
      },
      legend: {
        orient: 'vertical',
        right: 8,
        top: 'center',
        textStyle: { color: 'var(--text-secondary)', fontSize: 11 },
      },
      series: [{
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['35%', '50%'],
        data: Object.entries(sourceCounts).map(([source, count], i) => ({
          name: source.replace('_', ' '),
          value: count,
          itemStyle: { color: colors[i % colors.length] },
        })),
        label: { show: false },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0,0,0,0.5)',
          },
        },
      }],
    };
  }

  private subscribeToLiveFeed(): void {
    this.wsService.marketData$
      .pipe(takeUntil(this.destroy$))
      .subscribe(pulse => {
        this.latestPulse = pulse;
        this.liveFeed = [pulse, ...this.liveFeed].slice(0, 10);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
