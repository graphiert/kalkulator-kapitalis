import { useState, useEffect } from "react";
import {
  evaluateExpression,
  getCurrentNumber,
  replaceValueToDisplay,
} from "./calculatorUtils";

function App() {
  // State untuk menyimpan expression: display (user-friendly) dan value (internal untuk kalkulasi)
  const [expression, setExpression] = useState({ display: "0", value: "0" });
  // State untuk menyimpan hasil dari evaluasi expression
  const [result, setResult] = useState("0");
  // Flag untuk menandai bahwa user telah menekan "="
  // Digunakan untuk menentukan perilaku input berikutnya
  const [hasEvaluated, setHasEvaluated] = useState(false);
  // Toggle untuk mengontrol perilaku setelah evaluation
  // true: input angka baru memulai expression baru (default)
  // false: input akan dilanjutkan ke expression sebelumnya
  // Toggle dengan memanggil window.toggleContinueAfterEval() di konsol
  const [continueAfterEval, setContinueAfterEval] = useState(true);

  // Expose toggle function untuk testing/development
  // Memungkinkan user mengubah perilaku tanpa UI button
  useEffect(() => {
    window.toggleContinueAfterEval = () => setContinueAfterEval((v) => !v);
    return () => {
      delete window.toggleContinueAfterEval;
    };
  }, []);

  // Konfigurasi tombol kalkulator: 4 kolom, display vs value
  const keys = [
    [
      { display: "7", value: "7" },
      { display: "4", value: "4" },
      { display: "1", value: "1" },
      { display: "0", value: "0" },
    ],
    [
      { display: "8", value: "8" },
      { display: "5", value: "5" },
      { display: "2", value: "2" },
      { display: ",", value: "." },
    ],
    [
      { display: "9", value: "9" },
      { display: "6", value: "6" },
      { display: "3", value: "3" },
      { display: "=", value: "=" },
    ],
    [
      { display: "÷", value: "/" },
      { display: "×", value: "*" },
      { display: "-", value: "-" },
      { display: "+", value: "+" },
    ],
  ];

  // Daftar angka 1-9 (gunakan untuk validasi)
  const numbersNotZero = Array.from({ length: 9 }, (_, index) =>
    String(index + 1),
  );
  // Daftar operator matematis dari keys
  const operations = keys[3].map((el) => el.value);

  const appendExpression = (charValue) => {
    // Destruktur expression dan hitung state yang diperlukan
    const expr = expression.value;
    const lastChar = expr.at(-1);
    const currentNumber = getCurrentNumber(expr, operations);
    const endsWithOperator = operations.includes(lastChar);
    const endsWithDot = lastChar === ".";
    const currentNumberHasDot = currentNumber.includes(".");
    const currentNumberIsZero = currentNumber === "0";

    // Helper: update expression dengan display yang sudah di-format
    const setExpr = (newValue) => {
      setExpression({
        display: String(replaceValueToDisplay(newValue)),
        value: String(newValue),
      });
    };

    // Jika user klik "=", evaluasi expression dan simpan hasil
    // Set hasEvaluated = true untuk trigger "baru expression" logic jika toggle aktif
    if (charValue === "=") {
      let evalExpr = expr;
      // Hapus titik atau operator di akhir sebelum eval
      if (endsWithDot) {
        evalExpr = expr.slice(0, -1); // Hapus titik di akhir
      } else if (endsWithOperator) {
        evalExpr = expr.slice(0, -1); // Hapus operator di akhir
      }
      const result = evaluateExpression(evalExpr, operations);
      setResult(result);
      setHasEvaluated(true);
      if (result !== undefined) {
        setExpr(evalExpr);
      }
      return;
    }

    // Logika setelah evaluation (jika user tekan "=")
    // continueAfterEval = true: input angka memulai expression baru
    // continueAfterEval = false: input akan dilanjutkan ke expression sebelumnya
    if (hasEvaluated) {
      if (continueAfterEval) {
        // Mulai expression baru dengan input ini
        if (numbersNotZero.includes(charValue)) {
          setExpr(charValue);
          setHasEvaluated(false);
          return;
        }
        if (charValue === "0") {
          setExpr("0");
          setHasEvaluated(false);
          return;
        }
        if (charValue === ".") {
          setExpr("0.");
          setHasEvaluated(false);
          return;
        }
        // Jika operator, lanjutkan dari hasil sebelumnya
        if (operations.includes(charValue)) {
          if (result === "Error") return;
          setExpr(`${result}${charValue}`);
          setHasEvaluated(false);
          return;
        }
      } else {
        // Toggle OFF: lanjutkan ke expression sebelumnya (jangan mulai baru)
        setHasEvaluated(false);
        // Fall through ke logika normal input
      }
    }

    // Validasi dan handling koma/desimal
    // Cegah lebih dari satu koma per bilangan
    // Jika koma setelah operator, tambahkan "0." otomatis
    if (charValue === ".") {
      if (currentNumberHasDot) return; // Sudah ada koma, jangan tambah lagi
      let newExpr;
      if (endsWithOperator) {
        newExpr = `${expr}0.`; // Contoh: "5+" → "5+0."
      } else if (expr === "0") {
        newExpr = "0.";
      } else {
        newExpr = `${expr}.`;
      }
      setExpr(newExpr);
      return;
    }

    // Validasi dan handling operator (+, -, *, /)
    // Cegah operator di awal kecuali "-" untuk unary minus
    // Jika ada operator sebelumnya, ganti dengan operator baru
    // Hapus titik di akhir sebelum menambah operator
    if (operations.includes(charValue)) {
      if (expr === "0" && charValue !== "-") return; // Cegah operator di awal, kecuali -
      if (expr === "0" && charValue === "-") {
        setExpr("-");
        return;
      }

      let trimmedExpr = expr;
      if (endsWithDot) {
        trimmedExpr = expr.slice(0, -1); // Hapus titik
      }

      if (trimmedExpr === "") {
        trimmedExpr = "0";
      }

      // Jika expression sudah berakhir dengan operator, ganti operator lama dengan baru
      if (operations.includes(trimmedExpr.at(-1))) {
        trimmedExpr = trimmedExpr.slice(0, -1);
      }

      const newExpr = `${trimmedExpr}${charValue}`;
      setExpr(newExpr);
      return;
    }

    // Validasi dan handling angka "0"
    // Cegah leading zero (00, 000, dst) kecuali setelah operator atau sebagai 0.x
    // Izinkan "0" setelah operator
    if (charValue === "0") {
      if (expr === "0") return; // Expression masih "0", jangan tambah lagi
      if (endsWithOperator) {
        setExpr(`${expr}0`); // Setelah operator, boleh tambah 0
        return;
      }
      // Jika bilangan saat ini hanya "0" dan belum ada koma, jangan tambah 0
      if (currentNumberIsZero && !currentNumberHasDot) return;
      setExpr(`${expr}0`);
      return;
    }

    // Handling angka 1-9
    // Jika expression masih "0", ganti dengan angka baru (bukan tambah)
    // Jika bilangan saat ini "0" tanpa koma, ganti 0 dengan angka baru
    if (numbersNotZero.includes(charValue)) {
      if (expr === "0") {
        setExpr(charValue);
        return;
      }
      // Ganti leading zero jika ada: "0" → "3" (bukan "03")
      if (currentNumberIsZero && !currentNumberHasDot) {
        setExpr(`${expr.slice(0, -1)}${charValue}`);
        return;
      }
      // Normal: tambah angka
      setExpr(`${expr}${charValue}`);
      return;
    }

    // Fallback: untuk input yang tidak termasuk kategori di atas
    setExpr(`${expr}${charValue}`);
    setHasEvaluated(false);
  };

  return (
    <main className="container flex justify-center mx-auto w-full min-h-screen p-4">
      <div className="bg-[#b9dfe4] min-h-2/3 sm:w-2/3 w-full rounded-2xl shadow-xl">
        <h1 className="font-bold m-4 text-2xl">Kalkulator MBG</h1>

        {/* Display area: menampilkan expression dan hasil */}
        <div className="h-24 max-w-full bg-white rounded-xl mx-4 ">
          {/* Baris atas: expression.display (user-friendly format) */}
          <p className="text-gray-500 m-2 mt-3 pt-2 text-end text-md">
            {expression.display}
          </p>
          {/* Baris bawah: result dan tombol AC (All Clear) */}
          <span className="flex m-2 -mt-1 justify-end text-5xl font-semibold">
            <p>{result}</p>
            <span className="mx-2"></span>
            <button
              className="text-base font-extralight border border-gray-400 rounded-2xl mt-2 px-2"
              onClick={() => {
                // Reset expression dan result ke state awal
                setExpression({ display: "0", value: "0" });
                setResult("0");
              }}
            >
              {/* ⌫ */}
              AC
            </button>
          </span>
        </div>

        {/* Grid tombol: map setiap kolom dan baris */}
        <div className="flex max-w-full min-h-2/3 gap-2 my-2 mx-4">
          {keys.map((col, cId) => (
            <div
              className="grow shrink text-center flex flex-col gap-2"
              key={cId}
            >
              {col.map((row, id) => (
                <button
                  // Styling: tombol "=" biru, sisanya abu-abu
                  className={`flex-1 font-semibold text-3xl ${row.value === "=" ? "bg-blue-600 text-gray-50 hover:bg-blue-700" : "bg-gray-200 hover:bg-gray-300"} rounded-md transition`}
                  key={`${cId} ${id}`}
                  onClick={() => {
                    // Setiap tombol memanggil appendExpression dengan value-nya
                    appendExpression(row.value);
                  }}
                >
                  {/* Tampilkan display (user-friendly), bukan value internal */}
                  {row.display}
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

export default App;
