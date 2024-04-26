import { useEffect, useState } from 'react'
import { Card, Image, CardFooter, Button } from '@nextui-org/react'
import { useHotkey, Key } from '@util-hooks/use-hotkey' // libreria del grande svscagn
import { RxCheck } from 'react-icons/rx'
import { RxCross1 } from 'react-icons/rx'
import { FaPaintBrush } from 'react-icons/fa'

type MainCardProps = {
  imagesDir: string
  imagesArray: string[]
  setFoundImagesArray: (foundImagesArray: string[]) => void
}

function MainCard({ imagesDir, imagesArray, setFoundImagesArray }: MainCardProps): JSX.Element {
  const [goodImagesArray, setGoodImagesArray] = useState<string[]>([])
  const [badImagesArray, setBadImagesArray] = useState<string[]>([])
  const [toEditImagesArray, setToEditImagesArray] = useState<string[]>([])
  const [imageIndex, setImageIndex] = useState(0)
  const imagedir = `${imagesDir}/${imagesArray[imageIndex]}`
  let hotKeysEnabled = true

  useEffect(() => {
    if (imageIndex === imagesArray.length) {
      console.log('end of images')
      hotKeysEnabled = false
      console.log('sending good images : ', goodImagesArray)
      window.electron.ipcRenderer.invoke('moveImages', imagesDir, goodImagesArray, 'good')
      console.log('sending bad images : ', badImagesArray)
      window.electron.ipcRenderer.invoke('moveImages', imagesDir, badImagesArray, 'bad')
      console.log('sending to edit images : ', toEditImagesArray)
      window.electron.ipcRenderer.invoke('moveImages', imagesDir, toEditImagesArray, 'edit')
      setFoundImagesArray([])
    }
  }, [imageIndex])

  if (hotKeysEnabled) {
    useHotkey(
      [],
      Key.ArrowRight,
      () => {
        nextImageHandle(imageIndex, 'good')
      },
      // ,[imagedir] // in teoria va messo imagenumber, perché bisogna usare la variabile che cambia
      // !!!!!!! passare sempre le variabili che vengono usate negli useffect !!!!!!!
      [imageIndex]
    )

    useHotkey(
      [],
      Key.ArrowLeft,
      () => {
        console.log('left')
        nextImageHandle(imageIndex, 'bad')
      },
      [imageIndex]
    )

    useHotkey(
      [],
      Key.ArrowDown,
      () => {
        nextImageHandle(imageIndex, 'edit')
      },
      [imageIndex]
    )
  }

  console.log(`loaded image : ${imagedir}/${imagesArray[imageIndex]}`)
  console.log(imageIndex)

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const nextImageHandle = (chosenImageIndex: number, chosenOption: string) => {
    // add the image to the corresponding array
    switch (chosenOption) {
      case 'good':
        console.log(`image ${chosenImageIndex} is good`)
        setGoodImagesArray((prev) => [...prev, imagesArray[chosenImageIndex]])
        break
      case 'bad':
        console.log(`image ${chosenImageIndex} is bad`)
        setBadImagesArray((prev) => [...prev, imagesArray[chosenImageIndex]])
        break
      case 'edit':
        console.log(`image ${chosenImageIndex} is to edit`)
        setToEditImagesArray((prev) => [...prev, imagesArray[chosenImageIndex]])
        break
      default:
        break
    }
    console.log('print imagehandle : ', chosenImageIndex, chosenOption)
    // while the file selected is not an image, skip to the next one
    setImageIndex((prev) => prev + 1) // usato una funzione per far si che si refreshi l'immagine. setimagenumber usa la funzione fornita per calcolare il nuovo valore
    console.log(imageIndex)
  }
  return (
    <Card className="p-3">
      <Image width={600} alt="immagine di prova" src={imagedir} />
      <CardFooter>
        <div className="flex justify-between w-full">
          <Button
            onClick={() => {
              nextImageHandle(imageIndex, 'bad')
            }}
            color="danger"
            endContent={<RxCross1 />}
          >
            Pass
          </Button>
          <Button
            color="warning"
            onClick={() => {
              nextImageHandle(imageIndex, 'edit')
            }}
            endContent={<FaPaintBrush />}
          >
            Retouch
          </Button>
          <Button
            color="success"
            onClick={() => {
              nextImageHandle(imageIndex, 'good')
            }}
            endContent={<RxCheck />}
          >
            Smash
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}

export default MainCard
