import { useEffect } from 'react';
import {
  MemoryRouter as Router,
  Routes,
  Route,
  useNavigate,
} from 'react-router-dom';
import { Modal } from 'antd';
import icon from '../../assets/icon.svg';
import Upgrade from './pages/upgrade';
import './App.css';

function Home() {
  const [modal, contextHolder] = Modal.useModal();
  const navigate = useNavigate();
  useEffect(() => {
    window.electron.ipcRenderer.on('update-available', (info: any) => {
      // 显示 UI 提示用户有更新可用
      console.log('update-available: ', info);
      modal.confirm({
        title: `检测到新版本：${info.version}`,
        content: '点击确定立即更新',
        onOk: () => {
          navigate('/upgrade');
        },
        onCancel: () => {
          console.log('cancel update');
        },
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <>
      {contextHolder}
      <div className="Hello">
        <img width="200" alt="icon" src={icon} />
        <h1 style={{ margin: '20px 0' }}>electron-react-boilerplate V0.1.0</h1>
      </div>
    </>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/upgrade" element={<Upgrade />} />
      </Routes>
    </Router>
  );
}
