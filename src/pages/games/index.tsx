import axios from 'axios';
import { useEffect, useState } from 'react';
import { GameRow } from '../../components/GameRow';
import { Game } from '../../lib/gameStore';

const GameList = () => {
  const [gameList, setGameList] = useState<Game[]>();
  useEffect(() => {
    getAllGames();
  }, []);

  async function getAllGames() {
    const { data } = await axios.get('/api/games');
    setGameList(data);
  }

  return (
    <div>
      <h1>🎱 All games</h1>
      <div>
        {gameList?.map((game) => {
          return <GameRow key={game.id} game={game} />;
        })}
      </div>
    </div>
  );
};

export default GameList;
