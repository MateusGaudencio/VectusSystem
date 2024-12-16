// src/pages/Tickets/index.js

import React from 'react';
import  { AuthContext } from '../../contexts/auth';
import { useContext } from 'react';
import DarkModeContext from '../../contexts/DarkModeContext';
import NavBar from '../../components/NavBar';
import Title from '../../components/Title';
import { BiSolidMessageDetail } from "react-icons/bi";

export default function Tickets() {
  const { user } = useContext(AuthContext);
  const { isDarkMode } = useContext(DarkModeContext);

    return (
        <div className={`tickets-page ${isDarkMode ? 'dark' : ''}`}>
            <NavBar />
            <div className="content">
                <Title name="Ordens de Serviços">
                    <BiSolidMessageDetail size={25} />
                </Title>
                <div className="container">
                <div className="construction-page">
                  <h1>Página em Construção</h1>
                  <p>Estou trabalhando para trazer algo incrível. Mais novidades em breve!</p>
                  <img className="construction-img"
                  src="https://assets.zyrosite.com/Aq20eV79zLfpXV6b/bb375cdd655184ca2715ac5059e73651-YX4ZEeZEvbhrMMZa.gif" 
                  alt="Página em construção"/>
                </div></div>
                <div className="container">
                    <div className="logout-container">
                      <span className="span-autor">Desenvolvido por Mateus Gaudencio</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
