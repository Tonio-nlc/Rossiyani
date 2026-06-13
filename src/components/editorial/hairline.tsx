type HairlineProps = {
  className?: string;
};

export function Hairline({ className = "" }: HairlineProps) {
  return <hr className={["hairline", className].filter(Boolean).join(" ")} />;
}
