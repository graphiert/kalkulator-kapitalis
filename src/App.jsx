import { useState } from "react";

function App() {
  const [expression, setExpression] = useState({ display: "0", value: "0" });
  const [result, setResult] = useState("0");

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

  const displayOperations = [...keys[3]];
  const operations = displayOperations.map((el) => el.value);
  const replaceValueToDisplay = (expr) => {
    let newExpr = displayOperations.reduce((current, rule) => {
      return current.replace(rule.value, rule.display);
    }, expr);
    return newExpr;
  };

  const evaluateExpression = (expr) => {
    const sanitized = expr.replace(/[^0-9+\-*/.]/g, "");
    if (!sanitized) return;
    if (operations.includes(sanitized.slice(-1))) return;
    try {
      const result = Function('"use strict";return (' + sanitized + ")")();
      return String(result);
    } catch (e) {
      return "Error";
    }
  };

  const appendExpression = (charValue) => {
    if (charValue === "=") {
      const result = evaluateExpression(expression.value);
      setResult(result);
      return;
    }

    if (charValue === ".") {
      let exprToSet;
      if (expression.value.at(-1) == "0") {
        exprToSet = {
          display: String(replaceValueToDisplay(charValue)),
          value: String(charValue),
        };
      }
      if (operations.includes(expression.value.at(-1))) {
        let newExpr = `${expression.value}0${charValue}`;
        exprToSet = {
          display: String(replaceValueToDisplay(newExpr)),
          value: String(newExpr),
        };
      } else {
        let newExpr = `${expression.value}${charValue}`;
        exprToSet = {
          display: String(replaceValueToDisplay(newExpr)),
          value: String(newExpr),
        };
      }
      setExpression(exprToSet);
      return;
    }

    if (expression.value === "0") {
      if (operations.includes(charValue)) return;
      let exprToSet = {
        display: String(replaceValueToDisplay(charValue)),
        value: String(charValue),
      };
      setExpression(exprToSet);
      return;
    }

    if (
      expression.value.at(-2) === "0" &&
      expression.value.at(-1) === "." &&
      operations.includes(charValue)
    ) {
      let newExpr = expression.value.slice(0, -2);
      newExpr = `${newExpr}${charValue}`;
      let exprToSet = {
        display: String(replaceValueToDisplay(newExpr)),
        value: String(newExpr),
      };
      setExpression(exprToSet);
      return;
    }

    if (
      operations.includes(expression.value.at(-1)) &&
      operations.includes(charValue)
    ) {
      let newExpr = expression.value.slice(0, -1);
      newExpr = `${newExpr}${charValue}`;
      let exprToSet = {
        display: String(replaceValueToDisplay(newExpr)),
        value: String(newExpr),
      };
      setExpression(exprToSet);
      return;
    }

    let newExpr = `${expression.value}${charValue}`;
    let exprToSet = {
      display: String(replaceValueToDisplay(newExpr)),
      value: String(newExpr),
    };
    setExpression(exprToSet);
  };

  return (
    <main className="container flex justify-center mx-auto w-full min-h-screen p-4">
      <div className="bg-[#b9dfe4] min-h-2/3 sm:w-2/3 w-full rounded-2xl shadow-xl">
        <h1 className="font-bold m-4 text-2xl">Kalkulator MBG</h1>
        <div className="h-24 max-w-full bg-white rounded-xl mx-4 ">
          <p className="text-gray-500 m-2 mt-3 pt-2 text-end text-md">
            {expression.display}
          </p>
          <span className="flex m-2 -mt-1 justify-end text-5xl font-semibold">
            <p>{result}</p>
            <span className="mx-2"></span>
            <button
              className="text-base font-extralight border border-gray-400 rounded-2xl mt-2 px-2"
              onClick={() => {
                setExpression({ display: "0", value: "0" });
                setResult("0");
              }}
            >
              {/* ⌫ */}
              AC
            </button>
          </span>
        </div>
        <div className="flex max-w-full min-h-2/3 gap-2 my-2 mx-4">
          {keys.map((col, cId) => (
            <div
              className="grow shrink text-center flex flex-col gap-2"
              key={cId}
            >
              {col.map((row, id) => (
                <button
                  className={`flex-1 font-semibold text-3xl ${row.value === "=" ? "bg-blue-600 text-gray-50 hover:bg-blue-700" : "bg-gray-200 hover:bg-gray-300"} rounded-md transition`}
                  key={`${cId} ${id}`}
                  onClick={() => {
                    appendExpression(row.value);
                  }}
                >
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
