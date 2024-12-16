// src/pages/NewTicket/index.js

import NavBar from '../../components/NavBar';
import Title from '../../components/Title';
import { AuthContext } from '../../contexts/auth';
import { useState, useEffect, useContext, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../../services/firebaseConnection';
import { collection, getDocs, getDoc, doc, addDoc, updateDoc, setDoc } from 'firebase/firestore';
import { BiSolidMessageAdd, BiMessageAdd, BiSolidMessageEdit } from "react-icons/bi";
import { toast } from 'react-toastify';
import './newticket.css';

const listRef = collection(db, "customers");
const ticketCounterRef = doc(db, "counters", "ticketNumber");

export default function NewTicket() {
    const { user } = useContext(AuthContext);
    const { id } = useParams();
    const navigate = useNavigate();

    const [customers, setCustomers] = useState([]);
    const [loadCustomer, setLoadCustomer] = useState(true);
    const [customerSelected, setCustomerSelected] = useState('');
    const [laudo, setLaudo] = useState('');
    const [assunto, setAssunto] = useState('');
    const [status, setStatus] = useState('');
    const [idCustomer, setIdCustomer] = useState(false);
    const [ticketNumber, setTicketNumber] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        loadCustomers();
    }, [id]);

    const loadTicketData = useCallback(async (ticketId) => {
        try {
            const ticketDoc = await getDoc(doc(db, "tickets", ticketId));
            if (ticketDoc.exists()) {
                const ticketData = ticketDoc.data();
                setAssunto(ticketData.assunto);
                setStatus(ticketData.status);
                setLaudo(ticketData.laudo);
                setCustomerSelected(ticketData.clienteId);
                setTicketNumber(ticketData.ticketNumber);
                setIdCustomer(true);
            } else {
                toast.error("Ticket não encontrado");
                navigate('/dashboard');
            }
        } catch (error) {
            console.error("Erro ao carregar dados do ticket:", error);
        }
    }, [navigate]);

    const generateTicketNumber = useCallback(async () => {
        try {
            const snapshot = await getDoc(ticketCounterRef);
            const lastNumber = snapshot.exists() ? snapshot.data().lastNumber : 0;
            const newNumber = lastNumber + 1;

            await setDoc(ticketCounterRef, { lastNumber: newNumber });
            setTicketNumber(newNumber);
        } catch (error) {
            console.error("Erro ao gerar número de ticket:", error);
            toast.error("Erro ao gerar número de ticket");
        }
    }, []);

    useEffect(() => {
        if (id) {
            loadTicketData(id);
        } else {
            generateTicketNumber();
        }
    }, [id, loadTicketData, generateTicketNumber]);

    async function loadCustomers() {
        try {
            const snapshot = await getDocs(listRef);
            const customerList = snapshot.docs.map(doc => ({ id: doc.id, nomeCustomer: doc.data().nomeCustomer }));

            setCustomers(customerList.length ? customerList : [{ id: '1', nomeCustomer: 'Lista Vazia' }]);
        } catch (error) {
            console.error("Erro ao carregar clientes:", error);
            setCustomers([{ id: '1', nomeCustomer: 'Erro ao buscar clientes' }]);
        } finally {
            setLoadCustomer(false);
        }
    }

    const handleStatusChange = (e) => setStatus(e.target.value);
    const handleAssuntoChange = (e) => setAssunto(e.target.value);
    const handleCustomerChange = (e) => setCustomerSelected(e.target.value);

    async function handleRegisterNewTicket(e) {
        e.preventDefault();
        if (isSaving) return;

        if (!customerSelected || !assunto || !status || !laudo) {
            toast.error("Todos os campos são obrigatórios!");
            return;
        }

        setIsSaving(true);

        const selectedCustomer = customers.find(customer => customer.id === customerSelected);
        if (!selectedCustomer) {
            toast.error("Cliente selecionado não encontrado!");
            setIsSaving(false);
            return;
        }

        const ticketData = {
            created: new Date(),
            cliente: selectedCustomer.nomeCustomer,
            clienteId: selectedCustomer.id,
            assunto,
            laudo,
            status,
            userId: user.uid,
            ticketNumber
        };

        try {
            if (idCustomer) {
                await updateDoc(doc(db, "tickets", id), ticketData);
                toast.success("O.S atualizada com sucesso!");
            } else {
                await addDoc(collection(db, "tickets"), ticketData);
                toast.success("Nova Ordem de Serviço criada com sucesso!");
            }

            navigate('/dashboard');
        } catch (error) {
            console.error("Erro ao processar a Ordem de Serviço:", error);
            toast.error("Erro ao processar a Ordem de Serviço");
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <div>
            <NavBar />
            <div className="content">
                <Title name={id ? "Editar Ordem de Serviço" : "Nova Ordem de Serviço"}>
                    <BiMessageAdd color="#000" size={25} />
                </Title>
                <div className="container">
                    <form className="form-newticket" onSubmit={handleRegisterNewTicket}>
                        <label>Cliente</label>
                        {
                            loadCustomer ? (
                                <input type="text" disabled value="Carregando..." />
                            ) : (
                                <select value={customerSelected} onChange={handleCustomerChange}>
                                    <option value="">Selecione o cliente</option>
                                    {customers.map(item => (
                                        <option key={item.id} value={item.id}>{item.nomeCustomer}</option>
                                    ))}
                                </select>
                            )
                        }

                        <label>Assunto</label>
                        <select value={assunto} onChange={handleAssuntoChange}>
                            <option value="">Selecione o assunto</option>
                            <option value="Suporte Remoto">Suporte Remoto</option>
                            <option value="Visita Técnica">Visita Técnica</option>
                            <option value="Manutenção em Balcão">Manutenção em Balcão</option>
                        </select>

                        <label>Status</label>
                        <div className="status">
                            {["Aguardando Orçamento", "Orçamento Aprovado", "O.S Concluída", "O.S Cancelada"].map(opt => (
                                <label key={opt}>
                                    <input
                                        type="radio"
                                        name="status"
                                        value={opt}
                                        checked={status === opt}
                                        onChange={handleStatusChange}
                                    />
                                    {opt}
                                </label>
                            ))}
                        </div>

                        <label>Laudo Técnico</label>
                        <textarea
                            placeholder="Descrição do problema."
                            value={laudo}
                            onChange={(e) => setLaudo(e.target.value)}
                        />

                        <button type="submit" className="save-newticket-btn" disabled={isSaving}>
                            {isSaving ? "Cadastrando..." : id ? (
                                <>
                                    <BiSolidMessageEdit color="#000" size={25} /> Atualizar O.S
                                </>
                            ) : (
                                <>
                                    <BiSolidMessageAdd color="#000" size={25} /> Criar nova O.S
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
