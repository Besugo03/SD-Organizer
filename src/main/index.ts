import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import fs from 'fs'

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1000,
    height: 900,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      webSecurity: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.handle('requestImages', (_, arg) => {
    const currentDir = arg
    const explored = fs.readdirSync(currentDir)
    if (!explored.includes('Good')) {
      fs.mkdirSync(`${currentDir}\\Good`)
    }
    if (!explored.includes('Discarded')) {
      fs.mkdirSync(`${currentDir}\\Discarded`)
    }
    if (!explored.includes('ToEdit')) {
      fs.mkdirSync(`${currentDir}\\ToEdit`)
    }
    // remove from the array all files that are not images
    const filtered = explored.filter((file) => {
      return file.endsWith('.jpg') || file.endsWith('.png')
    })
    console.log(explored)
    console.log(filtered)
    return filtered
  })

  ipcMain.handle('moveImage', (_, dir: string, imageName: string, ImageRating: string) => {
    console.log('moveImage')
    console.log(imageName, ImageRating)
    let folder = ''
    switch (ImageRating) {
      case 'good':
        folder = 'Good'
        break
      case 'bad':
        folder = 'Discarded'
        break
      case 'edit':
        folder = 'ToEdit'
        break
      default:
        folder = ''
    }
    fs.renameSync(`${dir}\\${imageName}`, `${dir}\\${folder}\\${imageName}`)
  })

  // this is ment to be used in the extras-images folder, to check if an image with the same name is present in the watermarked folder
  ipcMain.handle('watermarkedImageCheck', (_, imageDir: string) => {
    const currentDir = imageDir.split('\\').slice(0, -1).join('\\')
    const imageName = imageDir.split('\\').slice(-1).join('\\')
    const watermarkedImages = fs.readdirSync(`${currentDir}\\watermarked`)
    // if the image is present in the watermarked folder, return true (the format can be both .jpg and .png)
    if (
      watermarkedImages.includes(imageName) ||
      watermarkedImages.includes(imageName.replace('.png', '.jpg')) ||
      watermarkedImages.includes(imageName.replace('.jpg', '.png'))
    ) {
      return true
    } else {
      return false
    }
  })

  ipcMain.handle('queryImageInformation', (_, imageDir: string) => {
    if (imageDir.includes('extras-images')) {
      const imageName = imageDir.split('\\').slice(-1).join('\\')
      const postInfo = JSON.parse(
        fs.readFileSync(
          'D:\\ShitsNGames\\webui-Forge\\webui_forge_cu121_torch21\\webui\\output\\extras-images\\postInfo.json',
          'utf8'
        )
      )
      const imageIndex = postInfo.findIndex(
        (entry: { imageName: string }) => entry.imageName === imageName
      )
      if (imageIndex === -1) {
        return { patreon: false, twitter: false, pixiv: false }
      } else {
        console.log(postInfo[imageIndex])
        return postInfo[imageIndex]
      }
    }
  })

  // function that is used to explore the txt2img or img2img folders
  // it returns all their subfolders that are formatted YYYY-MM-DD and the images inside them
  // folders inside the subfolders are not returned.
  ipcMain.handle('queryImageDirContents', (_, imageDir: string) => {
    const explored = fs.readdirSync(imageDir)
    const folders = explored.filter((file) => {
      return file.match(/^\d{4}-\d{2}-\d{2}$/)
    })
    // for each folder, get the images inside it
    const images = folders.map((folder) => {
      const folderContents = fs.readdirSync(`${imageDir}\\${folder}`)
      return folderContents.filter((file) => {
        return file.endsWith('.jpg') || file.endsWith('.png')
      })
    })
    return { folders, images }
  })

  ipcMain.handle(
    'updateImageInformation',
    (_, imageName: string, patreon: boolean, twitter: boolean, pixiv: boolean) => {
      const extrasDirContents = fs.readdirSync(
        'D:\\ShitsNGames\\webui-Forge\\webui_forge_cu121_torch21\\webui\\output\\extras-images'
      )
      // if the postInfo.json file is not present, create it
      if (!extrasDirContents.includes('postInfo.json')) {
        fs.writeFileSync(
          'D:\\ShitsNGames\\webui-Forge\\webui_forge_cu121_torch21\\webui\\output\\extras-images\\postInfo.json',
          JSON.stringify([])
        )
      }
      // parse the postInfo.json file
      const postInfo = JSON.parse(
        fs.readFileSync(
          'D:\\ShitsNGames\\webui-Forge\\webui_forge_cu121_torch21\\webui\\output\\extras-images\\postInfo.json',
          'utf8'
        )
      )
      // if there is no entry for the image, create it, otherwise update it
      const imageIndex = postInfo.findIndex(
        (entry: { imageName: string }) => entry.imageName === imageName
      )
      if (imageIndex === -1) {
        postInfo.push({ imageName, patreon, twitter, pixiv })
      } else {
        postInfo[imageIndex] = { imageName, patreon, twitter, pixiv }
      }
      // write the new json to the file
      fs.writeFileSync(
        'D:\\ShitsNGames\\webui-Forge\\webui_forge_cu121_torch21\\webui\\output\\extras-images\\postInfo.json',
        JSON.stringify(postInfo, null, 2)
      )
    }
  )

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
