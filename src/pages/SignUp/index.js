// src/pages/SignUp/index.js

import { useState, useContext } from 'react';
import logo from '../../assets/logo.png';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../contexts/auth';

export default function SignUp() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { signUp, loadingAuth } = useContext(AuthContext);

    const validateName = (name) => {
        const maxLength = 20;
        return name.trim().length > 0 && name.trim().length <= maxLength;
    };

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validatePassword = (password) => {
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        return passwordRegex.test(password);
    };

    async function handleSubmit(e) {
        e.preventDefault();

        if (!validateName(name)) {
            alert('O nome de usuário deve ser válido e ter no máximo 20 caracteres.');
            return;
        }

        if (!validateEmail(email)) {
            alert('Por favor, insira um endereço de email válido.');
            return;
        }

        if (!validatePassword(password)) {
            alert(
                'A senha deve ter pelo menos 8 caracteres, incluindo uma letra maiúscula, uma letra minúscula, um número e um caractere especial.'
            );
            return;
        }

        await signUp(name, email, password);
    }

    return (
        <div className="container-center">
            <div className="login">
                <div className="login-area">
                    <img src={logo} alt="Imagem logo do sistema" />
                </div>
                <form onSubmit={handleSubmit}>
                    <h1>Nova Conta</h1>
                    <input
                        type="text"
                        placeholder="Seu Nome"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
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
                    <small>
                        Sua senha deve conter:
                        <ul>
                            <li>Pelo menos 8 caracteres</li>
                            <li>Uma letra maiúscula</li>
                            <li>Uma letra minúscula</li>
                            <li>Um número</li>
                            <li>Um caractere especial (ex: @, $, !, %, *, ? ou &)</li>
                        </ul>
                    </small>
                    <button type="submit">
                        {loadingAuth ? 'Carregando...' : 'Cadastrar'}
                    </button>
                </form>
                <Link to="/">Já possui uma conta? Faça Login</Link>
            </div>
        </div>
    );
}
