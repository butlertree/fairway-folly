import React from 'react';
export function BirdCelebration({eagle=false}){return <div className={'bird-celebration '+(eagle?'eagle':'birdie')} role="img" aria-label={eagle?'An eagle swoops across the green':'A songbird flies in to celebrate your birdie'}><svg viewBox="0 0 240 140" aria-hidden="true">
 <g className="bird-left-wing"><path d="M119 82 Q74 19 8 14 L30 41 15 40 43 61 30 61 61 83 52 87 Q89 100 119 93" fill={eagle?'#65462d':'#3d8b7d'} stroke="#283e32" strokeWidth="2"/><path d="M109 78 Q63 42 30 33" fill="none" stroke={eagle?'#b59768':'#91d6ad'} strokeWidth="5"/></g>
 <g className="bird-right-wing"><path d="M121 82 Q166 19 232 14 L210 41 225 40 197 61 210 61 179 83 188 87 Q151 100 121 93" fill={eagle?'#65462d':'#3d8b7d'} stroke="#283e32" strokeWidth="2"/><path d="M131 78 Q177 42 210 33" fill="none" stroke={eagle?'#b59768':'#91d6ad'} strokeWidth="5"/></g>
 <path d="M109 99 L99 132 120 124 141 132 131 99" fill={eagle?'#eee9d9':'#32736b'} stroke="#334738" strokeWidth="2"/>
 <ellipse cx="120" cy="84" rx="18" ry="31" fill={eagle?'#755439':'#e6b871'}/>
 <ellipse cx="120" cy="53" rx="20" ry="22" fill={eagle?'#fff7df':'#429987'}/>
 <path d="M134 48 L158 57 135 64Z" fill="#e9b652" stroke="#8d692e" strokeWidth="1.5"/>
 <circle cx="128" cy="48" r="3.5" fill="#152d26"/><circle cx="129" cy="47" r="1" fill="white"/>
 </svg></div>}
