import parseToInt from "./parseToInt";

export function calculateAverage(numbers) {
  if (numbers.length) {
    const numericNumbers = parseToInt(numbers);
    return (
      numericNumbers.reduce((sum, value) => sum + value, 0) /
      numericNumbers.length
    );
  }
  return 0;
}

export function calculateMedian(numbers) {
  if (numbers.length) {
    const numericNumbers = parseToInt(numbers);
    const sortedNumbers = numericNumbers.slice().sort((a, b) => a - b);

    const n = sortedNumbers.length;
    if (n % 2 === 1) {
      return sortedNumbers[Math.floor(n / 2)];
    } else {
      const middle1 = sortedNumbers[n / 2 - 1];
      const middle2 = sortedNumbers[n / 2];
      return (middle1 + middle2) / 2;
    }
  }
  return 0;
}

export function calculateStandardDeviation(numbers) {
  if (numbers.length) {
    const numericNumbers = parseToInt(numbers);

    const average = calculateAverage(numericNumbers);

    if (numericNumbers.length <= 1) {
      return 0;
    }

    const sumOfSquaredDifferences = numericNumbers.reduce(
      (sum, num) => sum + Math.pow(num - average, 2),
      0
    );

    const sampleVariance = sumOfSquaredDifferences / (numbers.length - 1);

    const sampleStandardDeviation = Math.sqrt(sampleVariance);

    return sampleStandardDeviation;
  }
  return 0;
}

export function calculateCoefficientOfVariation(numbers) {
  if (numbers.length) {
    const numericNumbers = parseToInt(numbers);

    const average = calculateAverage(numericNumbers);

    if (average === 0) {
      return 0;
    }

    const standardDeviation = calculateStandardDeviation(numericNumbers);

    const coefficientOfVariation = standardDeviation / average;

    return coefficientOfVariation;
  }
}
