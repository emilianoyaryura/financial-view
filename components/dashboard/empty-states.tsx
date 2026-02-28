interface EmptyStateProps {
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="text-center py-16 animate-fade-in">
      <p className="text-foreground-secondary text-sm">{title}</p>
      <p className="text-foreground-tertiary text-xs mt-1 max-w-xs mx-auto">
        {description}
      </p>
      {action && (
        <button
          onClick={action.onClick}
          className="mt-4 text-xs font-medium btn-primary px-4 py-2 rounded-lg"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
