// src/domain/content/ContentManager.ts

import type { ContentWindowProps } from './types';

export class ContentManager {
  private appModules: Record<string, unknown>;
  private apps: ContentWindowProps[] = [];

  constructor(globPath: string) {
    // Vite's import.meta.glob with eager: true loads modules on startup.
    this.appModules = import.meta.glob(globPath, { eager: true });
    this.processModules();
  }

  private processModules(): void {
    const loadedApps = Object.values(this.appModules).map((module: any) => module.default);
    this.apps = loadedApps.filter((comp) => comp && comp.metadata) as ContentWindowProps[];
  }

  public getApps(): ContentWindowProps[] {
    return this.apps;
  }
}