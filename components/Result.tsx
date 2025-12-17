import React from 'react';
import { Button } from './Button';
import { WINNING_SCORE, COUPON_VALUE } from '../constants';

interface ResultProps {
  score: number;
  onRestart: () => void;
}

export const Result: React.FC<ResultProps> = ({ score, onRestart }) => {
  const isWinner = score >= WINNING_SCORE;

  return (
    <div className="flex flex-col items-center justify-center h-full w-full p-6 bg-gradient-to-b from-indigo-500 to-purple-800 text-center space-y-8">
      
      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-white">遊戲結束</h2>
        <div className="text-6xl font-black text-white drop-shadow-lg">
          {score} <span className="text-2xl font-medium">分</span>
        </div>
      </div>

      {isWinner ? (
        <div className="bg-yellow-500 text-white p-6 rounded-2xl shadow-xl transform rotate-1 border-4 border-yellow-300 w-full max-w-xs relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-white opacity-10 rotate-45 transform translate-y-10"></div>
          <h3 className="text-2xl font-bold mb-2">🎉 恭喜達成！</h3>
          <p className="mb-4">你太厲害了！這是你的獎勵</p>
          <div className="bg-white text-slate-900 font-mono font-bold text-xl py-3 px-4 rounded-lg border-2 border-dashed border-slate-300">
            ${COUPON_VALUE} 折價券
          </div>
          <p className="text-xs mt-2 opacity-80">*截圖此畫面以兌換</p>
        </div>
      ) : (
        <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 w-full max-w-xs">
          <div className="text-5xl mb-4">💪</div>
          <h3 className="text-xl font-bold text-white mb-2">再接再厲！</h3>
          <p className="text-indigo-200">
            只差一點點了！<br/>
            目標是 {WINNING_SCORE} 分喔。
          </p>
        </div>
      )}

      <Button onClick={onRestart} variant={isWinner ? 'secondary' : 'primary'} className="w-full max-w-xs">
        {isWinner ? '再玩一次' : '不服輸，再玩一次'}
      </Button>
    </div>
  );
};