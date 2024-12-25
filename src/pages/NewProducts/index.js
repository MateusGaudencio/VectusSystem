// src/pages/NewProdutcs.index.js

import { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import NavBar from '../../components/NavBar';
import Title from '../../components/Title';
import { FaBoxesPacking } from "react-icons/fa6";
import { db } from '../../services/firebaseConnection';
import DarkModeContext from '../../contexts/DarkModeContext';
import { collection, doc, getDoc, getDocs, updateDoc, setDoc, addDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import { toast } from 'react-toastify';

const listRef = collection(db, "products");
const counterRef = doc(db, "counters", "productNumber");

export default function NewProduct() {
  const [nome, setNome] = useState('');
  const [marca, setMarca] = useState('');
  const [modelo, setModelo] = useState('');
  const [distribuidor, setDistribuidor] = useState('');
  const [preco, setPreco] = useState('');
  const [info, setInfo] = useState('');
  const [caracteristicas, setCaracteristicas] = useState('');
  const [especificacoes, setEspecificacoes] = useState('');
  const [peso, setPeso] = useState('');
  const [altura, setAltura] = useState('');
  const [comprimento, setComprimento] = useState('');
  const [largura, setLargura] = useState('');
  const [margens, setMargens] = useState([]);
  const [margemSelecionada, setMargemSelecionada] = useState(null);
  const [precoVenda, setPrecoVenda] = useState('');
  const [isEditingPrecoVenda, setIsEditingPrecoVenda] = useState(false);


  const { id } = useParams();
  const navigate = useNavigate();
  const { isDarkMode } = useContext(DarkModeContext);

  const isEditing = Boolean(id); 

  // Função para formatar o valor de preço
  const handlePrecoChange = (e) => {
    const rawValue = e.target.value.replace(/\D/g, '');
    const formattedValue = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(parseFloat(rawValue) / 100);

    setPreco(formattedValue);
  };

  useEffect(() => {
    async function loadProductData() {
      if (isEditing) {
        try {
          const docRef = doc(db, "products", id);
          const snapshot = await getDoc(docRef);
          if (snapshot.exists()) {
            const productData = snapshot.data();
            setNome(productData.nomeProduct || '');
            setPreco(productData.preco || '');
            setMarca(productData.marca || '');
            setModelo(productData.modelo || '');
            setDistribuidor(productData.distribuidor || '');
            setInfo(productData.info || '');
            setCaracteristicas(productData.caracteristicas || '');
            setEspecificacoes(productData.especificacoes || '');
            setPeso(productData.peso || '');
            setComprimento(productData.comprimento || '');
            setLargura(productData.largura || '');
            setAltura(productData.altura || '');
            
            
            // Recuperando a margem selecionada
            if (productData.margemSelecionada) {
              const margem = margens.find(m => m.id === productData.margemSelecionada.id);
              setMargemSelecionada(margem);
            }
          } else {
            toast.error("Produto não encontrado!");
          }
        } catch (error) {
          console.error("Erro ao carregar dados do produto: ", error);
          toast.error("Erro ao carregar dados do produto.");
        }
      }
    }
    loadProductData();
  }, [id, isEditing, margens]);
  

  useEffect(() => {
    async function loadMargens() {
      try {
        const margensRef = collection(db, "priceMargins");
        const snapshot = await getDocs(margensRef);
  
        if (!snapshot.empty) {
          const margensData = [];
          snapshot.forEach(doc => {
            const data = doc.data();
            if (data.prices && Array.isArray(data.prices)) {
              data.prices.forEach((margem, index) => {
                margensData.push({
                  id: `${doc.id}-${index}`, // ID único baseado no documento e índice
                  nome: margem.name || "Margem sem nome",
                  valor: margem.value || 0,
                });
              });
            }
          });
          setMargens(margensData);
        } else {
          toast.warning("Nenhuma margem encontrada.");
        }
      } catch (error) {
        console.error("Erro ao carregar margens:", error);
        toast.error("Erro ao carregar margens.");
      }
    }
  
    loadMargens();
  }, []);

  useEffect(() => {
    if (!isEditingPrecoVenda && preco && margemSelecionada) {
      const precoNumerico = parseFloat(preco.replace(/[^\d,]/g, '').replace(',', '.')); // Remove a máscara e converte em número
      const margemValor = margemSelecionada.valor / 100; // Converte a margem para decimal
      const venda = precoNumerico + precoNumerico * margemValor; // Cálculo do preço de venda
      setPrecoVenda(
        venda.toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        })
      );
    }
  }, [preco, margemSelecionada, isEditingPrecoVenda]); // Depende do estado de edição do preço de venda    

  async function getNextProductNumber() {
    try {
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
    } catch (error) {
      console.error("Erro ao obter número de produto: ", error);
      throw new Error("Erro ao gerar número de produto");
    }
  }

  async function handleDelete() {
    const confirmDelete = window.confirm("Tem certeza que deseja excluir este produto?");
    if (confirmDelete) {
      try {
        const docRef = doc(db, "products", id);
        await deleteDoc(docRef);
        toast.success("Produto excluído com sucesso!");
        navigate('/products');
      } catch (error) {
        console.error("Erro ao excluir produto: ", error);
        toast.error("Erro ao excluir produto.");
      }
    }
  }

  async function handleRegister(e) {
    e.preventDefault();
  
    if (!nome.trim()) {
      toast.error("O nome do produto é obrigatório.");
      return;
    }
    if (!preco.trim()) {
      toast.error("O preço do produto é obrigatório.");
      return;
    }
  
    const productData = {
      nomeProduct: nome,
      preco,
      marca,
      modelo,
      distribuidor,
      info,
      caracteristicas,
      especificacoes,
      peso,
      altura,
      comprimento,
      largura,
      margemSelecionada: margemSelecionada,
      precoVenda,
    };
  
    try {
      if (isEditing) {
        const docRef = doc(db, "products", id);
        await updateDoc(docRef, productData);
        toast.success("Produto atualizado com sucesso!");
      } else {
        const productNumber = await getNextProductNumber();
        await addDoc(listRef, { ...productData, productNumber, created: Timestamp.now() });
        toast.success("Produto cadastrado com sucesso!");
      }
      navigate('/products');
    } catch (error) {
      console.error(error);
      toast.error("Erro ao salvar produto.");
    }
  }

  // Função para resetar todos os campos
  const resetFields = () => {
    setNome('');
    setMarca('');
    setModelo('');
    setDistribuidor('');
    setPreco('');
    setInfo('');
    setCaracteristicas('');
    setEspecificacoes('');
    setPeso('');
    setAltura('');
    setComprimento('');
    setLargura('');
  };

  // Nova função para salvar e cadastrar novo
  async function handleSaveAndNew(e) {
    e.preventDefault();
    
    // Você pode reutilizar a lógica de validação da função handleRegister aqui
    if (!nome.trim()) {
      toast.error("O nome do produto é obrigatório.");
      return;
    }
    if (!preco.trim()) {
      toast.error("O preço do produto é obrigatório.");
      return;
    }

    const productData = {
      nomeProduct: nome,
      preco,
      marca,
      modelo,
      distribuidor,
      info,
      caracteristicas,
      especificacoes,
      peso,
      altura,
      comprimento,
      largura,
    };

    try {
      const productNumber = await getNextProductNumber();
      await addDoc(listRef, { ...productData, productNumber, created: Timestamp.now() });
      toast.success("Produto cadastrado com sucesso!");
      
      // Resetar os campos após o cadastro
      resetFields();
      
      // Redirecionar para a página de novo produto
      navigate('/newproducts');
    } catch (error) {
      console.error(error);
      toast.error("Erro ao salvar produto.");
    }
  }

  return (
    <div className={`new-product-page ${isDarkMode ? 'dark' : ''}`}>
      <NavBar />
      <div className="content">
        <Title name={isEditing ? "Atualizar produto" : "Cadastrar novo produto"}>
          <FaBoxesPacking size={25} />
        </Title>

        <div className="container">
          <form className="data-form" onSubmit={handleRegister}>
            <label>Nome:</label>
            <input 
              title="Nome do Produto"
              type="text" 
              placeholder="Nome do produto" 
              value={nome}
              maxLength={100}
              onChange={(e) => setNome(e.target.value)} 
              required 
            />

            <label>Preço de Custo:</label>
            <input
              title="Preço de custo do Produto"
              type="text"
              placeholder="R$ 0,00"
              value={preco}
              onChange={handlePrecoChange}
              required
            />
            <label>Selecione uma Margem:</label>
            <select
              value={margemSelecionada?.id || ''}
              onChange={(e) => {
                const margem = margens.find(m => m.id === e.target.value);
                setMargemSelecionada(margem);
              }}
            >
              <option value="" disabled>Selecione uma margem</option>
              {margens.map(margem => (
                <option key={margem.id} value={margem.id}>
                  {margem.nome} ({margem.valor}%)
                </option>
              ))}
            </select>
            <label>Preço de Venda:</label>
            <input
              title="Preço de Venda do Produto"
              type="text"
              placeholder="R$ 0,00"
              value={precoVenda}
              onFocus={() => setIsEditingPrecoVenda(true)} // Quando o usuário começa a editar
              onBlur={() => setIsEditingPrecoVenda(false)} // Quando o usuário termina de editar
              onChange={(e) => {
                const rawValue = e.target.value.replace(/[^\d,]/g, '').replace(',', '.'); // Remove a máscara e mantém a alteração
                const formattedValue = new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                }).format(parseFloat(rawValue) || 0); // Formata o valor como moeda
                setPrecoVenda(formattedValue); // Atualiza o estado com o valor manual
              }}
            />
            <label>Marca:</label>
            <input
              title="Marca do Produto"
              type="text"
              placeholder="Marca do Produto"
              value={marca}
              maxLength={50}
              onChange={(e) => setMarca(e.target.value)}
            />

            <label>Modelo:</label>
            <input
              title="Modelo do Produto"
              type="text"
              placeholder="Modelo do Produto"
              value={modelo}
              maxLength={50}
              onChange={(e) => setModelo(e.target.value)}
            />

            <label>Distribuidor:</label>
            <input
              title="Distribuidor do Produto"
              type="text"
              placeholder="Distribuidor do Produto"
              value={distribuidor}
              maxLength={50}
              onChange={(e) => setDistribuidor(e.target.value)}
            />

            <label>Peso:</label>
            <input
              title="Peso (gramas)"
              type="number"
              placeholder="00,000"
              value={peso}
              onChange={(e) => setPeso(e.target.value)}
            />

            <label>Altura:</label>
            <input
              title="Altura (centímetros)"
              type="number"
              placeholder="00,000"
              value={altura}
              onChange={(e) => setAltura(e.target.value)}
            />

            <label>Largura:</label>
            <input
              title="Largura (centímetros)"
              type="number"
              placeholder="00,000"
              value={largura}
              onChange={(e) => setLargura(e.target.value)}
            />

            <label>Comprimento:</label>
            <input
              title="Comprimento (centímetros)"
              type="number"
              placeholder="00,000"
              value={comprimento}
              onChange={(e) => setComprimento(e.target.value)}
            />

            <label>Características:</label>
            <textarea
              title="Características do produto"
              placeholder="Características do produto"
              value={caracteristicas}
              maxLength={500}
              onChange={(e) => setCaracteristicas(e.target.value)}
            />

            <label>Especificações:</label>
            <textarea
              title="Especificações do produto"
              placeholder="Especificações do produto"
              value={especificacoes}
              maxLength={500}
              onChange={(e) => setEspecificacoes(e.target.value)}
            />

            <label>Informações Adicionais:</label>
            <textarea
              title="Descrição do produto"
              placeholder="Informações do produto"
              value={info}
              maxLength={500}
              onChange={(e) => setInfo(e.target.value)}
            />
            <div className="form-button">
            <button type="submit" className="save-button">
              <FaBoxesPacking color="#000" size={25} />
              {isEditing ? "Atualizar produto" : "Cadastrar produto"}
            </button>
            
            {!isEditing && (
              <button onClick={handleSaveAndNew} className="savemore-button">
                <FaBoxesPacking color="#000" size={25} />
                Salvar Produto e Cadastrar Novo
              </button>
            )}

            {isEditing && (
              <button type="button" onClick={handleDelete} className="delete-button">
                <FaBoxesPacking color="#000" size={25} />
                Excluir Produto
              </button>
            )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
