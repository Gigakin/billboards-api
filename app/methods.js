// Empty Object Checker
let isObjectEmpty = object => {
  if (object) return Object.keys(object).length === 0;
};

// Conversion
let calculateSqFt = (value, unit) => {
  const ins = 0.0833333333;
  const cms = 0.032808399;
  const mts = 3.280839895;
  const fts = 1;
  if (value) {
    if (!unit) unit = "feets";
    unit = unit.toString().toLowerCase();
    if (unit == 2) return (value * ins).toFixed(2);
    if (unit == 4) return (value * cms).toFixed(2);
    if (unit == 3) return (value * mts).toFixed(2);
    if (unit == 1) return (value * fts).toFixed(2);
    return value;
  }
};

// Exports
module.exports = {
  isObjectEmpty: isObjectEmpty,
  calculateSqFt: calculateSqFt
};
