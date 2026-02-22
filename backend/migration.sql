-- Run this in Supabase SQL Editor (Dashboard > SQL Editor > New Query)

-- SMS Conversations table
CREATE TABLE IF NOT EXISTS sms_conversations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    phone TEXT UNIQUE NOT NULL,
    lead_name TEXT DEFAULT 'there',
    area TEXT,
    qualification JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- SMS Messages table
CREATE TABLE IF NOT EXISTS sms_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    conversation_phone TEXT NOT NULL REFERENCES sms_conversations(phone) ON DELETE CASCADE,
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for fast message lookups
CREATE INDEX IF NOT EXISTS idx_sms_messages_phone ON sms_messages(conversation_phone, created_at);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER sms_conversations_updated_at
    BEFORE UPDATE ON sms_conversations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Enable RLS (optional, disable if using service key)
ALTER TABLE sms_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE sms_messages ENABLE ROW LEVEL SECURITY;

-- Allow all access via service key (anon/authenticated can be restricted later)
CREATE POLICY "Allow all for service role" ON sms_conversations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for service role" ON sms_messages FOR ALL USING (true) WITH CHECK (true);
