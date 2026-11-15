"use client";

export default function DeleteOrderButton({ orderId }: { orderId: number }) {
  return (
    <button
      type="submit"
      style={{ color: "#b00020" }}
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
