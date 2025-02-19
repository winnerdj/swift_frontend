import React from 'react'
import ReactDOM from 'react-dom/client'
import './global.css';

import { store } from '@/lib/redux/store';
import { Provider } from 'react-redux';
import {ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { RouterProvider } from 'react-router-dom';
import router from '@/lib/router.tsx';
// import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <ToastContainer/>
      <RouterProvider router={router}/>
    </Provider>
  </React.StrictMode>,
)
