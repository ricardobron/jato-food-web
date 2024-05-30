import { Input, InputProps } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export type InputTextProps = InputProps & { label: string };

export function InputText({ label, ...props }: InputTextProps) {
  return (
    <div className="grid w-full max-w-sm items-center gap-1.5">
      <Label className="font-Poppins font-normal text-[14px] text-gray-300">
        {label}
      </Label>
      <Input className="stroke" {...props} />
    </div>
  );
}
