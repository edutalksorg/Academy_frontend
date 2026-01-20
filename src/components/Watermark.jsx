import React from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function Watermark() {
  const { user } = useAuth();

  // Create an array of items to fill the screen
  // 4x5 grid should cover most screens
  const watermarks = Array.from({ length: 20 });

  return (
    <div className="watermark-container">
      {watermarks.map((_, index) => (
        <div key={index} className="watermark">
          <div>EduTalks</div>
          <div>{user?.name || 'Student'}</div>
        </div>
      ))}
      <style jsx="true">{`
        .watermark-container {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 9999;
          overflow: hidden;
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          grid-auto-rows: minmax(200px, 1fr);
          align-items: center;
          justify-items: center;
        }

        .watermark {
          transform: rotate(-30deg);
          font-size: 2rem;
          font-weight: bold;
          color: rgba(0, 0, 0, 0.05);
          white-space: nowrap;
          text-align: center;
          user-select: none;
          line-height: 1.5;
        }

        @media print {
          .watermark {
            color: rgba(0, 0, 0, 0.15);
          }
        }
      `}</style>
    </div>
  );
}
