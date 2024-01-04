import { useEffect, useState } from 'react';
import { Button, Progress } from 'antd';
import styled from 'styled-components';

const Container = styled.div`
  position: relative;
  height: 100%;
  width: 100%;
  background-color: #fff;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;

  h1 {
    margin-top: 20px;
    font-size: 40px;
    color: #333;
    letter-spacing: 10px;
  }
`;

export default function Upgrade() {
  const [progress, setProgress] = useState<number>(0);
  useEffect(() => {
    // 跳转到此页面，立刻开始下载
    window.electron.ipcRenderer.sendMessage('download-update');
    // 同时同步监听下载进度
    window.electron.ipcRenderer.on('download-progress', (prog: any) => {
      setProgress(prog);
    });
    // 监听下载完成
    window.electron.ipcRenderer.on('update-downloaded', (info) => {
      // 提示用户安装更新
      console.log('update-downloaded: ', info);
      // 下载完成设置 progress 为 100
      setProgress(100);
    });
  }, []);
  // 安装更新
  const installupdate = () => {
    window.electron.ipcRenderer.sendMessage('install-update');
  };
  return (
    <Container>
      <Progress type="circle" percent={progress} size={320} />
      {progress >= 100 ? (
        <h1
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          应用下载完成
          <Button
            onClick={installupdate}
            type="primary"
            style={{ marginTop: 20 }}
            size="large"
          >
            退出并安装更新
          </Button>
        </h1>
      ) : (
        <h1>正在下载更新...</h1>
      )}
    </Container>
  );
}
