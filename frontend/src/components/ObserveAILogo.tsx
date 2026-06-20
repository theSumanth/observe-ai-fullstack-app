const sizes = {
  sm: { wrapper: "h-7 w-28", scale: "scale-[1.8]" },
  md: { wrapper: "h-9 w-36", scale: "scale-[1.8]" },
  lg: { wrapper: "h-12 w-48", scale: "scale-[1.8]" },
};

export function ObserveAILogo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const s = sizes[size];
  return (
    <div className={`${s.wrapper} overflow-hidden flex items-center justify-center shrink-0`}>
      <img
        src="/logo_with_text.jpg"
        alt="Observe.AI"
        className={`h-full w-auto object-contain ${s.scale} origin-center`}
      />
    </div>
  );
}
