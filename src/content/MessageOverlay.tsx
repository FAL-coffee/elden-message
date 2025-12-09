import { useState, useEffect } from 'react';
import type { Message } from '@/shared/types';

interface MessageOverlayProps {
  message: Message;
  onRated?: () => void;
}

function MessageOverlay({ message, onRated }: MessageOverlayProps) {
  const [ratingCount, setRatingCount] = useState(message.rating_count);
  const [hasRated, setHasRated] = useState(false);

  useEffect(() => {
    // 評価済みかチェック
    chrome.storage.local.get('ratedMessages', (result) => {
      const ratedMessages = (result.ratedMessages || []) as string[];
      if (ratedMessages.includes(message.id)) {
        setHasRated(true);
      }
    });
  }, [message.id]);

  useEffect(() => {
    // メッセージの評価数が更新されたら反映
    setRatingCount(message.rating_count);
  }, [message.rating_count]);

  const handleRate = async () => {
    if (hasRated) return;

    // ユーザーIDを取得
    const result = await chrome.storage.local.get('userId');
    const userId = result.userId;

    if (!userId) {
      console.error('User ID not found');
      return;
    }

    // Background Scriptに評価リクエストを送信
    chrome.runtime.sendMessage(
      {
        type: 'RATE_MESSAGE',
        data: {
          messageId: message.id,
          userId: userId,
        },
      },
      (response) => {
        if (response?.success) {
          setHasRated(true);

          // localStorageにも記録
          chrome.storage.local.get('ratedMessages', (result) => {
            const ratedMessages = (result.ratedMessages || []) as string[];
            ratedMessages.push(message.id);
            chrome.storage.local.set({ ratedMessages });
          });

          // メッセージを再読み込み
          if (onRated) {
            onRated();
          }
        } else {
          console.error('Failed to rate message:', response?.error);
        }
      }
    );
  };

  return (
    <div
      style={{
        position: 'fixed',
        left: `${message.x_position}px`,
        top: `${message.y_position}px`,
        zIndex: 1000,
      }}
    >
      <div
        style={{
          minWidth: '520px',
          maxWidth: '720px',
          padding: '2px',
          background: `
            radial-gradient(
              ellipse at top,
              rgba(145, 132, 97, 0.45) 0,
              rgba(145, 132, 97, 0.05) 34%,
              rgba(0, 0, 0, 0.9) 100%
            ),
            linear-gradient(
              to bottom,
              #2f2d28 0,
              #24231e 38%,
              #23221d 65%,
              #2f302b 100%
            )
          `,
          border: '1px solid #6e6655',
          boxShadow: `
            0 0 32px rgba(0, 0, 0, 0.9),
            0 0 4px rgba(255, 255, 255, 0.08) inset
          `,
          borderRadius: '2px',
        }}
      >
        <div
          style={{
            position: 'relative',
            padding: '8px 16px 6px',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            color: '#f7f3e7',
            fontFamily:
              "'Noto Serif JP','Yu Mincho','YuMincho','Hiragino Mincho ProN',serif",
            letterSpacing: '0.08em',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            <div
              style={{
                fontSize: '14px',
                textShadow: `
                  0 0 2px rgba(0, 0, 0, 0.9),
                  0 0 8px rgba(0, 0, 0, 0.9)
                `,
                width: '100%',
              }}
            >
              {message.message_text}
            </div>

            <div
              style={{
                display: 'inline-flex',
                fontSize: '12px',
                color: '#d2cab0',
                whiteSpace: 'nowrap',
                justifyContent: 'flex-end',
              }}
            >
              <span>評価総数</span>
              <span
                style={{
                  minWidth: '16px',
                  textAlign: 'right',
                }}
              >
                {ratingCount}
              </span>
            </div>
          </div>

          <div
            style={{
              margin: '6px -16px 6px',
              borderTop: '1px solid #8c8269',
              boxShadow: '0 1px 0 rgba(0, 0, 0, 0.9)',
            }}
          ></div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-start',
              gap: '26px',
              fontFamily:
                "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI','Hiragino Kaku Gothic ProN','Meiryo',sans-serif",
              fontSize: '12px',
              color: '#f4f1e6',
            }}
          >
            <button
              onClick={handleRate}
              disabled={hasRated}
              style={{
                display: 'inline-flex',
                all: 'unset',
                cursor: hasRated ? 'not-allowed' : 'pointer',
                opacity: hasRated ? 0.5 : 1,
              }}
            >
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '18px',
                  paddingLeft: '1px',
                  height: '18px',
                  borderRadius: '999px',
                  border: '1px solid #d3cdb9',
                  fontSize: '10px',
                  lineHeight: 1,
                  boxShadow: `
                    0 0 2px rgba(0, 0, 0, 0.9),
                    0 0 4px rgba(0, 0, 0, 0.9)
                  `,
                  background: `
                    radial-gradient(
                      circle at 30% 30%,
                      rgba(255, 255, 255, 0.06) 0,
                      rgba(255, 255, 255, 0) 80%
                    )
                  `,
                  marginRight: '4px',
                }}
              >
                □
              </span>
              評価
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MessageOverlay;
