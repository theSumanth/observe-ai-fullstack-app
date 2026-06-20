const sizes = { sm: "h-7", md: "h-9", lg: "h-12" };

export function ObserveAILogo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  return (
    <img
      src="/observeai_logo.jfif"
      alt="Observe.AI"
      className={`${sizes[size]} w-auto object-contain`}
    />
  );
}
