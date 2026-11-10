/** Internal exact display model. No financial arithmetic or fractional Number conversion. */
export type DecimalAmount = {
  negative: boolean;
  integer: string;
  fraction: string;
};
export type BalanceToken = { key: string; text: string; digit?: number };
export type BalanceModel = {
  amount: DecimalAmount;
  formatted: string;
  tokens: BalanceToken[];
  rolling: boolean;
};

export function parseAmount(value: string): DecimalAmount {
  if (
    typeof value !== 'string' ||
    !/^-?(0|[1-9]\d{0,14})(\.\d{1,6})?$/.test(value) ||
    value.trim() !== value
  )
    throw new Error(
      'AnimatedBalance value must be a decimal string: at most 15 integer and 6 fraction digits'
    );
  const negative = value.startsWith('-');
  const [integer = '0', raw = ''] = (negative ? value.slice(1) : value).split(
    '.'
  );
  const fraction = raw.replace(/0+$/, '');
  return {
    negative: negative && (integer !== '0' || fraction !== ''),
    integer,
    fraction,
  };
}

export function compareAmounts(a: DecimalAmount, b: DecimalAmount): number {
  if (a.negative !== b.negative) return a.negative ? -1 : 1;
  const magnitude =
    a.integer.length !== b.integer.length
      ? Math.sign(a.integer.length - b.integer.length)
      : a.integer !== b.integer
        ? a.integer > b.integer
          ? 1
          : -1
        : a.fraction.padEnd(6, '0') === b.fraction.padEnd(6, '0')
          ? 0
          : a.fraction.padEnd(6, '0') > b.fraction.padEnd(6, '0')
            ? 1
            : -1;
  return a.negative ? -magnitude : magnitude;
}

export function createBalanceFormatter(
  locale: string,
  currency?: string,
  fractionDigits?: number
) {
  if (
    typeof locale !== 'string' ||
    !locale ||
    Intl.NumberFormat.supportedLocalesOf([locale]).length !== 1
  )
    throw new Error('AnimatedBalance locale is not supported by this runtime');
  if (currency !== undefined && !/^[A-Z]{3}$/.test(currency))
    throw new Error(
      'AnimatedBalance currency must be three uppercase ASCII letters'
    );
  if (
    fractionDigits !== undefined &&
    (!Number.isInteger(fractionDigits) ||
      fractionDigits < 0 ||
      fractionDigits > 6)
  )
    throw new Error(
      'AnimatedBalance fractionDigits must be an integer from 0 to 6'
    );
  const defaults = new Intl.NumberFormat(
    locale,
    currency ? { style: 'currency', currency } : {}
  );
  const precision =
    fractionDigits ??
    (currency ? defaults.resolvedOptions().maximumFractionDigits : 2);
  if (precision === undefined || precision > 6)
    throw new Error(
      'AnimatedBalance runtime currency precision is unsupported'
    );
  const formatter = new Intl.NumberFormat(locale, {
    style: currency ? 'currency' : 'decimal',
    currency,
    minimumFractionDigits: precision,
    maximumFractionDigits: precision,
    useGrouping: true,
  });
  const digitFormatter = new Intl.NumberFormat(locale, {
    useGrouping: false,
    maximumFractionDigits: 0,
  });
  const digits = Array.from({ length: 10 }, (_, n) => digitFormatter.format(n));
  if (
    digits.some((d) => Array.from(d).length !== 1) ||
    new Set(digits).size !== 10
  )
    throw new Error(
      'AnimatedBalance requires a positional single-glyph decimal numbering system'
    );
  const lookup = new Map(digits.map((d, n) => [d, n]));
  return (value: string): BalanceModel => {
    const amount = parseAmount(value);
    if (amount.fraction.length > precision)
      throw new Error(
        'AnimatedBalance value exceeds display precision; rounding is not performed'
      );
    // Format only an exact integer. For negative subunits, probe -1 so runtimes
    // that discard signed zero still supply their real negative pattern.
    const basis =
      amount.negative && amount.integer === '0' ? '1' : amount.integer;
    const integer = Number(basis) * (amount.negative ? -1 : 1);
    const glyphs = Array.from(formatter.format(integer));
    const decoded = glyphs
      .filter((char) => lookup.has(char))
      .map((char) => lookup.get(char))
      .join('');
    if (decoded !== basis + '0'.repeat(precision))
      throw new Error(
        'AnimatedBalance runtime emitted an unsupported or inexact numeric format'
      );
    const fraction = amount.fraction.padEnd(precision, '0');
    const tokens: BalanceToken[] = [];
    let ordinal = 0;
    for (let index = 0; index < glyphs.length;) {
      const char = glyphs[index]!;
      if (lookup.has(char)) {
        const isInteger = ordinal < amount.integer.length;
        const position = isInteger
          ? amount.integer.length - ordinal - 1
          : ordinal - amount.integer.length + 1;
        const digit = Number(
          isInteger ? amount.integer[ordinal] : fraction[position - 1]
        );
        tokens.push({
          key: `${isInteger ? 'integer' : 'fraction'}:${position}`,
          text: digits[digit]!,
          digit,
        });
        ordinal += 1;
        index += 1;
      } else {
        let text = '';
        while (index < glyphs.length && !lookup.has(glyphs[index]!))
          text += glyphs[index++];
        const key =
          ordinal === 0
            ? 'prefix'
            : ordinal < amount.integer.length
              ? `group:${amount.integer.length - ordinal}`
              : ordinal === amount.integer.length && precision > 0
                ? 'decimal'
                : 'suffix';
        tokens.push({ key, text });
      }
    }
    const formatted = tokens.map((token) => token.text).join('');
    return {
      amount,
      formatted,
      tokens,
      rolling:
        digits.join('') === '0123456789' &&
        !/[\u061c\u200e\u200f\u202a-\u202e\u2066-\u2069]/u.test(formatted),
    };
  };
}

/** Normalize without changing the cyclic image; retarget at most one revolution away. */
export function digitDestination(
  current: number,
  next: number,
  direction: number
) {
  'worklet';
  const normalized = ((current % 10) + 10) % 10;
  return {
    current: normalized,
    target:
      direction > 0 && next < normalized
        ? next + 10
        : direction < 0 && next > normalized
          ? next - 10
          : next,
  };
}
