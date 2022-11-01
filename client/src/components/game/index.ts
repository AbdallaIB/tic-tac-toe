import _ from 'lodash';

export const winLines = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

export const winningCombinationClasses = (winnerIndexes: number[]) => {
  const combinations = [
    // Rows
    { combo: [0, 1, 2], class: 'row-1' },
    { combo: [3, 4, 5], class: 'row-2' },
    { combo: [6, 7, 8], class: 'row-3' },
    // Columns
    { combo: [0, 3, 6], class: 'column-1' },
    { combo: [1, 4, 7], class: 'column-2' },
    { combo: [2, 5, 8], class: 'column-3' },
    // Diagonals
    { combo: [0, 4, 8], class: 'diagonal-1' },
    { combo: [2, 4, 6], class: 'diagonal-2' },
  ];
  let className = '';
  combinations.forEach((combination) => {
    const isEqual = _.isEqual(combination.combo.sort(), winnerIndexes.sort());
    if (isEqual) {
      className = combination.class;
    }
  });
  return className;
};
