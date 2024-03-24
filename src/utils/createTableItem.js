export default function createTableItem(keys, values) {
  const item = [];

  for (let i = 0; i < values.length; i++) {
    item[i] = {}
    for (let j = 0; j < values[i].length; j++) {
      item[i][keys[j]] = values[i][j];
    }
  }

  return item;
}
