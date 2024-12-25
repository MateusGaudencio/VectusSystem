// src/pages/NewServices/index.js

import { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import NavBar from '../../components/NavBar';
import Title from '../../components/Title';
import { AiFillTool } from "react-icons/ai";
import { db } from '../../services/firebaseConnection';
import DarkModeContext from '../../contexts/DarkModeContext';
import { addDoc, collection, doc, getDoc, updateDoc, deleteDoc, setDoc, Timestamp } from 'firebase/firestore';
import { toast } from 'react-toastify';

const listRef = collection(db, "services");
const counterRef = doc(db, "counters", "serviceNumber");

export default function NewServices() {
  const [nome, setNome] = useState('');
  const [preco, setPreco] = useState('');
  const [info, setInfo] = useState('');
  const [idService, setIdService] = useState(false);

  const { id } = useParams();
  const navigate = useNavigate();

  const { isDarkMode } = useContext(DarkModeContext);

  const isEditing = Boolean(id); // Verifica se está no modo de edição

  // Função para formatar o valor de preço
  const formatPrice = (value) => {
    const rawValue = value.replace(/\D/g, '');
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(parseFloat(rawValue) / 100);
  };

  const handlePrecoChange = (e) => {
    setPreco(formatPrice(e.target.value));
  };

  useEffect(() => {
    async function loadServiceData() {
      if (isEditing) {
        const docRef = doc(db, "services", id);
        const snapshot = await getDoc(docRef);
        if (snapshot.exists()) {
          const serviceData = snapshot.data();
          setNome(serviceData.nomeService);
          setPreco(formatPrice(serviceData.preco.toString()));
          setInfo(serviceData.info || '');
          setIdService(true);
        } else {
          toast.error("Serviço não encontrado!");
        }
      }
    }

    loadServiceData();
  }, [id, isEditing]);

  // Função para obter o próximo número de serviço
  async function getNextServiceNumber() {
    const snapshot = await getDoc(counterRef);
    let nextNumber = 1;

    if (snapshot.exists()) {
      const data = snapshot.data();
      nextNumber = (data.lastNumber || 0) + 1;
      await setDoc(counterRef, { lastNumber: nextNumber });
    } else {
      await setDoc(counterRef, { lastNumber: nextNumber });
    }

    return nextNumber;
  }

  // Função para registrar ou atualizar serviço
  async function handleRegister(e) {
    e.preventDefault();

    const serviceData = {
      nomeService: nome,
      preco: preco, // Salva o preço já formatado como string
      info,
    };

    try {
      if (isEditing) {
        const docRef = doc(db, "services", id);
        await updateDoc(docRef, serviceData);
        toast.success("Serviço atualizado com sucesso!");
      } else {
        const serviceNumber = await getNextServiceNumber();
        await addDoc(listRef, { ...serviceData, serviceNumber, created: Timestamp.now() });
        toast.success("Serviço cadastrado com sucesso!");
      }
      navigate('/services');
    } catch (error) {
      console.error(error);
      toast.error("Erro ao salvar serviço.");
    }
  }

  // Função para resetar todos os campos
  const resetFields = () => {
    setNome('');
    setPreco('');
    setInfo('');
  };

  // Função para salvar e cadastrar novo
  async function handleSaveAndNew(e) {
    e.preventDefault();

    const serviceData = {
      nomeService: nome,
      preco: preco, // Salva o preço já formatado como string
      info,
    };

    try {
      const serviceNumber = await getNextServiceNumber();
      await addDoc(listRef, { ...serviceData, serviceNumber, created: Timestamp.now() });
      toast.success("Serviço cadastrado com sucesso!");

      resetFields(); // Limpa os campos
    } catch (error) {
      console.error(error);
      toast.error("Erro ao salvar serviço.");
    }
  }

  // Função para excluir serviço
  async function handleDelete() {
    const confirmDelete = window.confirm("Tem certeza que deseja excluir este serviço?");
    if (confirmDelete) {
      try {
        const docRef = doc(db, "services", id);
        await deleteDoc(docRef);
        toast.success("Serviço excluído com sucesso!");
        navigate('/services');
      } catch (error) {
        console.error("Erro ao excluir serviço: ", error);
        toast.error("Erro ao excluir serviço.");
      }
    }
  }

  return (
    <div className={`new-service-page ${isDarkMode ? 'dark' : ''}`}>
      <NavBar />
      <div className="content">
        <Title name={isEditing ? "Atualizar serviço" : "Cadastrar novo serviço"}>
          <AiFillTool size={25} />
        </Title>

        <div className="container">
          <form className="data-form" onSubmit={handleRegister}>
            <label>Nome:</label>
            <input 
              title="Nome do Serviço"
              type="text" 
              placeholder="Nome do serviço" 
              value={nome}
              maxLength={100}
              onChange={(e) => setNome(e.target.value)} 
              required 
            />

            <label>Preço:</label>
            <input
              title="Preço do Serviço"
              type="text"
              placeholder="R$ 0,00"
              value={preco}
              onChange={handlePrecoChange}
              required
            />

            <label>Descrição do serviço:</label>
            <input
              title="Descrição do serviço"
              type="text"
              placeholder="Informações do serviço"
              value={info}
              maxLength={50}
              onChange={(e) => setInfo(e.target.value)}
            />

            <button type="submit" className="save-button">
              <AiFillTool color="#000" size={25} />
              {isEditing ? "Atualizar serviço" : "Cadastrar serviço"}
            </button>

            {!isEditing && (
              <button onClick={handleSaveAndNew} className="savemore-button">
                <AiFillTool color="#000" size={25} />
                Salvar Serviço e Cadastrar Novo
              </button>
            )}

            {isEditing && (
              <button type="button" onClick={handleDelete} className="delete-button">
                <AiFillTool color="#000" size={25} />
                Excluir Serviço
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
