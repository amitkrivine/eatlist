import React from 'react';
import '../style/hover-badge.css';

interface HoverBadgeProps {
  badgeContent: React.ReactNode;
  hoverText: string;
}

const HoverBadge: React.FC<HoverBadgeProps> = ({ badgeContent, hoverText }) => {
  return (
    <div className="badge-container">
      {badgeContent}
      <span className="badge-tooltip">{hoverText}</span>
    </div>
  );
};

export default HoverBadge;