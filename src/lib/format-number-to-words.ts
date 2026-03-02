/**
 * Convert a number to Vietnamese words.
 * Example: 50083000 → "Năm mươi triệu không trăm tám mươi ba nghìn đồng"
 */

const DIGITS = [
  "không", "một", "hai", "ba", "bốn",
  "năm", "sáu", "bảy", "tám", "chín",
];

function readGroup(hundreds: number, tens: number, units: number, hasHigherGroup: boolean): string {
  const parts: string[] = [];

  if (hundreds > 0) {
    parts.push(`${DIGITS[hundreds]} trăm`);
  } else if (hasHigherGroup && (tens > 0 || units > 0)) {
    parts.push("không trăm");
  }

  if (tens > 1) {
    parts.push(`${DIGITS[tens]} mươi`);
    if (units === 1) {
      parts.push("mốt");
    } else if (units === 5) {
      parts.push("lăm");
    } else if (units > 0) {
      parts.push(DIGITS[units]);
    }
  } else if (tens === 1) {
    parts.push("mười");
    if (units === 5) {
      parts.push("lăm");
    } else if (units > 0) {
      parts.push(DIGITS[units]);
    }
  } else if (units > 0) {
    if (hundreds > 0 || hasHigherGroup) {
      parts.push("lẻ");
    }
    parts.push(DIGITS[units]);
  }

  return parts.join(" ");
}

const GROUP_NAMES = ["", "nghìn", "triệu", "tỷ"];

export function numberToVietnameseWords(n: number): string {
  if (n === 0) return "Không đồng";

  const rounded = Math.round(Math.abs(n));
  const str = rounded.toString();

  // Split into groups of 3 from right
  const groups: number[] = [];
  let i = str.length;
  while (i > 0) {
    const start = Math.max(0, i - 3);
    groups.unshift(parseInt(str.slice(start, i), 10));
    i = start;
  }

  const parts: string[] = [];
  const totalGroups = groups.length;

  for (let g = 0; g < totalGroups; g++) {
    const groupValue = groups[g];
    const groupIndex = totalGroups - 1 - g;

    if (groupValue === 0) continue;

    const hundreds = Math.floor(groupValue / 100);
    const tens = Math.floor((groupValue % 100) / 10);
    const units = groupValue % 10;

    const hasHigherGroup = g > 0;
    const text = readGroup(hundreds, tens, units, hasHigherGroup);

    if (text) {
      const groupName = GROUP_NAMES[groupIndex % 4] || "";
      // Handle tỷ for higher groups
      const prefix = groupIndex >= 4 ? " tỷ" : "";
      parts.push(text + (groupName ? ` ${groupName}` : "") + prefix);
    }
  }

  const result = parts.join(" ");
  const prefix = n < 0 ? "Âm " : "";
  // Capitalize first letter
  const capitalized = result.charAt(0).toUpperCase() + result.slice(1);
  return `${prefix}${capitalized} đồng`;
}
