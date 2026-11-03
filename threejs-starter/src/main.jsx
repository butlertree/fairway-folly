import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import {canPreviewPremium} from './feature-gates.js';
import './style.css';

const Preview = import.meta.env.DEV && canPreviewPremium({development:import.meta.env.DEV,requested:new URLSearchParams(location.search).has('lab')}) ? React.lazy(()=>import('./PremiumLab.jsx')) : null;

createRoot(document.getElementById('root')).render(
  <React.StrictMode>{Preview?<React.Suspense fallback={<p>Opening private design lab…</p>}><Preview/></React.Suspense>:<App/>}</React.StrictMode>
);
