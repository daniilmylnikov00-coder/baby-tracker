// Подключение к Supabase
const SUPABASE_URL = 'https://qzqtfdqtxfkxhakdtbxh.supabase.co';
const SUPABASE_KEY = 'sb_publishable_-vnQdKIXSe1w1A1PAbUPZg_ZsKGngzr';

// Создаем клиента и делаем его глобальным (window.db)
const { createClient } = supabase;
window.db = createClient(SUPABASE_URL, SUPABASE_KEY);