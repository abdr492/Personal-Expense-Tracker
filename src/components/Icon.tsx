import * as icons from 'lucide-react';
import { LucideProps } from 'lucide-react';

interface IconProps extends LucideProps {
  name: string;
  className?: string;
}

export const Icon = ({ name, ...props }: IconProps) => {
  const LucideIcon = (icons as any)[name];
  if (!LucideIcon) return <icons.HelpCircle {...props} />;
  return <LucideIcon {...props} />;
};
