import React, { useState } from 'react';

const MyComponent = () => {
  const [isTipVisible, setIsTipVisible] = useState(false);

  // Your function integrated here
  const showTips = () => {
    setIsTipVisible(!isTipVisible);
  };

  return (
    <div style={{ padding: '50px' }}>
      <div style={{ position: 'relative', display: 'inline-block' }}>
        
        {/* Trigger */}
        <button onClick={showTips}>
          Click for info
        </button>

        {/* Tooltip UI */}
        {isTipVisible && (
          <div style={{
            position: 'absolute',
            bottom: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: '#333',
            color: '#fff',
            padding: '5px 10px',
            borderRadius: '4px',
            fontSize: '12px',
            marginBottom: '10px',
            whiteSpace: 'nowrap'
          }}>
            This is your tip!
          </div>
        )}
      </div>
    </div>
  );
};