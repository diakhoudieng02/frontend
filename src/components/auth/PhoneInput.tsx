import { useState } from 'react';
import { COUNTRY_CODES } from '@/types';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ChevronDown } from 'lucide-react';
import ReactCountryFlag from "react-country-flag";

interface PhoneInputProps {
  value: string;
  onChange: (phone: string) => void;
  countryCode: string;
  onCountryChange: (code: string) => void;
}

/**
 * Format a raw digit string into "7X XXX XX XX" for Senegal (+221).
 * For other countries, groups digits by the placeholder pattern.
 */
function formatPhone(digits: string, placeholder: string): string {
  // Extract group sizes from placeholder (e.g. "77 123 45 67" → [2,3,2,2])
  const groups = placeholder.replace(/[^0-9 ]/g, '').split(' ').map(g => g.length);
  let result = '';
  let idx = 0;
  for (const len of groups) {
    if (idx >= digits.length) break;
    if (result) result += ' ';
    result += digits.slice(idx, idx + len);
    idx += len;
  }
  return result;
}

/** Get max digit count from placeholder */
function maxDigits(placeholder: string): number {
  return placeholder.replace(/\D/g, '').length;
}

export function PhoneInput({ value, onChange, countryCode, onCountryChange }: PhoneInputProps) {
  const [open, setOpen] = useState(false);
  const selected = COUNTRY_CODES.find(c => c.dial === countryCode) || COUNTRY_CODES[0];
  const max = maxDigits(selected.placeholder);

  // The raw digits (no spaces)
  const rawDigits = value.replace(/\D/g, '');
  const displayValue = formatPhone(rawDigits, selected.placeholder);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Extract only digits from input
    const newDigits = e.target.value.replace(/\D/g, '');
    // Enforce Senegal: must start with 7
    if (countryCode === '+221' && newDigits.length > 0 && newDigits[0] !== '7') {
      return; // reject non-7 first digit for Senegal
    }
    // Enforce max length
    if (newDigits.length > max) return;
    onChange(newDigits);
  };

  return (
    <div className="flex gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="flex h-12 items-center gap-1.5 rounded-xl border bg-muted px-3 text-sm hover:bg-muted/80 transition-colors shrink-0"
          >
            <ReactCountryFlag
  countryCode={selected.code}
  svg
  style={{
    width: '1.5em',
    height: '1.5em',
    borderRadius: '4px',
  }}
/>

            <span className="text-foreground font-medium">{selected.dial}</span>
            <ChevronDown className="h-3 w-3 text-muted-foreground" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-1 max-h-60 overflow-y-auto" align="start">
          {COUNTRY_CODES.map(country => (
            <button
              key={country.code}
              type="button"
              onClick={() => { onCountryChange(country.dial); onChange(''); setOpen(false); }}
              className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-sage-blue-50 transition-colors ${
                country.dial === countryCode ? 'bg-sage-blue-50 text-primary font-medium' : ''
              }`}
            >
              <ReactCountryFlag
  countryCode={country.code}
  svg
  style={{
    width: '1.5em',
    height: '1.5em',
    borderRadius: '4px',
  }}
/>

              <span className="flex-1 text-left">{country.name}</span>
              <span className="text-muted-foreground text-xs">{country.dial}</span>
            </button>
          ))}
        </PopoverContent>
      </Popover>
      <input
        className="flex h-12 w-full rounded-xl border border-input bg-background px-4 text-base font-medium tracking-wide text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
        value={displayValue}
        onChange={handleChange}
        placeholder={selected.placeholder}
        type="tel"
        inputMode="numeric"
        autoComplete="tel-national"
      />
    </div>
  );
}
