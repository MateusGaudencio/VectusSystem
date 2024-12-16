import { Routes, Route } from 'react-router-dom'

import SignIn from '../pages/SignIn';
import SignUp from '../pages/SignUp';
import Private from './Private';
import Tickets from '../pages/Tickets';
import Budgets from '../pages/Budgets';
import Sales from '../pages/Sales';
import Profile from '../pages/Profile';
import Customers from '../pages/Customers';
import Services from '../pages/Services';
import Products from '../pages/Products';
import Storage from '../pages/Storage';
import Finances from '../pages/Finances';
import NewTicket from '../pages/NewTicket';
import NewBudget from '../pages/NewBudget';
import NewSale from '../pages/NewSale';
import NewCustomers from '../pages/NewCustomers';
import NewServices from '../pages/NewServices';
import NewProducts from '../pages/NewProducts';


function RoutesApp () {
    return (
        <Routes>
            <Route path="/" element={<SignIn/>}/>
            <Route path="/register" element={<SignUp/>}/>
            <Route path="/tickets" element={<Private><Tickets/></Private>}/>
            <Route path="/budgets" element={<Private><Budgets/></Private>}/>
            <Route path="/sales" element={<Private><Sales/></Private>}/>
            <Route path="/newticket" element={<Private><NewTicket/></Private>}/>
            <Route path="/newticket/:id" element={<Private><NewTicket/></Private>}/>
            <Route path="/newbudget" element={<Private><NewBudget/></Private>}/>
            <Route path="/newbudget/:id" element={<Private><NewBudget/></Private>}/>
            <Route path="/newsale" element={<Private><NewSale/></Private>}/>
            <Route path="/newsale/:id" element={<Private><NewSale/></Private>}/>
            <Route path="/profile" element={<Private><Profile/></Private>}/>
            <Route path="/customers" element={<Private><Customers/></Private>}/>
            <Route path="/services" element={<Private><Services/></Private>}/>
            <Route path="/products" element={<Private><Products/></Private>}/>
            <Route path="/storage" element={<Private><Storage/></Private>}/>
            <Route path="/finances" element={<Private><Finances/></Private>}/>
            <Route path="/newcustomers" element={<Private><NewCustomers/></Private>}/>
            <Route path="/newcustomers/:id" element={<Private><NewCustomers/></Private>}/>
            <Route path="/newproducts" element={<Private><NewProducts/></Private>}/>
            <Route path="/newproducts/:id" element={<Private><NewProducts/></Private>}/>
            <Route path="/newservices" element={<Private><NewServices/></Private>}/>
            <Route path="/newservices/:id" element={<Private><NewServices/></Private>}/>
        </Routes>
    )
}

export default RoutesApp;