import React from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function Watermark() {
  const { user } = useAuth();

  return (
    <div className="watermark-container">
      <div className="watermark">
        <div>EduTalks</div>
        <div>{user?.name || 'Student'}</div>
      </div>
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
        }

        .watermark {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(-45deg);
          font-size: 3rem;
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
