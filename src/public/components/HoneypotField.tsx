interface HoneypotFieldProps {
  value: string;
  onChange: (value: string) => void;
}

/**
 * A field only a bot will fill in.
 *
 * Positioned off-screen rather than `display: none`, because some bots skip
 * hidden inputs. Kept out of the tab order and hidden from screen readers, and
 * autocomplete is off so a browser never fills it on a real user's behalf.
 * A non-empty value causes the server to drop the submission.
 */
export function HoneypotField({ value, onChange }: HoneypotFieldProps) {
  return (
    <div aria-hidden="true" className="absolute left-[-9999px] top-0 h-0 w-0 overflow-hidden">
      <label htmlFor="company_website">Company website</label>
      <input
        id="company_website"
        name="company_website"
        type="text"
        tabIndex={-1}
        autoComplete="off"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}
