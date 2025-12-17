import React from 'react';
import { Button } from './Button';
import { WINNING_SCORE, COUPON_VALUE } from '../constants';

interface HomeProps {
  onStart: () => void;
}

export const Home: React.FC<HomeProps> = ({ onStart }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full p-6 bg-gradient-to-b from-sky-400 to-blue-600 text-center space-y-6">
      <div className="space-y-2">
        <h1 className="text-4xl font-extrabold text-white drop-shadow-md">
          接住美味
          <br />
          <span className="text-yellow-300">大作戰</span>
        </h1>
        <p className="text-blue-100 text-sm">Challenge for Coupon!</p>
      </div>

      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 w-full max-w-sm">
        <h2 className="text-xl font-bold mb-4 text-yellow-200">🎮 遊戲玩法</h2>
        <ul className="text-left space-y-3 text-white/90 text-sm leading-relaxed">
          <li className="flex items-start">
            <span className="mr-2 text-lg">👐</span>
            <span>左右移動雙手，接住美食！</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2 text-lg">🍔</span>
            <span>接住美味食物 <b>+20分</b></span>
          </li>
          <li className="flex items-start">
            <span className="mr-2 text-lg">😈</span>
            <span>小心惡魔丟下的陷阱！</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2 text-lg">❌</span>
            <span>接到 X 扣 <b>5分</b>，骷髏頭 扣 <b>10分</b></span>
          </li>
          <li className="flex items-start">
            <span className="mr-2 text-lg">🔫</span>
            <span><b>點擊畫面</b>發射子彈消除壞東西！</span>
          </li>
        </ul>
      </div>

      <div className="bg-yellow-400/20 rounded-xl p-4 border border-yellow-400/50 animate-pulse">
        <p className="font-bold text-yellow-100">
          🏆 挑戰目標：超過 {WINNING_SCORE} 分
        </p>
        <p className="text-yellow-300 font-extrabold text-xl">
          獲得 {COUPON_VALUE} 元折價券！
        </p>
      </div>

      <Button onClick={onStart} className="w-full max-w-xs shadow-xl shadow-blue-900/20">
        開始遊戲 (30秒)
      </Button>
    </div>
  );
};