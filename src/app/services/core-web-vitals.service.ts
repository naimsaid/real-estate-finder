import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject } from '@angular/core';

export type CoreWebVitalName = 'LCP' | 'CLS' | 'INP';

export interface CoreWebVitalMeasurement {
  name: CoreWebVitalName;
  value: number;
}

@Injectable({ providedIn: 'root' })
export class CoreWebVitalsService {
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly measurements = new Map<CoreWebVitalName, number>();
  private observers: PerformanceObserver[] = [];

  start(): void {
    if (!isPlatformBrowser(this.platformId) || typeof PerformanceObserver === 'undefined') return;

    this.observe('largest-contentful-paint', (entries) => {
      const lastEntry = entries.at(-1);
      if (lastEntry) this.report('LCP', lastEntry.startTime);
    });

    let cumulativeLayoutShift = 0;
    this.observe('layout-shift', (entries) => {
      for (const entry of entries) {
        const layoutShift = entry as PerformanceEntry & { value: number; hadRecentInput: boolean };
        if (!layoutShift.hadRecentInput) cumulativeLayoutShift += layoutShift.value;
      }
      this.report('CLS', cumulativeLayoutShift);
    });

    this.observe('event', (entries) => {
      const longestInteraction = Math.max(0, ...entries.map((entry) => entry.duration));
      if (longestInteraction) {
        this.report('INP', Math.max(this.measurements.get('INP') ?? 0, longestInteraction));
      }
    }, 40);
  }

  stop(): void {
    this.observers.forEach((observer) => observer.disconnect());
    this.observers = [];
  }

  private observe(type: string, callback: (entries: PerformanceEntry[]) => void, durationThreshold?: number): void {
    try {
      const observer = new PerformanceObserver((list) => callback(list.getEntries()));
      observer.observe({ type, buffered: true, durationThreshold } as PerformanceObserverInit);
      this.observers.push(observer);
    } catch {
      // The browser may not implement every Web Vitals entry type.
    }
  }

  private report(name: CoreWebVitalName, value: number): void {
    this.measurements.set(name, value);
    this.document.defaultView?.dispatchEvent(
      new CustomEvent<CoreWebVitalMeasurement>('habita:web-vital', {
        detail: { name, value },
      }),
    );
  }
}
