import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ExportButtonProps {
  readonly onExport: () => void;
  readonly disabled?: boolean;
  readonly label?: string;
}

export function ExportButton({ onExport, disabled, label = 'Export CSV' }: ExportButtonProps) {
  return (
    <Button
      variant="outline"
      onClick={onExport}
      disabled={disabled}
      aria-label={label}
      title={disabled ? 'Nothing to export yet' : undefined}
      className="gap-2 bg-background"
    >
      <Download className="h-4 w-4" aria-hidden="true" />
      <span className="hidden sm:inline">{label}</span>
    </Button>
  );
}
