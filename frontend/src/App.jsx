import React from 'react'
import Adminlayout from './components/layout/Sidebar'
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import SpareParts from './components/Pages/SpareParts';
import SaleRegisterModal from './components/Pages/SparePartsSell';

const App = () => {
  return (
    <BrowserRouter>
            <Routes>
                <Route element={<SpareParts/>} path='/'/>
               <Route element={<SaleRegisterModal visible={true} onCancel={() => {}} onSubmit={() => {}} spareParts={[]}/>} path='/sale'/>
               
            
                
            </Routes>
        </BrowserRouter>
  )
}

export default App