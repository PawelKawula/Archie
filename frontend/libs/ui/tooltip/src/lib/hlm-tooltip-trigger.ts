import { Directive } from '@angular/core';
import {
  BrnTooltip,
  provideBrnTooltipDefaultOptions,
} from '@spartan-ng/brain/tooltip';

export const DEFAULT_TOOLTIP_CONTENT_CLASSES =
  'bg-primary text-primary-foreground animate-in fade-in-0 zoom-in-95 z-50 w-fit rounded-md px-3 py-1.5 text-xs text-balance ' +
  'data-[state=open]:animate-in ' +
  'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 ' +
  'data-[side=below]:slide-in-from-top-2 data-[side=above]:slide-in-from-bottom-2 ' +
  'data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 ';

@Directive({
  selector: '[hlmTooltipTrigger]',
  providers: [
    provideBrnTooltipDefaultOptions({
      showDelay: 150,
      hideDelay: 300,
      tooltipContentClasses: DEFAULT_TOOLTIP_CONTENT_CLASSES,
    }),
  ],
  hostDirectives: [
    {
      directive: BrnTooltip,
      inputs: [
        'tooltipDisabled: hlmTooltipDisabled',
        'brnTooltip: hlmTooltipTrigger',
        'position',
        'hideDelay',
        'showDelay',
      ],
    },
  ],
  host: {
    'data-slot': 'tooltip-trigger',
  },
})
export class HlmTooltipTrigger {}
