import { useState, useEffect, useMemo } from 'react';
import { BASE_TEMPLATES, CATEGORIES, CATEGORY_WORDS } from '@/shared/constants';
import type { MessageFormData } from '@/shared/types';

function Popup() {
  const [formData, setFormData] = useState<MessageFormData>({
    baseTemplate: BASE_TEMPLATES[0],
    category: CATEGORIES[11], // つぶやき
    word: CATEGORY_WORDS[CATEGORIES[11]][0],
  });
  const [showMessages, setShowMessages] = useState(true);

  // 選択されたカテゴリーに対応する単語リスト
  const availableWords = useMemo(() => {
    return CATEGORY_WORDS[formData.category as keyof typeof CATEGORY_WORDS];
  }, [formData.category]);

  useEffect(() => {
    // 設定を読み込む
    chrome.storage.local.get('showMessages', (result) => {
      if (typeof result.showMessages === 'boolean') {
        setShowMessages(result.showMessages);
      }
    });
  }, []);

  const generateMessage = (): string => {
    return formData.baseTemplate.replace(/\*\*\*\*/g, formData.word);
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCategory = e.target.value;
    const newWords = CATEGORY_WORDS[newCategory as keyof typeof CATEGORY_WORDS];
    setFormData({
      ...formData,
      category: newCategory,
      word: newWords[0], // 新しいカテゴリーの最初の単語を選択
    });
  };

  const handleShowMessagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setShowMessages(checked);

    // 設定を保存
    chrome.storage.local.set({ showMessages: checked });

    // すべてのタブに設定変更を通知
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach((tab) => {
        if (tab.id) {
          chrome.tabs.sendMessage(tab.id, {
            type: 'TOGGLE_MESSAGES',
            data: { show: checked },
          });
        }
      });
    });
  };

  const handleStartPlacement = () => {
    const message = generateMessage();
    console.log('Starting placement mode with message:', message);

    // Content Scriptに配置モード開始を通知
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      console.log('Active tabs:', tabs);

      if (tabs[0]?.id) {
        console.log('Sending message to tab:', tabs[0].id);

        chrome.tabs.sendMessage(
          tabs[0].id,
          {
            type: 'START_PLACEMENT_MODE',
            data: {
              message,
              baseTemplate: formData.baseTemplate,
              category: formData.category,
              word: formData.word,
            },
          },
          (response) => {
            if (chrome.runtime.lastError) {
              console.error('Error sending message:', chrome.runtime.lastError.message);
              alert(`配置モードを開始できませんでした。\n\nエラー: ${chrome.runtime.lastError.message}\n\nページを再読み込みしてください。`);
            } else {
              console.log('Message sent successfully:', response);
              window.close();
            }
          }
        );
      } else {
        console.error('No active tab found');
        alert('アクティブなタブが見つかりませんでした。');
      }
    });
  };

  return (
    <div className="popup-container">
      <h1 className="popup-title">
        <span className="initial-letter">E</span>LDEN MESSAG<span className="initial-letter">E</span>
      </h1>

      <div className="form-group">
        <label htmlFor="baseTemplate">ベース文:</label>
        <select
          id="baseTemplate"
          value={formData.baseTemplate}
          onChange={(e) =>
            setFormData({ ...formData, baseTemplate: e.target.value })
          }
        >
          {BASE_TEMPLATES.map((template) => (
            <option key={template} value={template}>
              {template}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="category">種類:</label>
        <select
          id="category"
          value={formData.category}
          onChange={handleCategoryChange}
        >
          {CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="word">単語:</label>
        <select
          id="word"
          value={formData.word}
          onChange={(e) => setFormData({ ...formData, word: e.target.value })}
        >
          {availableWords.map((word: string) => (
            <option key={word} value={word}>
              {word}
            </option>
          ))}
        </select>
      </div>

      <div className="preview">
        <div className="preview-label">プレビュー:</div>
        <div className="preview-text">{generateMessage()}</div>
      </div>

      <button className="placement-button" onClick={handleStartPlacement}>
        配置モードで配置する
      </button>

      <div className="settings">
        <h2>設定</h2>
        <label>
          <input
            type="checkbox"
            checked={showMessages}
            onChange={handleShowMessagesChange}
          />
          メッセージを表示する
        </label>
      </div>
    </div>
  );
}

export default Popup;
