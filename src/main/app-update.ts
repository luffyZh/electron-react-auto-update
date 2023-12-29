/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable promise/always-return */
/* eslint-disable promise/catch-or-return */
/* eslint-disable import/prefer-default-export */
import {
  app,
  dialog,
  BrowserWindow,
  MessageBoxOptions,
  MessageBoxReturnValue,
} from 'electron';
import { join } from 'path';
import { autoUpdater } from 'electron-updater';
import logger from 'electron-log';
import Store from 'electron-store';

const store = new Store();

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

/**
 * 用户确定是否下载更新
 */
export function downloadUpdate() {
  autoUpdater.downloadUpdate();
}

/**
 * 自动更新的逻辑
 * @param mainWindow
 */
export async function autoUpdateApp(mainWindow: BrowserWindow) {
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
    logger.info(info);
    downloadUpdate();
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
  autoUpdater.on('update-downloaded', (info) => {
    // 检查是否用户已经跳过了当前版本
    const skippedVersion = store.get('skippedVersion');
    logger.info('下载完毕！提示安装更新');
    logger.info(info);
    // 如果当前下载的版本就是设置的跳过的版本，那么就不提示用户安装
    if (info.version === skippedVersion) return;
    // 定义 Dialog 参数
    const dialogOpts: MessageBoxOptions = {
      type: 'info',
      buttons: ['取消', '跳过版本', '更新'],
      title: '升级提示',
      message: '已为您下载最新应用!',
      detail:
        '点击“更新”马上替换为最新版本，点击“跳过版本”不再接收当前版本更新。',
    };
    // dialog 想要使用，必须在 BrowserWindow 创建之后
    dialog
      .showMessageBox(dialogOpts)
      .then((returnVal: MessageBoxReturnValue) => {
        const { response } = returnVal;
        if (response === 2) {
          logger.info('退出应用，安装开始！');
          // 安装的时候如果设置过 skkipVersion, 需要清除掉
          store.delete('skippedVersion');
          // 走默认的自动更新逻辑
          autoUpdater.quitAndInstall();
        } else if (response === 1) {
          // 如果用户选择跳过版本，我们储存这个版本号到 electron-store
          store.set('skippedVersion', info.version);
        } else {
          logger.info('用户点击了取消，本次不进行升级');
        }
      });
  });
}
