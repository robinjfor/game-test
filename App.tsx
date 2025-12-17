import React, { useState } from 'react';
import { Home } from './components/Home';
import { Game } from './components/Game';
import { Result } from './components/Result';
import { GameScreen } from './types';

const App: React.FC = () => {
  const [screen, setScreen] = useState<GameScreen>(GameScreen.HOME);
  const [lastScore, setLastScore] = useState(0);

  const startGame = () => {
    setScreen(GameScreen.PLAYING);
  };

  const finishGame = (score: number) => {
    setLastScore(score);
    setScreen(GameScreen.RESULT);
  };

  const restartGame = () => {
    setScreen(GameScreen.HOME);
  };

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-gray-900">
      {/* Mobile Container Frame */}
      <div className="w-full h-full md:max-w-[480px] md:max-h-[850px] bg-white md:rounded-3xl shadow-2xl overflow-hidden relative">
        {screen === GameScreen.HOME && <Home onStart={startGame} />}
        {screen === GameScreen.PLAYING && <Game onFinish={finishGame} />}
        {screen === GameScreen.RESULT && <Result score={lastScore} onRestart={restartGame} />}
      </div>
    </div>
  );
};

export default App;