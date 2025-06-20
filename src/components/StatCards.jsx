import React, { useState, useEffect, useRef } from 'react';

const cards = [
  { name: 'Total Users', value: '1,245' },
  { name: 'Active Sessions', value: '87' },
  { name: 'Reports', value: '12' }
];

const CARD_HEIGHT = 100; // px, so 2 cards = 200px

export default function StatCards() {
  const [current, setCurrent] = useState(1); // Start at 1 (first real card)
  const [isAnimating, setIsAnimating] = useState(true);
  const [jumping, setJumping] = useState(false);
  const cyclicCards = [cards[cards.length - 1], ...cards, cards[0], cards[1]]; // Add one more for 2 visible
  const transitionRef = useRef();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent(prev => prev + 1);
      setIsAnimating(true);
      setJumping(false);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Use onTransitionEnd for seamless jump
  const handleTransitionEnd = () => {
    if (current === 0) {
      setIsAnimating(false);
      setJumping(true);
      setCurrent(cyclicCards.length - 4); // jump to last real pair
    } else if (current === cyclicCards.length - 2) {
      setIsAnimating(false);
      setJumping(true);
      setCurrent(1);
    }
  };

  // Re-enable animation after jump
  useEffect(() => {
    if (!isAnimating && jumping) {
      const id = setTimeout(() => setIsAnimating(true), 20);
      return () => clearTimeout(id);
    }
  }, [isAnimating, jumping]);

  return (
    <div
      className="relative overflow-hidden w-full h-[200px] max-w-md mx-auto"
      style={{ height: 2 * CARD_HEIGHT }}
    >
      <div
        ref={transitionRef}
        className={isAnimating ? 'transition-transform duration-700 ease-in-out' : ''}
        style={{ transform: `translateY(-${current * CARD_HEIGHT}px)` }}
        onTransitionEnd={handleTransitionEnd}
      >
        {cyclicCards.map((card, idx) => (
          <div
            key={idx}
            className="rounded-2xl shadow-lg p-4 flex flex-col items-start w-full bg-gradient-to-b from-[#5041BC] to-[#6C63FF] text-white border-white border-2 mb-2"
            style={{ height: CARD_HEIGHT - 8 }}
          >
            <span className="text-base font-semibold mb-1">{card.name}</span>
            <span className="text-2xl font-bold">{card.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
} 