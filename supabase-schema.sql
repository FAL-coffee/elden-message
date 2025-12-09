-- EldenMessage Database Schema

-- messagesテーブル
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  url TEXT NOT NULL,
  url_hash TEXT NOT NULL,
  x_position INTEGER NOT NULL,
  y_position INTEGER NOT NULL,
  message_text TEXT NOT NULL,
  base_template TEXT NOT NULL,
  category TEXT NOT NULL,
  word TEXT NOT NULL,
  rating_count INTEGER DEFAULT 0,
  creator_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- messagesテーブルのインデックス
CREATE INDEX IF NOT EXISTS idx_messages_url_hash ON messages(url_hash);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);

-- ratingsテーブル
CREATE TABLE IF NOT EXISTS ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(message_id, user_id)
);

-- ratingsテーブルのインデックス
CREATE INDEX IF NOT EXISTS idx_ratings_message_id ON ratings(message_id);
CREATE INDEX IF NOT EXISTS idx_ratings_user_id ON ratings(user_id);

-- Row Level Security (RLS) を有効化
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;

-- messagesテーブルのRLSポリシー
-- 誰でも読み取り可能
CREATE POLICY "Anyone can read messages" ON messages
  FOR SELECT USING (true);

-- 認証されたユーザー（匿名含む）は作成可能
CREATE POLICY "Anyone can create messages" ON messages
  FOR INSERT WITH CHECK (true);

-- 作成者のみ削除可能
CREATE POLICY "Users can delete their own messages" ON messages
  FOR DELETE USING (creator_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- ratingsテーブルのRLSポリシー
-- 誰でも読み取り可能
CREATE POLICY "Anyone can read ratings" ON ratings
  FOR SELECT USING (true);

-- 認証されたユーザー（匿名含む）は作成可能
CREATE POLICY "Anyone can create ratings" ON ratings
  FOR INSERT WITH CHECK (true);

-- メッセージの評価数を自動更新するトリガー関数
CREATE OR REPLACE FUNCTION update_message_rating_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE messages
    SET rating_count = rating_count + 1,
        updated_at = NOW()
    WHERE id = NEW.message_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE messages
    SET rating_count = rating_count - 1,
        updated_at = NOW()
    WHERE id = OLD.message_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- トリガーを作成
DROP TRIGGER IF EXISTS rating_count_trigger ON ratings;
CREATE TRIGGER rating_count_trigger
  AFTER INSERT OR DELETE ON ratings
  FOR EACH ROW
  EXECUTE FUNCTION update_message_rating_count();
