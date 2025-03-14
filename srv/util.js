function processPath(value, path) {
    const pathArray = [...path] // Clone the array before modifying
    const prop = pathArray.shift();
    if (prop === undefined) {
      return value;
    } else {
      if (value[prop]) {
        return processPath(value[prop], pathArray);
      } else {
        return "";
      }
    }
  }
  
  // Given a string template formatted like a template literal,
  // and an object of values, return the modified string.
  function interpolateTemplate(template, args) {
    if (!template) return '';
    if (!args) return template;
  
    try {
      return Object.entries(args).reduce(
        (result, [arg, val]) => result.replace(`\${${arg}}`, `${val || ''}`),
        template,
      );
    } catch (error) {
      console.error('Error in template interpolation:', error);
      return template;
    }
  }
  
  module.exports = {
    processPath,
    interpolateTemplate
  }