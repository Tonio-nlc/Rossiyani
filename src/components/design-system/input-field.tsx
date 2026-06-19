import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

type InputFieldBaseProps = {
  label?: string;
  hint?: string;
  className?: string;
};

type TextInputProps = InputFieldBaseProps &
  Omit<InputHTMLAttributes<HTMLInputElement>, "className"> & {
    multiline?: false;
  };

type TextareaProps = InputFieldBaseProps &
  Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "className"> & {
    multiline: true;
  };

type SelectProps = InputFieldBaseProps &
  Omit<SelectHTMLAttributes<HTMLSelectElement>, "className"> & {
    as: "select";
    children: ReactNode;
  };

export type InputFieldProps = TextInputProps | TextareaProps | SelectProps;

function FieldShell({
  label,
  hint,
  className,
  children,
}: {
  label?: string;
  hint?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <label className={["block", className].filter(Boolean).join(" ")}>
      {label ? <span className="text-eyebrow mb-2 block normal-case tracking-[0.12em]">{label}</span> : null}
      {children}
      {hint ? <span className="mt-1.5 block text-xs text-[var(--ink-muted)]">{hint}</span> : null}
    </label>
  );
}

export function InputField(props: InputFieldProps) {
  if ("as" in props && props.as === "select") {
    const { label, hint, className, children, as: _as, ...selectProps } = props;
    return (
      <FieldShell label={label} hint={hint} className={className}>
        <select {...selectProps} className="focus-kb ds-input">
          {children}
        </select>
      </FieldShell>
    );
  }

  if ("multiline" in props && props.multiline) {
    const { label, hint, className, multiline: _multiline, ...textareaProps } = props;
    return (
      <FieldShell label={label} hint={hint} className={className}>
        <textarea {...textareaProps} className="focus-kb ds-input ds-input-textarea" />
      </FieldShell>
    );
  }

  const { label, hint, className, multiline: _multiline, ...inputProps } = props as TextInputProps;
  return (
    <FieldShell label={label} hint={hint} className={className}>
      <input {...inputProps} className="focus-kb ds-input" />
    </FieldShell>
  );
}
