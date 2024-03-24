export function findNestedValue(data, parentKey = null) {
  if (Array.isArray(data) && data.length > 0) {
    // Если это массив, ищем первый непустой объект в нем и вызываем рекурсивно findNestedValue для него
    for (let i = 0; i < data.length; i++) {
      if (typeof data[i] === 'object' && Object.keys(data[i]).length > 0) {
        return findNestedValue(data[i], i);
      }
    }
  } else if (typeof data === 'object' && data !== null) {
    // Если это объект, ищем первый ключ и вызываем рекурсивно findNestedValue для его значения
    const keys = Object.keys(data);
    if (keys.length > 0) {
      return findNestedValue(data[keys[0]], keys[0]);
    }
  }
  // Если не массив и не объект, либо оба пусты, то это последний вложенный элемент
  return parentKey !== null ? `${parentKey}: ${data}` : data;
}
