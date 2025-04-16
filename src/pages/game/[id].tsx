import { useEffect, useState } from 'react';
import Board from '../../components/Board';
import axios from 'axios';
import styles from '../../styles/Home.module.css';
import { Game } from '../../lib/gameStore';
import { BoardHeader } from '../../components/BoardHeader';
import { useRouter } from 'next/router';

const GamePage = () => {
  const [game, setGame] = useState<Game>();
  const [winner, setWinner] = useState<string>();
  const router = useRouter();

  useEffect(() => {
    async function fetchGame() {
      const id = router.query.id as string;
      if (!id || game) return;
      const { data } = await axios.get(`/api/game/${id}`);
      setGame(data);
    }
    fetchGame();
  }, [router.query.id]);

  if (!game) {
    return (
      <div>
        <h1 className={styles.title}>Loading..🔃</h1>
      </div>
    );
  }

  return (
    <>
      <BoardHeader game={game} />
      <div className={styles.grid}>
        <Board
          moves={game.moves}
          onMove={async (moves) => {
            try {
              const { data } = await axios.put(`/api/game/${router.query.id}`, {
                moves,
              });
              setGame(data);

              if (data.winner && data.winner !== winner) {
                setWinner(data.winner);
              }
            } catch (error) {
              console.error('Error updating game:', error);
            }
          }}
        />
      </div>
    </>
  );
};

export default GamePage;
