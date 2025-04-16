import React from 'react';
import styles from '../styles/Cell.module.css';
import { EMOJI, Sign } from '../utils/constants';

type Props = {
  onClick: () => void;
  number: number;
  value: Sign | string;
  readOnly?: boolean;
};

export default function Cell({ onClick, number, value, readOnly }: Props) {
  return (
    <div
      className={readOnly ? styles.miniCell : styles.cell}
      onClick={onClick}
      data-testid={`cell-${number}`}
    >
      {value === Sign.X && EMOJI[Sign.X]}
      {value === Sign.O && EMOJI[Sign.O]}
    </div>
  );
}
