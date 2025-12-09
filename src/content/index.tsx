import React from 'react';
import ReactDOM from 'react-dom/client';
import ContentScript from './ContentScript';

console.log('EldenMessage content script loaded');

// Reactアプリをマウントするコンテナを作成
const container = document.createElement('div');
container.id = 'elden-message-root';
document.body.appendChild(container);

// Reactアプリをマウント
const root = ReactDOM.createRoot(container);
root.render(
  <React.StrictMode>
    <ContentScript />
  </React.StrictMode>
);
