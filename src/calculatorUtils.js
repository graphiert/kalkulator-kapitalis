/**
 * getLastOperatorIndex: Mencari posisi operator terakhir dalam expression
 * Digunakan untuk memisahkan bilangan saat ini dari bilangan sebelumnya
 */
export const getLastOperatorIndex = (expr, operations) =>
  Math.max(...operations.map((op) => expr.lastIndexOf(op)));

/**
 * getCurrentNumber: Mengambil bilangan saat ini setelah operator terakhir
 * Contoh: "12+34" → "34" (bilangan setelah +)
 * Berguna untuk validasi koma dan nol di awal
 */
export const getCurrentNumber = (expr, operations) => {
  const lastOperatorIndex = getLastOperatorIndex(expr, operations);
  return expr.slice(lastOperatorIndex + 1);
};

/**
 * replaceValueToDisplay: Mengkonversi simbol kalkulasi ke tampilan yang user-friendly
 * "/" → "÷", "*" → "×", "." → ","
 * Ini hanya untuk display; nilai internal tetap menggunakan simbol JS
 */
export const replaceValueToDisplay = (expr) => {
  const displayMap = { "/": "÷", "*": "×", ".": "," };
  return expr.replace(new RegExp("[/*.]", "g"), (match) => displayMap[match]);
};

/**
 * normalizeExpressionForEvaluation: Menghapus karakter non-matematis dari expression
 * Pastikan expression hanya berisi angka dan operator yang valid untuk eval
 */
export const normalizeExpressionForEvaluation = (expr) =>
  expr.replace(/[^0-9+\-*/.]/g, "");

/**
 * evaluateExpression: Mengevaluasi expression matematik dan mengembalikan hasilnya
 * 1. Normalisasi expression
 * 2. Cegah evaluasi jika diakhiri dengan operator (invalid)
 * 3. Gunakan Function constructor untuk eval dengan aman
 * 4. Tangkap error dan return "Error" jika invalid
 */
export const evaluateExpression = (expr, operations) => {
  const sanitized = normalizeExpressionForEvaluation(expr);
  if (!sanitized) return;
  if (operations.includes(sanitized.slice(-1))) return;
  try {
    return String(Function("return (" + sanitized + ")")());
  } catch (e) {
    console.log(e);
    return "Error";
  }
};
