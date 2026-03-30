import { useState } from 'react';
import api from '../api';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ username: '', password: '', age: '', gender: '' });
  const [error, setError] = useState('');

  const handleDemo = () => {
    setFormData({ ...formData, username: 'alice', password: 'password123' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const endpoint = isLogin ? '/login' : '/register';
    
    try {
      const payload = isLogin 
        ? { username: formData.username, password: formData.password }
        : formData;
        
      const res = await api.post(endpoint, payload);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      window.location.href = '/';
    } catch (err) {
      setError(err.response?.data?.error || 'Authentication failed');
    }
  };

  return (
    <div className="flex-center h-screen">
      <div className="surface" style={{ width: '400px' }}>
        <div className="text-center">
          <h2 className="text-accent" style={{ fontSize: '2rem', letterSpacing: '4px' }}>VIGILITY</h2>
          <p className="text-secondary" style={{ marginBottom: '2rem' }}>Product Analytics Platform</p>
        </div>

        {error && <div style={{ color: '#ff4444', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}

        <form onSubmit={handleSubmit} className="flex-col gap-4">
          <input className="input-field" type="text" placeholder="Username" required
            value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} />
            
          <input className="input-field" type="password" placeholder="Password" required
            value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />

          {!isLogin && (
            <>
              <input className="input-field" type="number" placeholder="Age" required={!isLogin}
                value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})} />
              
              <select className="input-field" required={!isLogin}
                value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})}>
                <option value="" disabled>Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </>
          )}

          <button type="submit" className="btn btn-solid w-full">
            {isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="text-center" style={{ marginTop: '1.5rem' }}>
          <button className="btn" style={{ border: 'none', padding: 0 }} onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? "Need an account? Register" : "Already have an account? Login"}
          </button>
        </div>

        {isLogin && (
          <div className="text-center" style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
            <p className="text-secondary text-sm">Demo Account: alice / password123</p>
            <button className="btn" type="button" style={{ fontSize: '0.7rem', padding: '5px 10px', marginTop: '5px' }} onClick={handleDemo}>
              Fill Demo Credentials
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
