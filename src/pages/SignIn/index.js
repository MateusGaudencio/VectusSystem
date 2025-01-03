// src/pages/SignIn/index.js

import { useState, useContext, useEffect } from 'react';
import './signin.css';
import logo from '../../assets/logo.png';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/auth';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const { signIn, user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    // Se o usuário já estiver logado, redirecione para o dashboard
    if (user) {
      navigate('/tickets');
    }
  }, [user, navigate]);

  async function handleSignIn(e) {
    e.preventDefault();
    if (email !== '' && password !== '') {
      await signIn(email, password);
    }
  }

  return (
    <div className="container-center">
      <div className="login">
        <div className="login-area">
          <img src={logo} alt="Logo do sistema de chamados" />
        </div>
        <form onSubmit={handleSignIn}>
          <h1>Entrar</h1>
          <input
            type="text"
            placeholder="exemplo@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="********"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit">Acessar</button>
        </form>
        <Link to="/register">Criar uma conta</Link>
      </div>
    </div>
  );
}
