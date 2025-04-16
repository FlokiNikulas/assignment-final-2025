import axios from 'axios';
import type { NextPage } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import styles from '../styles/Home.module.css';
import { EMOJI, Sign } from '../utils/constants';

const Home: NextPage = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [secondPlayerName, setSecondPlayerName] = useState('');

  const router = useRouter();

  async function createGame() {
    try {
      const { data } = await axios.post('/api/new', {
        playerName,
        secondPlayerName,
      });
      return data.id;
    } catch (error) {
      throw error;
    }
  }

  return (
    <>
      <h1 className={styles.title}>Tic Tac Toe #️⃣</h1>
      <div className={styles.grid}>
        <form
          className={styles.form}
          onSubmit={async (event) => {
            event.preventDefault();
            setIsCreating(true);
            try {
              const id = await createGame();

              router.push('/game/' + id);
            } catch (error) {
              console.log('Failed to create ', error);
            } finally {
              setIsCreating(false);
            }
          }}
        >
          <input
            className={styles.input}
            value={playerName}
            placeholder={`${EMOJI[Sign.X]} Your Name (Optional)`}
            onChange={(event) => setPlayerName(event.target.value)}
          />
          <input
            className={styles.input}
            value={secondPlayerName}
            placeholder={`${EMOJI[Sign.O]} Opponent Name (Optional)`}
            onChange={(event) => setSecondPlayerName(event.target.value)}
          />
          <button
            className={styles.startButton}
            disabled={isCreating}
            type="submit"
          >
            Start Game
          </button>
        </form>
        <Link href="/games">See all games</Link>
      </div>
    </>
  );
};

export default Home;
