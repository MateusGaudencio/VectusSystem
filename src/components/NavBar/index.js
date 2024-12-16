// src/components/NavBar/index.js

import { useContext, useState } from 'react';
import avatarImg from '../../assets/avatarPerfil.webp';
import { Link } from 'react-router-dom';
import  { AuthContext } from '../../contexts/auth';
import DarkModeContext from '../../contexts/DarkModeContext';
import { BiSolidMessageDetail } from "react-icons/bi";
import { IoLogoWhatsapp } from "react-icons/io";
import { FaBoxes, FaTools, FaShoppingBasket } from "react-icons/fa";
import { FaMoneyCheckDollar, FaFileInvoiceDollar, FaBoxesPacking } from "react-icons/fa6";
import { BsPersonFillGear } from "react-icons/bs";
import { BiMessage, BiSolidMessage } from "react-icons/bi";
import { BsFillPersonLinesFill } from "react-icons/bs";
import { MdDarkMode, MdLightMode } from "react-icons/md";
import './navbar.css';

export default function NavBar(){
const { user } = useContext(AuthContext);
const { isDarkMode, toggleDarkMode } = useContext(DarkModeContext);
const [isMenuOpen, setMenuOpen] = useState(false);

const toggleMenu = () => {
    setMenuOpen(!isMenuOpen);
};

    return(
        <div className="sidebar">
            <button className="menu-toggle" onClick={toggleMenu}>
                <span style={{ display: 'flex', alignItems: 'center' }}>
                    {isMenuOpen ? <BiSolidMessage size={17} style={{ marginRight: '5px' }} /> : <BiMessage size={17} style={{ marginRight: '5px' }} />}
                    {isMenuOpen ? 'Fechar Menu' : 'Abrir Menu'}
                </span>
            </button>
            <img className="imgNavBarSmallScreen" src={user.avatarUrl === null ? avatarImg : user.avatarUrl} title="Sua foto de perfil" alt="Imagem do NavBar" />
            <div className={`menu ${isMenuOpen ? 'open' : 'closed'}`}>
                <img className="imgNavBar" src={user.avatarUrl === null ? avatarImg : user.avatarUrl} title="Sua foto de perfil" alt="Imagem do NavBar" />
                <Link to="/tickets"><BiSolidMessageDetail color="#FFF" size={24} />Ordens de Serviços</Link>
                <Link to="/budgets"><FaMoneyCheckDollar color="#FFF" size={24} />Orçamentos</Link>
                <Link to="/sales"><FaShoppingBasket color="#FFF" size={24} />Vendas</Link>
                <Link to="/customers"><BsFillPersonLinesFill color="#FFF" size={24} />Clientes</Link>
                <Link to="/services"><FaTools color="#FFF" size={24} />Serviços</Link>
                <Link to="/products"><FaBoxesPacking color="#FFF" size={24} />Produtos</Link>
                <Link to="/storage"><FaBoxes color="#FFF" size={24} />Estoque</Link>
                <Link to="/finances"><FaFileInvoiceDollar  color="#FFF" size={24} />Financeiro</Link>
                <Link to="/profile"><BsPersonFillGear color="#FFF" size={24} />Perfil</Link>
            </div>
            <div className={`sidebar-bottom-buttons ${isMenuOpen ? 'open' : 'closed'}`}>
                <button className="darkmode-button" onClick={toggleDarkMode} >
                    {isDarkMode ? <MdLightMode title="Modo Claro" size={24} color="#FFBF4C"/> : <MdDarkMode title="Modo Escuro" size={24} color="#4E4E83"/>}
                </button>
                <button className="config-button" onClick={() => window.open("https://wa.me/554135009282", "_blank", "noopener,noreferrer")}><IoLogoWhatsapp color="#467F3A" size={24}/></button>
            </div>
        </div>
    )
}