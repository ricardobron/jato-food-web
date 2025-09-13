'use client';

import * as React from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface IOptions {
  label: string;
  value: string;
}

interface InputSelectProps {
  options: IOptions[];
  value?: string;
  onChange: (value?: string) => void;
}

export function InputSelect({ onChange, options, value }: InputSelectProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          {value
            ? options.find((framework) => framework.value === value)?.label
            : 'Seleciona mesa...'}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Pesquisa mesa..." className="h-9" />
          <CommandList>
            <CommandEmpty>Mesa não encontrada.</CommandEmpty>
            <CommandGroup>
              {options.map((_option) => (
                <CommandItem
                  key={_option.value}
                  value={_option.value}
                  onSelect={(currentValue) => {
                    onChange(currentValue === value ? '' : currentValue);
                    setOpen(false);
                  }}
                >
                  {_option.label}
                  <Check
                    className={cn(
                      'ml-auto',
                      value === _option.value ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
