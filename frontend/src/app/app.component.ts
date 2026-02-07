import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HlmSidebarImports } from '@spartan-ng/helm/sidebar';
import { Sidebar } from './core/layout/sidebar/sidebar.component';

@Component({
  selector: 'app-root',
  imports: [Sidebar, HlmSidebarImports, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class App {}
