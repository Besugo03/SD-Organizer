import { useEffect, useState } from 'react'
import { Card, Image, CardFooter, Button } from '@nextui-org/react'
import { useHotkey, Key } from '@util-hooks/use-hotkey' // libreria del grande svscagn
import { RxCheck } from 'react-icons/rx'
import { RxCross1 } from 'react-icons/rx'
import { FaPaintBrush } from 'react-icons/fa'

type MainCardProps = {
  imagesDir: string
  appStateUpdater: React.Dispatch<React.SetStateAction<string>>
}

function MainCard({ imagesDir, appStateUpdater }: MainCardProps): JSX.Element {
  const [imageIndex, setImageIndex] = useState(0)
  const [imagesArray, setFoundImagesArray] = useState<string[]>([])
  const [imagesLoaded, setImagesLoaded] = useState(false)
  let hotKeysEnabled = true
  // get the images in the directory
  useEffect(() => {
    window.electron.ipcRenderer.invoke('requestImages', imagesDir).then((response) => {
      setFoundImagesArray(response)
      console.log('requestimages response : ', response)
      if (response.length === 0) {
        console.log('no images found')
        appStateUpdater('explorer')
      }
      setImagesLoaded(true)
    })
  }, [])

  useEffect(() => {
    if (imagesLoaded) {
      console.log('second useeffect')
      console.log(imagesArray)
      console.log(imageIndex)
      console.log(`loaded image : ${imagesDir}\\${imagesArray[imageIndex]}`)
      console.log('imageIndex changed')
      console.log(imageIndex, imagesArray.length)
      if (imageIndex === imagesArray.length) {
        console.log('end of images')
        hotKeysEnabled = false
        setFoundImagesArray([])
        appStateUpdater('explorer')
      }
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
      [imageIndex, imagesArray]
    )

    useHotkey(
      [],
      Key.ArrowLeft,
      () => {
        console.log('key left pressed for image : ', imageIndex, imagesArray[imageIndex])
        nextImageHandle(imageIndex, 'bad')
      },
      [imageIndex, imagesArray]
    )

    useHotkey(
      [],
      Key.ArrowDown,
      () => {
        nextImageHandle(imageIndex, 'edit')
      },
      [imageIndex, imagesArray]
    )
  }

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const nextImageHandle = (chosenImageIndex: number, chosenOption: string) => {
    // add the image to the corresponding array
    switch (chosenOption) {
      case 'good':
        console.log(`image ${chosenImageIndex} is good`)
        window.electron.ipcRenderer.invoke(
          'moveImage',
          imagesDir,
          imagesArray[chosenImageIndex],
          'good'
        )
        break
      case 'bad':
        console.log(`image ${chosenImageIndex} is bad`)
        window.electron.ipcRenderer.invoke(
          'moveImage',
          imagesDir,
          imagesArray[chosenImageIndex],
          'bad'
        )
        break
      case 'edit':
        console.log(`image ${chosenImageIndex} is to edit`)
        window.electron.ipcRenderer.invoke(
          'moveImage',
          imagesDir,
          imagesArray[chosenImageIndex],
          'edit'
        )
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
      <Image width={600} alt="immagine di prova" src={`${imagesDir}\\${imagesArray[imageIndex]}`} />
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
