/* eslint-disable promise/always-return */
/* eslint-disable promise/catch-or-return */
/* eslint-disable import/prefer-default-export */
import { app, dialog } from 'electron';
import { join } from 'path';
import { autoUpdater } from 'electron-updater';
import logger from 'electron-log';

// 打印更新相关的 log 到本地
logger.transports.file.maxSize = 1002430; // 10M
logger.transports.file.format =
  '[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}]{scope} {text}';
logger.transports.file.resolvePath = () =>
  join(app.getPath('logs'), 'auto-update.log');

async function sleep(ms: number) {
  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      resolve(true);
      clearTimeout(timer);
    }, ms);
  });
}

export async function autoUpdateApp() {
  // 等待 3 秒再检查更新，确保窗口准备完成，用户进入系统
  await sleep(3000);
  // 每次启动自动更新检查更新版本
  autoUpdater.checkForUpdates();
  autoUpdater.logger = logger;
  autoUpdater.disableWebInstaller = false;
  // 这个写成 false，写成 true 时，可能会报没权限更新
  autoUpdater.autoDownload = false;
  autoUpdater.on('error', (error) => {
    logger.error(['检查更新失败', error]);
  });
  // 当有可用更新的时候触发。 更新将自动下载。
  autoUpdater.on('update-available', (info) => {
    logger.info('检查到有更新，开始下载新版本');
    const { version } = info;
    logger.info(`最新版本为： ${version}`);
    // 这里做的是检测到更新，直接就下载
    autoUpdater.downloadUpdate();
  });
  // 当没有可用更新的时候触发，其实就是啥也不用做
  autoUpdater.on('update-not-available', () => {
    logger.info('没有可用更新');
  });
  // 下载更新包的进度，可以用于显示下载进度与前端交互等
  autoUpdater.on('download-progress', async (progress) => {
    logger.info(progress);
  });
  // 在更新下载完成的时候触发。
  autoUpdater.on('update-downloaded', (res) => {
    logger.info('下载完毕, 提示安装更新', res);
    // 这里需要注意，Electron.dialog 想要使用，必须在 BrowserWindow 创建之后
    dialog
      .showMessageBox({
        title: '更新应用',
        message: '已为您下载最新应用，点击确定马上替换为最新版本！',
      })
      .then(() => {
        logger.info('退出应用，安装开始！');
        // 重启应用并在下载后安装更新，它只应在发出 update-downloaded 这个事件后方可被调用。
        autoUpdater.quitAndInstall();
      });
  });
}
