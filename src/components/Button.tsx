import {
  Button as ButtonUi,
  ButtonProps as ButtonPropsUi,
} from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type ButtonProps = ButtonPropsUi;

export const Button = ({ className, ...props }: ButtonProps) => {
  return (
    <ButtonUi
      className={cn(
        'jato-flame mt-8 h-11 w-full rounded-full font-semibold text-white shadow-md shadow-flame/25 transition-transform hover:scale-[1.01]',
        className
      )}
      {...props}
    />
  );
};
