import { ChangeDetectionStrategy, Component } from '@angular/core';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { HlmPopoverImports } from '@spartan-ng/helm/popover';

@Component({
  selector: 'app-simulation-popover',
  imports: [
    HlmPopoverImports,
    HlmButtonImports,
    HlmLabelImports,
    HlmInputImports,
  ],
  templateUrl: './simulation-popover.component.html',
  styleUrl: './simulation-popover.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'absolute' },
})
export class SimulationPopover {}
