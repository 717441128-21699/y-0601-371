import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAppStore } from '@/store';

export default function Login() {
  const navigate = useNavigate();
  const login = useAppStore((state) => state.login);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('请输入用户名和密码');
      return;
    }

    setLoading(true);
    try {
      const success = await login(username, password);
      if (success) {
        navigate('/dashboard');
      } else {
        setError('用户名或密码错误');
      }
    } catch {
      setError('登录失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-primary-700">
      <div className="absolute inset-0 grid-bg" />
      <div className="absolute inset-0">
        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-solar/20 blur-3xl" />
        <div className="absolute top-1/3 -right-40 h-96 w-96 rounded-full bg-energy/10 blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 h-96 w-96 rounded-full bg-solar/10 blur-3xl" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary-700/50 to-primary-900/80" />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <div className="relative rounded-2xl p-[2px] shadow-glow-solar animate-glow-solar">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-solar-400 via-solar to-solar-600 opacity-80" />
            <div className="relative rounded-2xl bg-primary-600/85 backdrop-blur-xl">
              <div className="p-8">
                <div className="mb-8 text-center">
                  <h1 className="mb-2 text-2xl font-bold text-solar-400 text-glow-solar">
                    大型太阳能电站智能运维与发电预测系统
                  </h1>
                  <p className="text-sm tracking-widest text-solar-300/70">
                    Smart Solar O&amp;M Platform
                  </p>
                </div>

                <div className="divider-glow mb-8" />

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-300">
                      用户名
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-solar-400" />
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="请输入用户名"
                        className="w-full rounded-lg border border-solar/20 bg-primary-800/60 py-3 pl-10 pr-4 text-gray-100 placeholder-gray-500 outline-none transition-all focus:border-solar/60 focus:bg-primary-800/80 focus:shadow-[0_0_15px_rgba(255,140,0,0.2)]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-300">
                      密码
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-solar-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="请输入密码"
                        className="w-full rounded-lg border border-solar/20 bg-primary-800/60 py-3 pl-10 pr-11 text-gray-100 placeholder-gray-500 outline-none transition-all focus:border-solar/60 focus:bg-primary-800/80 focus:shadow-[0_0_15px_rgba(255,140,0,0.2)]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-solar-400"
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <div className="rounded-lg border border-alarm/30 bg-alarm/10 px-4 py-2 text-sm text-alarm-300">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="group relative w-full overflow-hidden rounded-lg bg-gradient-to-r from-solar-600 via-solar to-solar-500 py-3 font-semibold text-white transition-all duration-300 hover:from-solar-500 hover:via-solar-400 hover:to-solar-500 hover:shadow-glow-solar disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-500 group-hover:translate-x-full" />
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        登录中...
                      </span>
                    ) : (
                      '登 录'
                    )}
                  </button>
                </form>

                <div className="divider-glow my-6" />

                <div className="text-center text-xs text-gray-400">
                  <p className="mb-2 text-gray-300/80">测试账号：</p>
                  <p className="space-x-3">
                    <span className="inline-block">
                      <span className="text-solar-400">admin/123456</span>
                      <span className="text-gray-500">(管理员)</span>
                    </span>
                    <span className="inline-block">
                      <span className="text-solar-400">manager/123456</span>
                      <span className="text-gray-500">(运维经理)</span>
                    </span>
                    <span className="inline-block">
                      <span className="text-solar-400">operator/123456</span>
                      <span className="text-gray-500">(操作员)</span>
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          <p className="mt-6 text-center text-xs text-gray-500">
            © {new Date().getFullYear()} Smart Solar O&amp;M Platform. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
