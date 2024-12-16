// src/pages/Profile/index.js

import { useContext, useState, useEffect } from 'react';
import NavBar from '../../components/NavBar';
import Title from '../../components/Title';
import { FiUpload } from 'react-icons/fi';
import { BsPersonFillGear } from "react-icons/bs";
import { RiSave3Fill } from "react-icons/ri";
import { IoLogOut } from "react-icons/io5";
import avatar from '../../assets/avatarPerfil.webp';
import avatarEmpresa from '../../assets/avatarEmpresa.webp';
import { AuthContext } from '../../contexts/auth';
import { db, storage } from '../../services/firebaseConnection';
import DarkModeContext from '../../contexts/DarkModeContext';
import { doc, updateDoc, setDoc, getDoc, collection } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import InputMask from 'react-input-mask';
import { toast } from 'react-toastify';
import './profile.css';

export default function Profile() {
    const { user, storageUser, setUser, logout } = useContext(AuthContext);
    const { isDarkMode } = useContext(DarkModeContext);

    // Campos para dados do usuário e empresa
    const [avatarUrl, setAvatarUrl] = useState(user && user.avatarUrl);
    const [imageAvatar, setImageAvatar] = useState(null);
    const [nome, setNome] = useState(user && user.nome);
    const [email] = useState(user && user.email);
    const [razaoSocial, setRazaoSocial] = useState(user && (user.razaoSocial || ''));
    const [cnpj, setCnpj] = useState(user && (user.cnpj || ''));
    const [telefone, setTelefone] = useState(user && (user.telefone || ''));
    const [endereco, setEndereco] = useState(user && (user.endereco || ''));
    const [imageEmpresaUrl, setimageEmpresaUrl] = useState(user && (user.imageEmpresaUrl || null));
    const [imageEmpresa, setimageEmpresa] = useState(null);

    // Campos para Preços em Tabela
    const [priceName1, setPriceName1] = useState('');
    const [price1, setPrice1] = useState('');
    const [priceName2, setPriceName2] = useState('');
    const [price2, setPrice2] = useState('');
    const [priceName3, setPriceName3] = useState('');
    const [price3, setPrice3] = useState('');

    useEffect(() => {
        // Atualiza os dados do usuário na inicialização
        if (user) {
            setRazaoSocial(user.razaoSocial || '');
            setCnpj(user.cnpj || '');
            setTelefone(user.telefone || '');
            setEndereco(user.endereco || '');
        }
    
        // Função para carregar margens de preço
        async function loadPriceMargins() {
            try {
                const priceMarginsRef = doc(db, 'priceMargins', user.uid); // Documento pelo UID do usuário
                const priceMarginsSnap = await getDoc(priceMarginsRef);
    
                if (priceMarginsSnap.exists()) {
                    const data = priceMarginsSnap.data();
                    const prices = data.prices || [];
    
                    // Atualiza os estados com os valores recuperados
                    if (prices[0]) {
                        setPriceName1(prices[0].name || '');
                        setPrice1(prices[0].value || '');
                    }
                    if (prices[1]) {
                        setPriceName2(prices[1].name || '');
                        setPrice2(prices[1].value || '');
                    }
                    if (prices[2]) {
                        setPriceName3(prices[2].name || '');
                        setPrice3(prices[2].value || '');
                    }
                } else {
                    console.log('Nenhuma margem de preço encontrada.');
                }
            } catch (error) {
                console.error('Erro ao carregar margens de preço:', error);
            }
        }
    
        // Chama a função de carregamento das margens de preço caso o usuário esteja definido
        if (user) {
            loadPriceMargins();
        }
    }, [user]); // Dependência no `user` para garantir que recarregue quando o usuário mudar
    

    // Função para salvar margens de preço em uma nova coleção no Firestore
    async function savePriceMargins() {
        const priceMarginsRef = collection(db, 'priceMargins');
        
        const priceMarginsData = [
            { name: priceName1, value: price1 },
            { name: priceName2, value: price2 },
            { name: priceName3, value: price3 },
        ];
        
        // Criar um documento único para as margens de preço com o user.uid
        await setDoc(doc(priceMarginsRef, user.uid), { prices: priceMarginsData });
    }

    // Função para upload da imagem do perfil
    function handleFile(e) {
        if (e.target.files[0]) {
            const image = e.target.files[0];
            if (image.type === 'image/png' || image.type === 'image/jpeg') {
                setImageAvatar(image);
                setAvatarUrl(URL.createObjectURL(image));
            } else {
                alert("Envie uma imagem do tipo PNG ou JPEG");
                setImageAvatar(null);
                return;
            }
        }
    }

    // Função para upload da imagem da empresa
    function handleSecondFile(e) {
        if (e.target.files[0]) {
            const image = e.target.files[0];
            if (image.type === 'image/png' || image.type === 'image/jpeg') {
                setimageEmpresa(image);
                setimageEmpresaUrl(URL.createObjectURL(image));
            } else {
                alert("Envie uma imagem do tipo PNG ou JPEG");
                setimageEmpresa(null);
                return;
            }
        }
    }

    // Função para remover a imagem do avatar
    function handleRemoveAvatar() {
        setAvatarUrl(null);
        setImageAvatar(null);
    }

    // Função para remover a imagem da empresa
    function handleRemoveEmpresaAvatar() {
        setimageEmpresaUrl(null);
        setimageEmpresa(null);
    }

    // Função para upload de dados do perfil no Firestore
    async function handleUpload() {
        const currentUid = user.uid;

        const uploadRef = ref(storage, `images/${currentUid}/${imageAvatar.name}`);
        const secondUploadRef = ref(storage, `images/${currentUid}/${imageEmpresa?.name}`);

        uploadBytes(uploadRef, imageAvatar).then((snapshot) => {
            getDownloadURL(snapshot.ref).then(async (downloadURL) => {
                let urlFoto = downloadURL;
                const docRef = doc(db, "users", user.uid);
                let updates = {
                    avatarUrl: urlFoto,
                    nome: nome,
                    razaoSocial: razaoSocial,
                    cnpj: cnpj,
                    telefone: telefone,
                    endereco: endereco,
                };

                // Verifica se existe segunda imagem para upload
                if (imageEmpresa) {
                    uploadBytes(secondUploadRef, imageEmpresa).then((secondSnapshot) => {
                        getDownloadURL(secondSnapshot.ref).then(async (secondUrl) => {
                            updates.imageEmpresaUrl = secondUrl;
                            await updateDoc(docRef, updates);

                            let data = {
                                ...user,
                                avatarUrl: urlFoto,
                                imageEmpresaUrl: secondUrl,
                                nome,
                                razaoSocial,
                                cnpj,
                                telefone,
                                endereco,
                            };
                            setUser(data);
                            storageUser(data);
                            toast.success("Atualizado com sucesso!");
                        });
                    });
                } else {
                    await updateDoc(docRef, updates);
                    let data = {
                        ...user,
                        avatarUrl: urlFoto,
                        nome,
                        razaoSocial,
                        cnpj,
                        telefone,
                        endereco,
                    };
                    setUser(data);
                    storageUser(data);
                    toast.success("Atualizado com sucesso!");
                }
            });
        }).catch((error) => {
            console.error("Erro ao fazer upload da imagem: ", error);
            toast.error("Erro ao fazer upload da imagem");
        });
    }

    // Função para envio dos dados do perfil e margens de preço
    async function handleSubmit(e) {
        e.preventDefault();
        if (imageAvatar === null && nome !== '') {
            const docRef = doc(db, "users", user.uid);
            let updates = {
                nome,
                razaoSocial,
                cnpj,
                telefone,
                endereco,
            };

            if (imageEmpresa) {
                const secondUploadRef = ref(storage, `images/${user.uid}/${imageEmpresa.name}`);
                uploadBytes(secondUploadRef, imageEmpresa).then((snapshot) => {
                    getDownloadURL(snapshot.ref).then(async (downloadURL) => {
                        updates.imageEmpresaUrl = downloadURL;
                        await updateDoc(docRef, updates);

                        let data = {
                            ...user,
                            nome,
                            razaoSocial,
                            cnpj,
                            telefone,
                            endereco,
                            imageEmpresaUrl: downloadURL,
                        };
                        setUser(data);
                        storageUser(data);
                        toast.success("Atualizado com sucesso!");
                    });
                });
            } else {
                await updateDoc(docRef, updates);

                let data = {
                    ...user,
                    nome,
                    razaoSocial,
                    cnpj,
                    telefone,
                    endereco,
                };
                setUser(data);
                storageUser(data);
                toast.success("Atualizado com sucesso!");
            }
        } else if (nome !== '' && imageAvatar !== null) {
            handleUpload();
        }
        
        // Salva margens de preço
        await savePriceMargins();
    }

    return (
        <div className={`profile-page ${isDarkMode ? 'dark' : ''}`}>
            <NavBar />
            <div className="content">
                <Title name="Minha Conta">
                    <BsPersonFillGear size={25} />
                </Title>
                <div className="container">
                    <form className="form-profile" onSubmit={handleSubmit}>
                        <h3>Dados do perfil de usuário</h3>
                        {/* Campos do perfil de usuário e dados da empresa */}
                        <label className="label-avatar">
                            <span><FiUpload color="#F0F0F0" title="Enviar imagem de perfil" size={40} /></span>
                            <input type="file" accept="image/*" onChange={handleFile} /> <br />
                            {avatarUrl === null ? (
                                <img src={avatar} alt="Foto de perfil do usuário" width={250} height={250} />
                            ) : (
                                <img src={avatarUrl} alt="Foto de perfil do usuário" width={250} height={250} />
                            )}
                            <button type="button" className="remove-image-btn" title="Remove Imagem enviada" onClick={handleRemoveAvatar}>Remover imagem</button>
                        </label>

                        <label>Nome</label>
                        <input type="text" title="Nome do usuário logado" value={nome} onChange={(e) => setNome(e.target.value)} />

                        <label>Email</label>
                        <input type="text" title="Email do usuário logado" value={email} disabled={true} />

                        {/* Dados da empresa */}
                        <h3>Dados da Empresa</h3>
                        <label className="label-avatar">
                            <span><FiUpload color="#F0F0F0" title="Enviar imagem da empresa" size={40} /></span>
                            <input type="file" accept="image/*" onChange={handleSecondFile} /> <br />
                            {imageEmpresaUrl === null ? (
                                <img src={avatarEmpresa} alt="Imagem da empresa" width={250} height={250} />
                            ) : (
                                <img src={imageEmpresaUrl} alt="Imagem da empresa" width={250} height={250} />
                            )}
                            <button type="button" className="remove-image-btn" title="Remove Imagem enviada" onClick={handleRemoveEmpresaAvatar}>Remover imagem</button>
                        </label>

                        <label>Razão Social</label>
                        <input type="text" title="Nome da empresa que irá aparecer na OS" placeholder="Razão Social da sua empresa" value={razaoSocial} onChange={(e) => setRazaoSocial(e.target.value)} />

                        <label>CNPJ</label>
                        <InputMask mask="99.999.999/9999-99" type="text" title="CNPJ da empresa que irá aparecer na OS" placeholder="Digite seu CNPJ" value={cnpj} onChange={(e) => setCnpj(e.target.value)} />

                        <label>Telefone</label>
                        <InputMask mask="(99) 99999-9999" type="text" title="Telefone da empresa que irá aparecer na OS" placeholder="Digite seu Telefone" value={telefone} onChange={(e) => setTelefone(e.target.value)} />

                        <label>Endereço</label>
                        <input type="text" title="Endereço da empresa que irá aparecer na OS" placeholder="Digite seu endereço" value={endereco} onChange={(e) => setEndereco(e.target.value)} />

                        {/* Campos para Margens de Preço */}
                        <h3>Margens de Preços Tabela</h3>
                        {[{
                            name: '1', priceName: priceName1, setPriceName: setPriceName1, price: price1, setPrice: setPrice1
                            }, {
                            name: '2', priceName: priceName2, setPriceName: setPriceName2, price: price2, setPrice: setPrice2
                            }, {
                            name: '3', priceName: priceName3, setPriceName: setPriceName3, price: price3, setPrice: setPrice3
                            }].map(({ name, priceName, setPriceName, price, setPrice }) => (
                            <div key={name}>
                                <h4>Preço {name}</h4>
                                <input
                                    type="text"
                                    title={`Nome de margem ${name}`}
                                    placeholder={`Nome do Preço ${name}`}
                                    value={priceName}
                                    onChange={(e) => setPriceName(e.target.value)}
                                />
                                <div className="percent-input-wrapper">
                                    <input
                                        type="number"
                                        title={`Valor de margem em % para o preço ${name}`}
                                        placeholder="Valor"
                                        value={price}
                                        onChange={(e) => setPrice(e.target.value)}
                                    />
                                    <span className="percent-symbol">%</span>
                                </div>
                            </div>
                        ))}
                        <button type="submit" className="save-profile-btn" title="Salvar alterações"><RiSave3Fill size={25} />Salvar</button>
                    </form>
                </div>
                <div className="container">
                    <div className="logout-container">
                        <button className="logout-btn" title="Desconectar da conta" onClick={() => logout()}><IoLogOut size={25} />Sair da conta</button>
                        <span className="span-autor">Desenvolvido por Mateus Gaudencio</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
