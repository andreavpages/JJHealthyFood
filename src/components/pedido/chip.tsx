"use client";

export function Chip({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-2 rounded-full border text-sm font-sans font-semibold transition-colors active:scale-95 ${
        selected
          ? "bg-primary text-on-primary border-primary"
          : "bg-surface-container-lowest text-on-surface border-outline-variant hover:border-primary"
      }`}
    >
      {label}
    </button>
  );
}
