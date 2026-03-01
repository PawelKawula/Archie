import { Component } from '@angular/core';
import { HlmSidebarImports } from '@spartan-ng/helm/sidebar';
import { Canvas } from './core/canvas/canvas.component';
import { Sidebar } from './core/layout/sidebar/sidebar.component';

@Component({
  selector: 'app-root',
  imports: [Sidebar, HlmSidebarImports, Canvas],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class App {}
