// src/components/Title.js
import { useContext } from 'react';
import DarkModeContext from '../../contexts/DarkModeContext';
import './title.css';

export default function Title({ children, name }) {
    const { isDarkMode } = useContext(DarkModeContext);

    return (
        <div className={`title ${isDarkMode ? 'dark' : ''}`}>
            {children}
            <span>{name}</span>
        </div>
    );
}
