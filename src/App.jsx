import React, { useState, useEffect } from 'react';
import { MessageCircle, Send, LogIn, LogOut, UserPlus } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import AIChat from './components/AIChat';

// 從環境變數讀取 Supabase 設定
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// 建立 Supabase 客戶端
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default function App() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // 檢查是否有登入的使用者
    checkUser();
    // 載入留言
    loadComments();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) setUser(user);
  };

  const loadComments = async () => {
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('載入留言失敗:', error);
    } else {
      setComments(data || []);
    }
  };

  const handleAuth = async () => {
    setLoading(true);
    try {
      if (isLogin) {
        // 登入
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) throw error;
        
        setUser(data.user);
        alert('登入成功!');
        setEmail('');
        setPassword('');
      } else {
        // 註冊
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });
        
        if (error) throw error;
        
        alert('註冊成功!請檢查 Email 確認信箱');
        setEmail('');
        setPassword('');
      }
    } catch (error) {
      alert('錯誤: ' + error.message);
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    if (!user) {
      alert('請先登入才能留言');
      return;
    }

    const { data, error } = await supabase
      .from('comments')
      .insert([
        {
          post_id: 'match_001',
          user_id: user.id,
          user_email: user.email,
          content: newComment,
        }
      ])
      .select();

    if (error) {
      alert('留言失敗: ' + error.message);
    } else {
      setComments([data[0], ...comments]);
      setNewComment('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* 頭部 */}
        <div className="bg-white rounded-t-2xl shadow-lg p-6 border-b-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">🏐 VolleyGo</h1>
              <p className="text-gray-600 mt-1">台灣企業排球聯賽 - 本週賽程討論</p>
            </div>
            {user && (
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
              >
                <LogOut size={18} />
                登出
              </button>
            )}
          </div>
        </div>

        {/* 賽事資訊卡片 */}
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white p-6 shadow-lg">
          <h2 className="text-xl font-bold mb-2">🏆 台電 vs 台灣大哥大</h2>
          <p className="text-orange-100">📅 2025/11/05 (三) 19:00</p>
          <p className="text-orange-100">📍 台北體育館</p>
        </div>
        <AIChat />

        {/* 認證區域 */}
        {!user ? (
          <div className="bg-white p-6 shadow-lg">
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setIsLogin(true)}
                className={`flex-1 py-2 rounded-lg font-semibold transition ${
                  isLogin ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600'
                }`}
              >
                <LogIn className="inline mr-2" size={18} />
                登入
              </button>
              <button
                onClick={() => setIsLogin(false)}
                className={`flex-1 py-2 rounded-lg font-semibold transition ${
                  !isLogin ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600'
                }`}
              >
                <UserPlus className="inline mr-2" size={18} />
                註冊
              </button>
            </div>
            
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border rounded-lg mb-3 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
            <input
              type="password"
              placeholder="密碼 (至少6個字元)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border rounded-lg mb-4 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
            <button
              onClick={handleAuth}
              disabled={loading}
              className="w-full bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 transition disabled:bg-gray-300"
            >
              {loading ? '處理中...' : isLogin ? '登入' : '註冊'}
            </button>
          </div>
        ) : (
          <div className="bg-green-50 border border-green-200 p-4 shadow-lg">
            <p className="text-green-800 font-semibold">
              ✓ 已登入: {user.email}
            </p>
          </div>
        )}

        {/* 新增留言 */}
        <div className="bg-white p-6 shadow-lg border-t">
          <div className="flex gap-3">
            <input
              type="text"
              placeholder={user ? "分享你的想法..." : "請先登入才能留言"}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              disabled={!user}
              className="flex-1 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-gray-100"
              onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
            />
            <button
              onClick={handleAddComment}
              disabled={!user || !newComment.trim()}
              className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition disabled:bg-gray-300"
            >
              <Send size={20} />
            </button>
          </div>
        </div>

        {/* 留言列表 */}
        <div className="bg-white rounded-b-2xl shadow-lg p-6">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b">
            <MessageCircle className="text-orange-500" />
            <h3 className="font-bold text-gray-800">留言討論 ({comments.length})</h3>
          </div>
          
          {comments.length === 0 ? (
            <p className="text-center text-gray-400 py-8">還沒有留言,搶先發表!</p>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold">
                      {comment.user_email[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{comment.user_email}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(comment.created_at).toLocaleString('zh-TW')}
                      </p>
                    </div>
                  </div>
                  <p className="text-gray-700 ml-10">{comment.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 提示訊息 */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>💡 提示:</strong> 已連接到 Supabase 真實資料庫!
          </p>
        </div>
      </div>
    </div>
  );
}