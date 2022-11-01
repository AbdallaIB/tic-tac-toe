const colors = [
  'hsl(0,100%,50%)',
  'hsl(11,100%,50%)',
  'hsl(22,100%,50%)',
  'hsl(33,100%,50%)',
  'hsl(45,100%,50%)',
  'hsl(56,100%,50%)',
  'hsl(67,100%,50%)',
  'hsl(78,100%,50%)',
  'hsl(90,100%,50%)',
  'hsl(101,100%,50%)',
  'hsl(112,100%,50%)',
  'hsl(123,100%,50%)',
  'hsl(135,100%,50%)',
  'hsl(146,100%,50%)',
  'hsl(157,100%,50%)',
  'hsl(168,100%,50%)',
  'hsl(180,100%,50%)',
  'hsl(191,100%,50%)',
  'hsl(202,100%,50%)',
  'hsl(213,100%,50%)',
  'hsl(225,100%,50%)',
  'hsl(236,100%,50%)',
  'hsl(247,100%,50%)',
  'hsl(258,100%,50%)',
  'hsl(270,100%,50%)',
  'hsl(281,100%,50%)',
  'hsl(292,100%,50%)',
  'hsl(303,100%,50%)',
  'hsl(315,100%,50%)',
  'hsl(326,100%,50%)',
  'hsl(337,100%,50%)',
  'hsl(348,100%,50%)',
];

export const generateColor = (currentColors: string[]): string => {
  let randomColor = colors[Math.floor(Math.random() * colors.length)];
  do {
    randomColor = colors[Math.floor(Math.random() * colors.length)];
  } while (currentColors.indexOf(randomColor) !== -1);
  return randomColor;
};
