import React from 'react';

export default function TestPage() {
    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'pink',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px'
        }}>
            <h1 style={{ color: 'red', fontSize: '32px' }}>TEST PAGE</h1>
            <p>If you can see this, basic rendering works!</p>
            <button
                onClick={() => alert('Button clicked!')}
                style={{
                    padding: '20px',
                    fontSize: '24px',
                    background: 'blue',
                    color: 'white',
                    border: 'none',
                    cursor: 'pointer',
                    marginTop: '20px'
                }}
            >
                Click Me
            </button>
        </div>
    );
}