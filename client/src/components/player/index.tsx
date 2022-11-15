interface PlayerData {
  color: string;
  symbol: 'x' | 'o';
  username?: string;
  isComputer: boolean;
  isPlayer1: boolean;
}

export const O = (color: string) => {
  return (
    <span>
      <i className="bx bx-circle text-7xl" style={{ color }}></i>
    </span>
  );
};

export const X = (color: string) => {
  return (
    <span>
      <i className="bx bx-x" style={{ color, fontSize: '5.5rem' }}></i>
    </span>
  );
};

export const PlayerCard = ({ color, symbol, username, isComputer, isPlayer1 }: PlayerData) => {
  return (
    <div className="flex items-center">
      <div className="bg-main_dark w-44 rounded-md text-white p-4 h-full text-center text-xl font-semibold flex items-center flex-col justify-around">
        <div className="flex justify-center" style={{ width: '72px', height: '72px' }}>
          {symbol === 'x' ? X(color) : O(color)}
        </div>
        {isPlayer1 && <span style={{ wordBreak: 'break-word' }}>{username || 'Player 1'}</span>}
        {!isPlayer1 && (
          <span style={{ wordBreak: 'break-word' }}>{isComputer ? 'Computer' : username || 'Player 2'}</span>
        )}
      </div>
    </div>
  );
};
