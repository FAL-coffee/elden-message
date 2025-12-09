import { useEffect, useState } from 'react';
import MessageOverlay from './MessageOverlay';
import type { Message } from '@/shared/types';

function ContentScript() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [placementMode, setPlacementMode] = useState(false);
  const [pendingMessage, setPendingMessage] = useState<any>(null);
  const [showMessages, setShowMessages] = useState(true);

  useEffect(() => {
    // ページ読み込み時にメッセージを取得
    console.log('ContentScript mounted');
    loadMessages();

    // 設定を読み込む
    chrome.storage.local.get('showMessages', (result) => {
      if (typeof result.showMessages === 'boolean') {
        setShowMessages(result.showMessages);
      }
    });

    // Popupからのメッセージを受信
    const messageListener = (message: any, sender: any, sendResponse: any) => {
      console.log('ContentScript received message:', message);

      if (message.type === 'START_PLACEMENT_MODE') {
        console.log('Starting placement mode');
        setPlacementMode(true);
        setPendingMessage(message.data);
        sendResponse({ success: true });
        return true; // 非同期レスポンスを示す
      }

      if (message.type === 'TOGGLE_MESSAGES') {
        console.log('Toggling messages:', message.data.show);
        setShowMessages(message.data.show);
        sendResponse({ success: true });
        return true;
      }
    };

    chrome.runtime.onMessage.addListener(messageListener);

    return () => {
      chrome.runtime.onMessage.removeListener(messageListener);
    };
  }, []);

  useEffect(() => {
    // クリックイベントリスナー（配置モード用）
    const handleClick = (e: MouseEvent) => {
      if (placementMode && pendingMessage) {
        console.log('Placement click at:', e.clientX, e.clientY);
        e.preventDefault();
        e.stopPropagation();

        const x = e.clientX;
        const y = e.clientY;

        // メッセージを配置
        placeMessage(x, y, pendingMessage);

        setPlacementMode(false);
        setPendingMessage(null);
      }
    };

    if (placementMode) {
      console.log('Placement mode activated');
      document.addEventListener('click', handleClick, true);
      document.body.style.cursor = 'crosshair';
    } else {
      document.body.style.cursor = '';
    }

    return () => {
      document.removeEventListener('click', handleClick, true);
      document.body.style.cursor = '';
    };
  }, [placementMode, pendingMessage]);

  const loadMessages = async () => {
    const url = window.location.href;

    chrome.runtime.sendMessage(
      { type: 'GET_MESSAGES', data: { url } },
      (response) => {
        if (response?.success) {
          setMessages(response.messages);
        }
      }
    );
  };

  const placeMessage = async (x: number, y: number, data: any) => {
    const url = window.location.href;

    chrome.runtime.sendMessage(
      {
        type: 'CREATE_MESSAGE',
        data: {
          url,
          x_position: x,
          y_position: y,
          message_text: data.message,
          base_template: data.baseTemplate,
          category: data.category,
          word: data.word,
        },
      },
      (response) => {
        if (response?.success) {
          loadMessages();
        }
      }
    );
  };

  return (
    <>
      {showMessages &&
        messages.map((message) => (
          <MessageOverlay
            key={message.id}
            message={message}
            onRated={loadMessages}
          />
        ))}
      {placementMode && pendingMessage && (
        <div
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'rgba(0, 0, 0, 0.8)',
            color: '#f7f3e7',
            padding: '20px',
            borderRadius: '8px',
            zIndex: 10000,
            pointerEvents: 'none',
          }}
        >
          配置する場所をクリックしてください
        </div>
      )}
    </>
  );
}

export default ContentScript;
