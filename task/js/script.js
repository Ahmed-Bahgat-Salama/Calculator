const display = document.getElementById("display");
const keys = document.querySelector(".keys");
let a = null;
let b = null;
let op = null;
let justEq = false;
let mem = 0;

function setDisplay(v) {
  const s = String(v);
  display.textContent = s.length > 16 ? Number(v).toExponential(8) : s;
}

function current() {
  return Number(display.textContent.replace(/[^0-9.\-e]/g, ""));
}

function clearAll() {
  a = null; b = null; op = null; justEq = false; setDisplay(0);
}

function applyUnary(kind) {
  let x = current();
  if (kind === "sqrt") x = Math.sqrt(x);
  if (kind === "square") x = x * x;
  if (kind === "inv") x = x === 0 ? NaN : 1 / x;
  if (kind === "neg") x = -x;
  if (kind === "percent") x = x / 100;
  setDisplay(x);
  justEq = false;
}

function compute(x, y, o) {
  if (o === "+") return x + y;
  if (o === "−") return x - y;
  if (o === "×") return x * y;
  if (o === "÷") return y === 0 ? NaN : x / y;
  return y;
}

keys.addEventListener("click", e => {
  const btn = e.target.closest("button");
  if (!btn) return;
  const act = btn.dataset.action;

  if (act === "digit") {
    const d = btn.textContent.trim();
    if (justEq || display.textContent === "0" || (op && b === null)) {
      setDisplay(d);
      if (op && b === null) b = 0;
    } else {
      setDisplay(display.textContent + d);
    }
    justEq = false;
    return;
  }

  if (act === "dot") {
    if (!display.textContent.includes(".")) setDisplay(display.textContent + ".");
    return;
  }

  if (act === "c") { clearAll(); return; }
  if (act === "ce") { setDisplay(0); b = null; return; }
  if (act === "backspace") {
    let s = display.textContent;
    s = s.length > 1 ? s.slice(0, -1) : "0";
    if (s === "-") s = "0";
    setDisplay(s);
    return;
  }

  if (act === "neg" || act === "sqrt" || act === "square" || act === "inv" || act === "percent") {
    applyUnary(act);
    return;
  }

  if (act === "op") {
    const nextOp = btn.dataset.op;
    if (op && b !== null && !justEq) {
      const res = compute(a ?? 0, current(), op);
      setDisplay(res);
      a = res;
      b = null;
    } else {
      a = current();
    }
    op = nextOp;
    justEq = false;
    return;
  }

  if (act === "eq") {
    if (op === null) return;
    if (b === null || justEq) {
      const res = compute(current(), b ?? current(), op);
      setDisplay(res);
      a = res;
    } else {
      b = current();
      const res = compute(a ?? 0, b, op);
      setDisplay(res);
      a = res;
    }
    justEq = true;
    return;
  }

  if (act === "mplus") { mem += current(); return; }
  if (act === "mminus") { mem -= current(); return; }
  if (act === "ms") { mem = current(); return; }
});

document.addEventListener("keydown", e => {
  const k = e.key;
  if (/\d/.test(k)) {
    const el = [...keys.querySelectorAll('button[data-action="digit"]')].find(b => b.textContent.trim() === k);
    if (el) el.click();
  } else if (k === ".") {
    keys.querySelector('button[data-action="dot"]').click();
  } else if (k === "+" || k === "-" || k === "*" || k === "/") {
    const map = { "+": "+", "-": "−", "*": "×", "/": "÷" };
    const el = [...keys.querySelectorAll('button[data-action="op"]')].find(b => b.dataset.op === map[k]);
    if (el) el.click();
  } else if (k === "Enter" || k === "=") {
    keys.querySelector('button[data-action="eq"]').click();
  } else if (k === "Backspace") {
    keys.querySelector('button[data-action="backspace"]').click();
  } else if (k.toLowerCase() === "c") {
    keys.querySelector('button[data-action="c"]').click();
  }
});
