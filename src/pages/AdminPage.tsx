import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { Users } from 'lucide-react';

interface UserProfile {
  id: string;
  email: string;
  created_at: string;
  is_admin: boolean;
  display_name?: string;
  provider?: string;
  last_sign_in_at?: string;
}

export function AdminPage() {
  const { user, isAdmin, isLoading } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && (!user || !isAdmin)) {
      navigate('/');
      return;
    }

    async function fetchUsers() {
      try {
        const { data: users, error: usersError } = await supabase
          .from('Users')
          .select(`
            UID,
            Email,
            created_at,
            last_sign_in_at,
            raw_user_meta_data,
            raw_app_meta_data
          `)
          .order('created_at', { ascending: false });

        if (usersError) throw usersError;

        const formattedUsers = users.map(user => ({
          id: user.id,
          email: user.email,
          display_name: user.raw_user_meta_data?.name,
          provider: user.raw_app_meta_data?.provider || 'email',
          created_at: user.created_at,
          is_admin: false,
          last_sign_in_at: user.last_sign_in_at
        }));

        setUsers(formattedUsers);
      } catch (err) {
        setError('ユーザー情報の取得に失敗しました');
        console.error('Error fetching users:', err);
      } finally {
        setIsLoadingUsers(false);
      }
    }

    if (user && isAdmin) {
      fetchUsers();
    }
  }, [user, isAdmin, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto text-center">
          読み込み中...
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Users className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold text-text">ユーザー管理</h1>
        </div>

        <div className="card overflow-hidden">
          {isLoadingUsers ? (
            <div className="p-8 text-center text-gray">
              読み込み中...
            </div>
          ) : error ? (
            <div className="p-8 text-center text-red-500">
              {error}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-border">
                    <th className="text-left p-4 font-medium text-gray">ユーザー</th>
                    <th className="text-left p-4 font-medium text-gray">認証方法</th>
                    <th className="text-left p-4 font-medium text-gray">登録日</th>
                    <th className="text-left p-4 font-medium text-gray">最終ログイン</th>
                    <th className="text-left p-4 font-medium text-gray">権限</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id} className="border-b border-border">
                      <td className="p-4">
                        <div>
                          {user.display_name && (
                            <div className="font-medium">{user.display_name}</div>
                          )}
                          <div className="text-sm text-gray">{user.email}</div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="capitalize">{user.provider || 'Email'}</span>
                      </td>
                      <td className="p-4">
                        {new Date(user.created_at).toLocaleDateString('ja-JP', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </td>
                      <td className="p-4">
                        {user.last_sign_in_at && new Date(user.last_sign_in_at).toLocaleDateString('ja-JP', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.is_admin
                            ? 'bg-primary bg-opacity-10 text-primary'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {user.is_admin ? '管理者' : '一般ユーザー'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}