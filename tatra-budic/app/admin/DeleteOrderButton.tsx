"use client";

export default function DeleteOrderButton({ orderId }: { orderId: number }) {
  return (
    <button
      type="submit"
      className="rounded-full border border-red-200 px-3 py-1.5 text-xs font-medium text-red-700 transition-colors hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
      onClick={(e) => {
        if (!confirm(`Naozaj zmazať objednávku #${orderId}? Túto akciu nemožno vrátiť.`)) {
          e.preventDefault();
        }
      }}
    >
      Zmazať
    </button>
  );
}
