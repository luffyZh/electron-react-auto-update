/* eslint-disable promise/always-return */
/* eslint-disable promise/catch-or-return */
/* eslint-disable import/prefer-default-export */
// src/main/autoUpdater.js

import { app, dialog } from 'electron';
import { join } from 'path';
import { autoUpdater } from 'electron-updater';
import logger from 'electron-log';
import { sleep } from './helper';

async function askUpdate(version: string) {
  logger.info(`最新版本 ${version}`);
  logger.info(
    JSON.stringify({
      ver: version,
    }),
  );
  // 不再询问 直接下载更新
  autoUpdater.downloadUpdate();
}

export async function autoUpdateInit() {
  // 打印log到本地
  logger.transports.file.maxSize = 1002430; // 10M
  logger.transports.file.format =
    '[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}]{scope} {text}';
  logger.transports.file.resolvePath = () =>
    join(app.getPath('logs'), 'auto-update.log');

  await sleep(5000);
  // 每次启动自动更新检查 更新版本 --可以根据自己方式更新，定时或者什么
  autoUpdater.checkForUpdates();
  autoUpdater.logger = logger;
  autoUpdater.disableWebInstaller = false;
  autoUpdater.autoDownload = false; // 这个必须写成 false，写成 true 时，可能会报没权限更新，也没清楚什么原因
  autoUpdater.on('error', (error) => {
    logger.error(['检查更新失败', error]);
  });
  // 当有可用更新的时候触发。 更新将自动下载。
  autoUpdater.on('update-available', (info) => {
    logger.info('检查到有更新，开始下载新版本');
    logger.info(info);
    const { version } = info;
    askUpdate(version);
  });
  // 当没有可用更新的时候触发。
  autoUpdater.on('update-not-available', () => {
    logger.info('没有可用更新');
  });
  // 在应用程序启动时设置差分下载逻辑
  autoUpdater.on('download-progress', async (progress) => {
    logger.info(progress);
  });
  // 在更新下载完成的时候触发。
  autoUpdater.on('update-downloaded', (res) => {
    logger.info('下载完毕！提示安装更新');
    logger.info(res);
    // dialog 想要使用，必须在 BrowserWindow 创建之后
    dialog
      .showMessageBox({
        title: '升级提示！',
        message: '已为您下载最新应用，点击确定马上替换为最新版本！',
      })
      .then(() => {
        logger.info('退出应用，安装开始！');
        // 重启应用并在下载后安装更新。 它只应在发出 update-downloaded 后方可被调用。
        autoUpdater.quitAndInstall();
      });
  });
}
