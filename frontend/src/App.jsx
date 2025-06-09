import React from 'react'
import Adminlayout from './components/layout/Sidebar'
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import SpareParts from './components/Pages/SpareParts';
import SaleRegisterModal from './components/Pages/SparePartsSell';
import PurchaseRegister from './components/Pages/Purchase';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<SpareParts />} path='/' />
        <Route element={<SaleRegisterModal />} path='/sale' />
        <Route element={<PurchaseRegister />} path='/purchase' />



      </Routes>
    </BrowserRouter>
  )
}

export default App