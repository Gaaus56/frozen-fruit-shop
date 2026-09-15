'use client';

export function DeleteButton({ action, itemLabel }: { action: () => Promise<void>; itemLabel: string }) {
  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (!window.confirm(`Xoá "${itemLabel}"? Hành động này không thể hoàn tác.`)) {
          event.preventDefault();
        }
      }}
    >
      <button
        type="submit"
        className="rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
      >
        Xoá
      </button>
    </form>
  );
}
