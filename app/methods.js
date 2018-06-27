// Empty Object Checker
let isObjectEmpty = object => {
  if (object) return Object.keys(object).length === 0;
};

// Exports
module.exports = { isObjectEmpty: isObjectEmpty };
