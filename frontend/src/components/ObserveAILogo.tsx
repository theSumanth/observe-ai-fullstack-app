import { Link } from "react-router-dom";

const sizes = {
  sm: { img: "h-6 w-6", text: "text-sm" },
  md: { img: "h-8 w-8", text: "text-base" },
  lg: { img: "h-11 w-11", text: "text-xl" },
};

export function ObserveAILogo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const s = sizes[size];
  return (
    <Link to="/" className="flex items-center gap-2 shrink-0 hover:opacity-80 transition-opacity">
      <img
        src="/observeai_logo.jfif"
        alt="Observe.AI"
        className={`${s.img} rounded-full object-cover`}
      />
      <span className={`${s.text} font-bold tracking-widest text-foreground`}>
        OBSERVE<span className="text-primary">.AI</span>
      </span>
    </Link>
  );
}
