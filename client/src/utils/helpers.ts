import { GameConfig, Player, Scores } from '@lib/store/game';

export const PageTitles = {
  '/join': 'Join | Tic Tac Toe',
  '/lobby': 'Lobby | Tic Tac Toe',
  '/': 'Tic Tac Toe',
  '/online': 'Online | Tic Tac Toe',
  '/offline': 'Offline | Tic Tac Toe',
};

export const formatFinalScore = (scores: Scores, gameConfig: GameConfig, otherPlayer: Player) => {
  const { p1, p2 } = scores;
  const { playerMode } = gameConfig;
  const pointsDiff = Math.abs(p1 - p2);
  const points = pointsDiff > 1 ? 'points' : 'point';
  if (p1 === 0 && p2 === 0) return { msg: 'Game ended with no wins!' };
  if (playerMode === 'single') {
    if (p1 > p2) return { msg: `You won by ${pointsDiff} ${points}!`, score: p1 };
    if (p1 < p2) return { msg: `Computer won by ${pointsDiff} ${points}!`, score: p2 };
    return { msg: 'Game ended in a draw!', score: 0 };
  } else if (playerMode === 'multi') {
    if (p1 > p2) return { msg: `Player 1 won by ${pointsDiff} ${points}!`, score: p1 };
    if (p1 < p2) return { msg: `Player 2 won by ${pointsDiff} ${points}!`, score: p2 };
    return { msg: 'Game ended in a draw!', score: 0 };
  }
  if (p1 > p2) return { msg: `You won by ${pointsDiff} ${points}!`, score: p1 };
  if (p1 < p2) return { msg: `${otherPlayer.username} won by ${pointsDiff} ${points}!`, score: p2 };
  return { msg: 'Game ended in a draw!', score: 0 };
};
