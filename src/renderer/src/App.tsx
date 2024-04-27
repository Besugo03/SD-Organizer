import { SetStateAction, useState } from 'react'
import { Button } from '@nextui-org/button'
import MainCard from './components/MainCard'
import { useHotkey, Key } from '@util-hooks/use-hotkey'
import { Spacer } from '@nextui-org/react'
import ImageEntryCard from './components/ImageEntryCard'
import { FaFolder, FaTag } from 'react-icons/fa'
import ExplorerCard from './components/ExplorerCard'

function App(): JSX.Element {
  // useState restituisce un array con due elementi
  // il primo è il valore che stai gestendo
  // il secondo è la funzione che ti permette di cambiare il valore
  const [foundImagesArray, setFoundImagesArray] = useState<string[]>([])
  const [chosenDir, setChosenDir] = useState<string>(
    'D:\\ShitsNGames\\webui-Forge\\webui_forge_cu121_torch21\\webui\\output\\txt2img-images\\2024-02-24'
  )
  const [appState, setAppState] = useState<string>('main')

  useHotkey(
    //ricordarsi che questo qui é un hook custom che ha useEffect, quindi in casi di problemi va passata la dipendenza
    [],
    Key.Enter,
    () => {
      console.log('enter')
      console.log(chosenDir)
      ipcHandle(chosenDir)
    },
    [chosenDir]
  )

  // useEffect si attiva ogni volta che cambia il valore di dir
  // se ci metti un array vuoto [] si attiva solo all'inizio perché non c'è nessuna dipendenza
  // useEffect(() => {
  //   console.log('dir changed')
  // }, [dir])

  // test rappresenta il valore restituito dalla funzione chiamata in main
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const ipcHandle = (requested_dir: string) => {
    window.electron.ipcRenderer.invoke('requestImages', requested_dir).then((response) => {
      console.log('ipchandle response : ', response)
      setFoundImagesArray(response)
    })
  }

  return (
    <>
      {/* onClick si aspetta o una funzione priva di paramentri o una che ha un evento come paramentro */}
      {/* per questo il workaround di mettere la funzione senza param che chiama la funzione */}
      {/* <Button
        variant="ghost"
        color="secondary"
        onClick={() => {
          ipcHandle(chosenDir)
        }}
      >
        Explore Dir
      </Button> */}
      {/* <InputDir chosenDir={chosenDir} setChosenDir={setChosenDir}></InputDir> */}
      {appState === 'main' ? (
        <>
          <div className="flex w-full justify-center">
            <Button
              size="lg"
              color="secondary"
              startContent={<FaTag />}
              onClick={() => {
                setAppState('classify')
                console.log('appstate : ', appState)
              }}
            >
              Classify Images
            </Button>
            <Spacer x={5} />
            <Button
              size="lg"
              color="warning"
              variant="ghost"
              startContent={<FaFolder />}
              onClick={() => {
                setAppState('explorer')
                console.log(appState)
              }}
            >
              Classify by dir
            </Button>
          </div>
          <div className="flex flex-wrap justify-evenly">
            <ImageEntryCard
              imageDir={
                'D:\\ShitsNGames\\webui-Forge\\webui_forge_cu121_torch21\\webui\\output\\txt2img-images\\2024-02-24\\ToEdit\\1.png'
              }
            />
            <ImageEntryCard
              imageDir={
                'D:\\ShitsNGames\\webui-Forge\\webui_forge_cu121_torch21\\webui\\output\\img2img-images\\2024-04-23\\00009-2351385004.png'
              }
            />

            <ImageEntryCard imageDir="D:\ShitsNGames\webui-Forge\webui_forge_cu121_torch21\webui\output\extras-images\Untitled-3.png" />

            <ImageEntryCard imageDir="D:\ShitsNGames\webui-Forge\webui_forge_cu121_torch21\webui\output\extras-images\00021.png" />
            <ImageEntryCard imageDir="D:\ShitsNGames\webui-Forge\webui_forge_cu121_torch21\webui\output\extras-images\00028.jpg" />
          </div>
        </>
      ) : null}
      {appState === 'explorer' ? (
        <>
          <div className="flex w-full justify-center">
            <ExplorerCard
              directory="D:\ShitsNGames\webui-Forge\webui_forge_cu121_torch21\webui\output\txt2img-images"
              appStateUpdater={setAppState}
              setChosenDirUpdater={setChosenDir}
            ></ExplorerCard>
            <ExplorerCard
              directory="D:\ShitsNGames\webui-Forge\webui_forge_cu121_torch21\webui\output\img2img-images"
              appStateUpdater={setAppState}
              setChosenDirUpdater={setChosenDir}
            ></ExplorerCard>
          </div>
        </>
      ) : null}
      {appState === 'classify' ? (
        <MainCard imagesDir={chosenDir} appStateUpdater={setAppState}></MainCard>
      ) : null}
    </>
  )
}

export default App
