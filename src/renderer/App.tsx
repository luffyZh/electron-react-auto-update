import { useEffect } from 'react';
import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import icon from '../../assets/icon.svg';
import './App.css';

function Hello() {
  useEffect(() => {
    window.electron.ipcRenderer.on('update-available', (info) => {
      // 显示 UI 提示用户有更新可用
      console.log('update-available: ', info);
    });

    window.electron.ipcRenderer.on('download-progress', (progress) => {
      // 更新下载进度条
      console.log('download-progress: ', progress);
    });

    window.electron.ipcRenderer.on('update-downloaded', (info) => {
      // 提示用户安装更新
      console.log('update-downloaded: ', info);
    });
  }, []);
  return (
    <div>
      <div className="Hello">
        <img width="200" alt="icon" src={icon} />
      </div>
      <h1>electron-react-boilerplate V0.1.0</h1>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Hello />} />
      </Routes>
    </Router>
  );
}
