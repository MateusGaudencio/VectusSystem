import { useContext } from 'react';
import { getBadgeColor } from "../../services/statusBadgeColor";
import { FaWindowClose } from "react-icons/fa";
import DarkModeContext from '../../contexts/DarkModeContext';
import './modal.css';

export default function Modal({ conteudo, close }){
    const { isDarkMode } = useContext(DarkModeContext);
    return(
        <div className={`modal ${isDarkMode ? 'dark' : ''}`}>
            <div className="container">
                <button className="close-modal-btn" onClick={close}><FaWindowClose size={25} color="#FF4C4C"/></button>
                <main>
                    <h2>Detalhes da O.S</h2>
                    <div className="row">
                        <span>Cliente: <i>{conteudo.cliente}</i></span>
                    </div>
                    <div className="row">
                        <span>Assunto: <i>{conteudo.assunto}</i></span>
                    </div>
                    <div className="row">
                        <span>Cadastrado em: <i>{conteudo.createdFormat}</i></span>
                    </div>
                    <div className="row">
                        <span>Status: <i className="badge" style={{ backgroundColor: getBadgeColor(conteudo.status) }}>{conteudo.status}</i></span>
                    </div>
                    <>
                        <h3>Laudo Técnico</h3>
                        <p>{conteudo.laudo}</p>
                    </>
                </main>
            </div>
        </div>
    )
}