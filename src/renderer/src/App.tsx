/* eslint-disable react/no-unescaped-entities */
import { useEffect, useState } from 'react'
import { Button } from '@nextui-org/button'
import MainCard from './components/MainCard'
import { useHotkey, Key } from '@util-hooks/use-hotkey'
import {
  Navbar,
  NavbarBrand,
  Spacer,
  Image,
  NavbarContent,
  NavbarItem,
  CheckboxGroup,
  Checkbox
} from '@nextui-org/react'
import ImageEntryCards from './components/ImageEntryCard'
import { FaFolder, FaTag } from 'react-icons/fa'
import ExplorerCard from './components/ExplorerCard'
import 'react-toastify/dist/ReactToastify.css'
import { ToastContainer, toast } from 'react-toastify'
import shibaIcon from './assets/shiba.jpg'
import { FaGear, FaPatreon, FaPixiv, FaXTwitter, FaEyeSlash } from 'react-icons/fa6'
function App(): JSX.Element {
  // useState restituisce un array con due elementi
  // il primo è il valore che stai gestendo
  // il secondo è la funzione che ti permette di cambiare il valore
  const [foundImagesArray, setFoundImagesArray] = useState<string[]>([])
  const [chosenDir, setChosenDir] = useState<string>(
    'D:\\ShitsNGames\\webui-Forge\\webui_forge_cu121_torch21\\webui\\output\\txt2img-images\\2024-02-24'
  )
  const [appState, setAppState] = useState<string>('main')
  const [invisibleTags, setInvisibleTags] = useState<string[]>([])

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
  useEffect(() => {
    ipcHandle(
      'D:\\ShitsNGames\\webui-Forge\\webui_forge_cu121_torch21\\webui\\output\\extras-images'
    )
  }, [])

  // test rappresenta il valore restituito dalla funzione chiamata in main
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const ipcHandle = (requested_dir: string) => {
    window.electron.ipcRenderer.invoke('requestImages', requested_dir).then((response) => {
      console.log('ipchandle response : ', response)
      // reverse the array to show the latest images first
      response.reverse()
      setFoundImagesArray(response)
    })
  }
  const notify = (): void => {
    console.log('notify')
    toast('🦄 Wow so easy!', {
      position: 'bottom-right',
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: 'dark'
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
      <Navbar>
        <NavbarBrand>
          <Image src={shibaIcon} width={50} radius="lg" height={50} alt="logo" />
          <Spacer x={3} />
          <header className="text-2xl">Paw-Fect</header>
        </NavbarBrand>
        <NavbarContent className="hidden sm:flex gap-4" justify="center">
          <NavbarItem>
            <Button
              size="md"
              color="secondary"
              startContent={<FaTag />}
              onClick={() => {
                setAppState('classify')
                console.log('appstate : ', appState)
              }}
            >
              Today's Images
            </Button>
          </NavbarItem>
          <NavbarItem>
            <Button
              size="md"
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
          </NavbarItem>
        </NavbarContent>
        <NavbarContent justify="end">
          <div className="flex justify-center">
            <CheckboxGroup
              size="lg"
              orientation="horizontal"
              value={invisibleTags}
              onValueChange={setInvisibleTags}
            >
              <Checkbox value="patreon" icon={FaEyeSlash} color="danger">
                <FaPatreon />
              </Checkbox>
              <Checkbox value="twitter" icon={FaEyeSlash} color="danger">
                <FaXTwitter />
              </Checkbox>
              <Checkbox value="pixiv" icon={FaEyeSlash} color="danger">
                <FaPixiv />
              </Checkbox>
            </CheckboxGroup>
          </div>
          <Button
            isIconOnly
            onClick={() => {
              notify()
            }}
          >
            <FaGear size={20} color="white"></FaGear>
          </Button>
        </NavbarContent>
      </Navbar>
      {appState === 'main' ? (
        <>
          <div className="flex flex-wrap justify-evenly">
            {/*create an ImageEntryCard for each image in the extras-images directory, after getting the images through the ipchandle*/}
            {foundImagesArray.map((imageDir) => {
              return (
                <ImageEntryCards
                  key={imageDir}
                  imageDir={
                    'D:\\ShitsNGames\\webui-Forge\\webui_forge_cu121_torch21\\webui\\output\\extras-images\\' +
                    imageDir
                  }
                  displayPreferences={invisibleTags}
                ></ImageEntryCards>
              )
            })}
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
      <ToastContainer />
    </>
  )
}

export default App
