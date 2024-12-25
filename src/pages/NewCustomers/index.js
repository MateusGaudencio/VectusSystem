// src/pages/NewCostumers/index.js

import { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import NavBar from '../../components/NavBar';
import Title from '../../components/Title';
import { BsFillPersonPlusFill } from "react-icons/bs";
import { db } from '../../services/firebaseConnection';
import DarkModeContext from '../../contexts/DarkModeContext';
import { addDoc, collection, doc, getDoc, updateDoc, setDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import { toast } from 'react-toastify';
import InputMask from 'react-input-mask';

const listRef = collection(db, "customers");
const counterRef = doc(db, "counters", "customerNumber");

export default function NewCustomer() {
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [telefone, setTelefone] = useState('');
  const [telefoneFixo, setTelefoneFixo] = useState('');
  const [cep, setCep] = useState('');
  const [rua, setRua] = useState('');
  const [numero, setNumero] = useState('');
  const [complemento, setComplemento] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [observacao, setObservacao] = useState('');
  const [isCpfSelected, setIsCpfSelected] = useState(true);
  const [idCustomer, setIdCustomer] = useState(false);

  const { id } = useParams();
  const navigate = useNavigate();
  const { isDarkMode } = useContext(DarkModeContext);

  useEffect(() => {
    async function loadCustomerData() {
      if (id) {
        const docRef = doc(db, "customers", id);
        const snapshot = await getDoc(docRef);
        if (snapshot.exists()) {
          const customerData = snapshot.data();
          setNome(customerData.nomeCustomer);
          setTelefone(customerData.telefone);
          setTelefoneFixo(customerData.telefoneFixo || '');
          setCpf(customerData.cpf || '');
          setCnpj(customerData.cnpj || '');
          setCep(customerData.endereco.cep || '');
          setRua(customerData.endereco.rua || '');
          setNumero(customerData.endereco.numero || '');
          setComplemento(customerData.endereco.complemento || '');
          setBairro(customerData.endereco.bairro || '');
          setCidade(customerData.endereco.cidade || '');
          setObservacao(customerData.observacao || '');
          setIdCustomer(true);
        } else {
          toast.error("Cliente não encontrado!");
        }
      }
    }
    loadCustomerData();
  }, [id]);

  // Função para validar entradas
  function validateInputs() {
    if (!nome.trim()) {
      toast.error("Nome é obrigatório.");
      return false;
    }
    // Validação condicional
    if (telefone && !/^\(\d{2}\) \d{5}-\d{4}$/.test(telefone)) {
      toast.error("Telefone inválido.");
      return false;
    }

    if (telefoneFixo && !/^\(\d{2}\) \d{4}-\d{4}$/.test(telefoneFixo)) {
      toast.error("Telefone fixo inválido.");
      return false;
    }    

    if (isCpfSelected && cpf && !/^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(cpf)) {
      toast.error("CPF inválido.");
      return false;
    }

    if (!isCpfSelected && cnpj && !/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/.test(cnpj)) {
      toast.error("CNPJ inválido.");
      return false;
    }
    return true;
  }

  // Função para obter o próximo número de cliente
  async function getNextCustomerNumber() {
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

  // Função para registrar ou atualizar cliente
  async function handleRegister(e) {
    e.preventDefault();

    if (!validateInputs()) {
      return;
    }

    const customerData = {
      nomeCustomer: nome,
      telefone,
      telefoneFixo,
      cpf: isCpfSelected ? cpf : '',
      cnpj: !isCpfSelected ? cnpj : '',
      endereco: { cep, rua, numero, complemento, bairro, cidade },
      observacao,
    };

    try {
      if (id) {
        const docRef = doc(db, "customers", id);
        await updateDoc(docRef, customerData);
        toast.success("Cliente atualizado com sucesso!");
      } else {
        const customerNumber = await getNextCustomerNumber();
        await addDoc(listRef, { ...customerData, customerNumber, created: Timestamp.now() });
        toast.success("Cliente cadastrado com sucesso!");
      }
      navigate('/customers');
    } catch (error) {
      console.error(error);
      toast.error("Erro ao salvar cliente.");
    }
  }

  async function handleDelete() {
    const confirmDelete = window.confirm("Tem certeza que deseja excluir este cliente?");
    if (confirmDelete) {
      try {
        const docRef = doc(db, "customers", id);
        await deleteDoc(docRef);
        toast.success("Cliente excluído com sucesso!");
        navigate('/customers');
      } catch (error) {
        console.error("Erro ao excluir cliente: ", error);
        toast.error("Erro ao excluir cliente.");
      }
    }
  }
  

  function resetFields() {
    setNome('');
    setTelefone('');
    setTelefoneFixo('');
    setCpf('');
    setCnpj('');
    setCep('');
    setRua('');
    setNumero('');
    setComplemento('');
    setBairro('');
    setCidade('');
    setObservacao('');
  }  

  async function handleSaveAndNew(e) {
    e.preventDefault();
  
    // Validar as entradas
    if (!validateInputs()) {
      return;
    }
  
    const customerData = {
      nomeCustomer: nome,
      telefone,
      telefoneFixo,
      cpf: isCpfSelected ? cpf : '',
      cnpj: !isCpfSelected ? cnpj : '',
      endereco: { cep, rua, numero, complemento, bairro, cidade },
      observacao,
    };
  
    try {
      const customerNumber = await getNextCustomerNumber();
      await addDoc(listRef, { ...customerData, customerNumber, created: Timestamp.now() });
      toast.success("Cliente cadastrado com sucesso!");
  
      // Resetar os campos após o cadastro
      resetFields();
    } catch (error) {
      console.error(error);
      toast.error("Erro ao salvar cliente.");
    }
  }
  

  // Função para buscar dados do CEP
  async function handleCepChange(e) {
    const newCep = e.target.value.replace(/\D/g, '');
    setCep(newCep);

    if (newCep.length === 8 && newCep !== cep) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${newCep}/json/`);
        const data = await response.json();
        if (!data.erro) {
          setRua(data.logradouro);
          setBairro(data.bairro);
          setCidade(data.localidade);
        } else {
          toast.error("CEP não encontrado!");
        }
      } catch (error) {
        toast.error("Erro ao buscar o CEP.");
      }
    }
  }

  return (
    <div className={`new-customer-page ${isDarkMode ? 'dark' : ''}`}>
      <NavBar />
      <div className="content">
        <Title name={idCustomer ? "Atualizar cliente" : "Cadastrar novo cliente"}>
          <BsFillPersonPlusFill size={25} />
        </Title>

        <div className="container">
          <form className="data-form" onSubmit={handleRegister}>
            <label>Nome:</label>
            <input 
              type="text" 
              placeholder="Nome do cliente" 
              value={nome}
              maxLength={100}
              onChange={(e) => setNome(e.target.value)} 
              required 
            />

            <label>Telefone Celular:</label>
            <InputMask
              mask="(99) 99999-9999"
              placeholder="(00) 00000-0000"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
            />

            <label>Telefone Fixo:</label>
            <InputMask
              mask="(99) 9999-9999"
              placeholder="(00) 0000-0000"
              value={telefoneFixo}
              onChange={(e) => setTelefoneFixo(e.target.value)}
            />

            <label>Documento:</label>
            <div className="radio-buttons">
              <label>
                <input
                  type="radio"
                  checked={isCpfSelected}
                  onChange={() => setIsCpfSelected(true)}
                />
                CPF
              </label>
              <label>
                <input
                  type="radio"
                  checked={!isCpfSelected}
                  onChange={() => setIsCpfSelected(false)}
                />
                CNPJ
              </label>
            </div>

            {isCpfSelected ? (
              <InputMask
                mask="999.999.999-99"
                placeholder="CPF do cliente"
                value={cpf}
                onChange={(e) => setCpf(e.target.value)}
              />
            ) : (
              <InputMask
                mask="99.999.999/9999-99"
                placeholder="CNPJ do cliente"
                value={cnpj}
                onChange={(e) => setCnpj(e.target.value)}
              />
            )}

            <label>CEP:</label>
            <InputMask
              mask="99999-999"
              placeholder="CEP"
              value={cep}
              onChange={handleCepChange}
            />

            <label>Rua:</label>
            <input
              type="text"
              placeholder="Nome da rua"
              value={rua}
              maxLength={50}
              onChange={(e) => setRua(e.target.value)}
            />

            <label>Número:</label>
            <input
              type="text"
              placeholder="Número"
              value={numero}
              maxLength={10}
              onChange={(e) => setNumero(e.target.value)}
            />

            <label>Complemento:</label>
            <input
              type="text"
              placeholder="Complemento"
              value={complemento}
              maxLength={50}
              onChange={(e) => setComplemento(e.target.value)}
            />

            <label>Bairro:</label>
            <input
              type="text"
              placeholder="Bairro"
              value={bairro}
              maxLength={50}
              onChange={(e) => setBairro(e.target.value)}
            />

            <label>Cidade:</label>
            <input
              type="text"
              placeholder="Cidade"
              value={cidade}
              maxLength={50}
              onChange={(e) => setCidade(e.target.value)}
            />
            <label>Observação:</label>
            <textarea
              placeholder="Adicione uma observação sobre o cliente"
              value={observacao}
              maxLength={500}
              onChange={(e) => setObservacao(e.target.value)}
              rows="4"
            />
            <div className="form-button">
            <button type="submit" className="save-button">
              <BsFillPersonPlusFill color="#000" size={25} />
              {idCustomer ? "Atualizar Cliente" : "Cadastrar Cliente"}
            </button>

            {!idCustomer && (
              <button onClick={handleSaveAndNew} className="savemore-button">
                <BsFillPersonPlusFill color="#000" size={25} />
                Salvar Cliente e Cadastrar Novo
              </button>
            )}

            {idCustomer && (
              <button type="button" onClick={handleDelete} className="delete-button">
                <BsFillPersonPlusFill color="#000" size={25} />
                Excluir Cliente
              </button>
            )}
          </div>
          </form>
        </div>
      </div>
    </div>
  );
}
