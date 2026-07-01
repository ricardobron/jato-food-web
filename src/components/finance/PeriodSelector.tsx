'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { format, subDays } from 'date-fns';

export interface Period {
  from?: string;
  to?: string;
  label: string;
}

export const todayStr = () => format(new Date(), 'yyyy-MM-dd');
export const daysAgoStr = (n: number) => format(subDays(new Date(), n), 'yyyy-MM-dd');

const presets: Period[] = [
  { label: 'Hoje' },
  { label: '7 dias', from: daysAgoStr(6), to: todayStr() },
  { label: '30 dias', from: daysAgoStr(29), to: todayStr() },
];

interface Props {
  value: Period;
  onChange: (p: Period) => void;
}

export const PeriodSelector = ({ value, onChange }: Props) => {
  return (
    <div className="no-print flex flex-wrap items-end gap-2">
      <div className="flex gap-2">
        {presets.map((p) => (
          <Button
            key={p.label}
            variant={value.label === p.label ? 'default' : 'outline'}
            size="sm"
            onClick={() => onChange(p)}
          >
            {p.label}
          </Button>
        ))}
      </div>

      <div className="flex items-end gap-2">
        <label className="flex flex-col text-xs text-muted-foreground">
          De
          <Input
            type="date"
            className="h-9 w-[150px]"
            value={value.from ?? ''}
            max={value.to ?? todayStr()}
            onChange={(e) =>
              onChange({
                label: 'Personalizado',
                from: e.target.value,
                to: value.to ?? todayStr(),
              })
            }
          />
        </label>
        <label className="flex flex-col text-xs text-muted-foreground">
          Até
          <Input
            type="date"
            className="h-9 w-[150px]"
            value={value.to ?? ''}
            max={todayStr()}
            onChange={(e) =>
              onChange({
                label: 'Personalizado',
                from: value.from ?? e.target.value,
                to: e.target.value,
              })
            }
          />
        </label>
      </div>
    </div>
  );
};
