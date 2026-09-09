export default function AcceptanceChecklist({
  items,
  editable = false,
  onChange,
}: {
  items: string[];
  editable?: boolean;
  onChange?: (items: string[]) => void;
}) {
  function update(i: number, value: string) {
    const next = [...items];
    next[i] = value;
    onChange?.(next);
  }
  function add() {
    onChange?.([...items, ""]);
  }
  function remove(i: number) {
    onChange?.(items.filter((_, idx) => idx !== i));
  }

  if (!editable) {
    return (
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-text-light dark:text-text-dark">
            <span className="mt-0.5 h-4 w-4 rounded border border-border-light dark:border-border-dark shrink-0" />
            {item}
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex gap-2">
          <input
            value={item}
            onChange={(e) => update(i, e.target.value)}
            placeholder="Acceptance criterion"
            className="flex-1 rounded-xl border border-border-light dark:border-border-dark bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal"
          />
          <button onClick={() => remove(i)} className="text-danger text-sm px-2">
            Remove
          </button>
        </div>
      ))}
      <button onClick={add} className="text-teal text-sm font-medium">
        + Add criterion
      </button>
    </div>
  );
}
