import ReactDOM from 'react-dom/client';
import App from './App';
import DataProvider from './store/DataContext';
import SettingProvider from './store/SettingContext';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <DataProvider>
    <SettingProvider>
      <App />
    </SettingProvider>
  </DataProvider>
);
