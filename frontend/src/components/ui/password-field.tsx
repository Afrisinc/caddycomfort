import { useState } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TextField, type TextFieldProps } from '@/components/ui/text-field';

type PasswordFieldProps = Omit<TextFieldProps, 'type' | 'icon' | 'trailing'>;

export function PasswordField(props: Readonly<PasswordFieldProps>) {
  const [visible, setVisible] = useState(false);

  return (
    <TextField
      {...props}
      type={visible ? 'text' : 'password'}
      icon={Lock}
      trailing={
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={visible ? 'Hide password' : 'Show password'}
          aria-pressed={visible}
          aria-controls={props.id}
          onClick={() => setVisible((value) => !value)}
          className="text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-accent-rose/40"
        >
          {visible ? <EyeOff /> : <Eye />}
        </Button>
      }
    />
  );
}
