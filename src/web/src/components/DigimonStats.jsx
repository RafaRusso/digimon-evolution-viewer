// src/components/DigimonStats.jsx

import React from 'react';
import { Heart, Zap, Shield, Sword, Brain, Wind } from 'lucide-react';

// Mapeamento de stats com cores mais vibrantes e específicas para light/dark mode
const statDetails = {
  hp: { Icon: Heart, color: 'text-red-500 dark:text-red-400', label: 'HP' },
  sp: { Icon: Zap, color: 'text-blue-500 dark:text-blue-400', label: 'SP' },
  atk: { Icon: Sword, color: 'text-orange-500 dark:text-orange-400', label: 'ATK' },
  def: { Icon: Shield, color: 'text-green-500 dark:text-green-400', label: 'DEF' },
  int: { Icon: Brain, color: 'text-purple-500 dark:text-purple-400', label: 'INT' },
  spd: { Icon: Wind, color: 'text-yellow-500 dark:text-yellow-400', label: 'SPD' },
};

function StatItem({ statName, value }) {
  const { Icon, color, label } = statDetails[statName];
  return (
    <div className="flex items-center justify-between text-sm bg-gray-100/50 dark:bg-white/5 px-3 py-2 rounded-lg">
      <div className="flex items-center gap-2">
        <Icon className={`${color} w-5 h-5`} />
        <span className="font-semibold text-gray-600 dark:text-gray-300">{label}</span>
      </div>
      <span className="font-bold text-lg text-gray-800 dark:text-gray-100">{value}</span>
    </div>
  );
}

export default function DigimonStats({ stats }) {
  if (!stats || Object.keys(stats).length === 0) {
    return null;
  }

  return (
    <div className="mt-4">
      <h4 className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-3 px-1">
        Base Stats (Lv. 1)
      </h4>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <StatItem statName="hp" value={stats.hp} />
        <StatItem statName="sp" value={stats.sp} />
        <StatItem statName="atk" value={stats.atk} />
        <StatItem statName="def" value={stats.def} />
        <StatItem statName="int" value={stats.int} />
        <StatItem statName="spd" value={stats.spd} />
      </div>
    </div>
  );
}
