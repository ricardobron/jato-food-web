import { Input, InputProps } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export type InputTextProps = InputProps & { label: string };

export function InputText({ label, ...props }: InputTextProps) {
  return (
    <div className="grid w-full max-w-sm items-center gap-1.5">
      <Label className="text-sm font-medium text-charcoal/60">{label}</Label>
      <Input className="stroke" {...props} />
    </div>
  );
}
