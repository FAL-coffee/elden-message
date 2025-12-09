// Background Service Worker for EldenMessage
import { createClient } from '@supabase/supabase-js';
import { normalizeUrl, generateUrlHash } from '@/shared/urlUtils';
import { getUserId } from '@/shared/storage';

const SUPABASE_URL = 'https://rytnjxypoliccxtsflrw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5dG5qeHlwb2xpY2N4dHNmbHJ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyODk4NzcsImV4cCI6MjA4MDg2NTg3N30.EBvnkG4LHbj0juAKSUY7fLDF109vxvvVJcBtMQ0HrSg';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log('EldenMessage background service worker loaded');

// インストール時の処理
chrome.runtime.onInstalled.addListener(() => {
  console.log('EldenMessage installed');
});

// メッセージリスナー
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Background received message:', message);

  switch (message.type) {
    case 'GET_MESSAGES':
      handleGetMessages(message.data).then(sendResponse);
      return true; // 非同期レスポンスを示す

    case 'CREATE_MESSAGE':
      handleCreateMessage(message.data).then(sendResponse);
      return true;

    case 'RATE_MESSAGE':
      handleRateMessage(message.data).then(sendResponse);
      return true;

    default:
      console.warn('Unknown message type:', message.type);
  }
});

async function handleGetMessages(data: { url: string }) {
  try {
    const normalizedUrl = normalizeUrl(data.url);
    const urlHash = generateUrlHash(normalizedUrl);

    console.log('Getting messages for URL:', normalizedUrl, 'hash:', urlHash);

    // メッセージと評価数を取得（評価数は動的に集計）
    const { data: messages, error } = await supabase
      .from('messages')
      .select(`
        *,
        rating_count:ratings(count)
      `)
      .eq('url_hash', urlHash)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching messages:', error);
      return { success: false, error: error.message, messages: [] };
    }

    // rating_countを数値に変換
    const messagesWithCount = messages?.map(msg => ({
      ...msg,
      rating_count: msg.rating_count?.[0]?.count || 0
    })) || [];

    console.log('Fetched messages:', messagesWithCount);
    return { success: true, messages: messagesWithCount };
  } catch (error) {
    console.error('Error in handleGetMessages:', error);
    return { success: false, error: String(error), messages: [] };
  }
}

async function handleCreateMessage(data: any) {
  try {
    const userId = await getUserId();
    const normalizedUrl = normalizeUrl(data.url);
    const urlHash = generateUrlHash(normalizedUrl);

    const messageData = {
      url: normalizedUrl,
      url_hash: urlHash,
      x_position: data.x_position,
      y_position: data.y_position,
      message_text: data.message_text,
      base_template: data.base_template,
      category: data.category,
      word: data.word,
      creator_id: userId,
    };

    console.log('Creating message:', messageData);

    const { data: newMessage, error } = await supabase
      .from('messages')
      .insert([messageData])
      .select()
      .single();

    if (error) {
      console.error('Error creating message:', error);
      return { success: false, error: error.message };
    }

    console.log('Created message:', newMessage);
    return { success: true, message: newMessage };
  } catch (error) {
    console.error('Error in handleCreateMessage:', error);
    return { success: false, error: String(error) };
  }
}

async function handleRateMessage(data: { messageId: string; userId: string }) {
  try {
    console.log('Rating message:', data);

    // 既に評価済みかチェック
    const { data: existingRating } = await supabase
      .from('ratings')
      .select('id')
      .eq('message_id', data.messageId)
      .eq('user_id', data.userId)
      .single();

    if (existingRating) {
      return { success: false, error: 'Already rated' };
    }

    // 評価を追加
    const { error } = await supabase
      .from('ratings')
      .insert([{
        message_id: data.messageId,
        user_id: data.userId,
      }]);

    if (error) {
      console.error('Error rating message:', error);
      return { success: false, error: error.message };
    }

    console.log('Successfully rated message');
    return { success: true };
  } catch (error) {
    console.error('Error in handleRateMessage:', error);
    return { success: false, error: String(error) };
  }
}
