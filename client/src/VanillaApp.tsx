// Pure vanilla React without any hooks to test if useRef is the issue
import React from 'react';

class VanillaApp extends React.Component {
  render() {
    return React.createElement('div', { 
      style: { padding: '20px', fontFamily: 'Arial, sans-serif' } 
    }, [
      React.createElement('h1', { key: 'title' }, 'Vanilla React Test'),
      React.createElement('p', { key: 'desc' }, 'This is a class component without any hooks'),
      React.createElement('button', { 
        key: 'btn',
        onClick: () => alert('Working!')
      }, 'Test Button')
    ]);
  }
}

export default VanillaApp;