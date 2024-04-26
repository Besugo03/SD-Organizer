import { useState } from 'react'
import { Button } from '@nextui-org/button'
import MainCard from './components/MainCard'
import InputDir from './components/InputDir'
import { useHotkey, Key } from '@util-hooks/use-hotkey'

function App(): JSX.Element {
  // useState restituisce un array con due elementi
  // il primo è il valore che stai gestendo
  // il secondo è la funzione che ti permette di cambiare il valore
  const [foundImagesArray, setFoundImagesArray] = useState<string[]>([])
  const [chosenDir, setChosenDir] = useState<string>('')

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
      console.log(response)
      setFoundImagesArray(response)
    })
  }

  return (
    <>
      {/* onClick si aspetta o una funzione priva di paramentri o una che ha un evento come paramentro */}
      {/* per questo il workaround di mettere la funzione senza param che chiama la funzione */}
      <Button
        variant="ghost"
        color="secondary"
        onClick={() => {
          ipcHandle(chosenDir)
        }}
      >
        filemanager
      </Button>
      {foundImagesArray.length === 0 ? (
        <InputDir chosenDir={chosenDir} setChosenDir={setChosenDir}></InputDir>
      ) : null}
      {foundImagesArray.length > 0 ? (
        <MainCard
          imagesDir={chosenDir}
          imagesArray={foundImagesArray}
          setFoundImagesArray={setFoundImagesArray}
        />
      ) : null}
    </>
  )
}

export default App
