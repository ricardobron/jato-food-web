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
        'w-full bg-orange-600 text-white hover:bg-orange-600/55 mt-8',
        className
      )}
      {...props}
    />
  );
};
