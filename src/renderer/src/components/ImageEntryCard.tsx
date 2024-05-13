import { Card, Image, Spacer, Chip, Checkbox, Spinner } from '@nextui-org/react'
import { useEffect, useState } from 'react'
import { FaAlignLeft, FaImage, FaCheck, FaCopyright } from 'react-icons/fa'
import { toast } from 'react-toastify'

type ImageEntryCardProps = {
  imageDir: string
  // displayPreferences is a string array
  displayPreferences?: string[]
}
function ImageEntryCards({ imageDir, displayPreferences }: ImageEntryCardProps): JSX.Element {
  const [watermarkedAvailable, setWatermarkedAvailable] = useState(false)
  const [parteonSelected, setPatreonSelected] = useState(false)
  const [twitterSelected, setTwitterSelected] = useState(false)
  const [pixivSelected, setPixivSelected] = useState(false)
  const [socialStatesLoaded, setSocialStatesLoaded] = useState(false)
  const [thumbnailDir, setThumbnailDir] = useState('')
  const imageName = imageDir.split('\\').slice(-1).join('\\')

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const ipcAskForWatermarked = async (imageDir: string) => {
    const response = await window.electron.ipcRenderer.invoke('watermarkedImageCheck', imageDir)
    setWatermarkedAvailable(response)
  }
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const ipcCopyToClipboard = async (imageDir: string, watermarkedVersion?: boolean) => {
    if (watermarkedVersion) {
      imageDir = imageDir.replace('extras-images', 'extras-images\\watermarked')
      imageDir = imageDir.replace('.png', '.jpg')
    }
    console.log(imageDir)
    window.electron.ipcRenderer.invoke('copyImageToClipboard', imageDir)
  }

  useEffect(() => {
    window.electron.ipcRenderer.invoke('requestThumbnail', imageDir).then((response) => {
      setThumbnailDir(response)
      console.log(response)
    })
  }, [])

  useEffect(() => {
    if (!socialStatesLoaded) {
      window.electron.ipcRenderer.invoke('queryImageInformation', imageDir).then((response) => {
        console.log(response)
        console.log(response['patreon'])
        setPatreonSelected(response['patreon'])
        setTwitterSelected(response['twitter'])
        setPixivSelected(response['pixiv'])
        setSocialStatesLoaded(true)
      })
    } else {
      console.log('checkbox value changed...')
      window.electron.ipcRenderer.invoke(
        'updateImageInformation',
        imageName,
        parteonSelected,
        twitterSelected,
        pixivSelected
      )
    }
  }, [parteonSelected, twitterSelected, pixivSelected])

  let folder = ''
  let imageIcon
  let tagColor = ''
  let chipText = ''
  if (imageDir.includes('txt2img-images')) {
    folder = 'txt2img'
  }
  if (imageDir.includes('img2img-images')) {
    folder = 'img2img'
  }
  if (imageDir.includes('extras-images')) {
    folder = 'extras'
    ipcAskForWatermarked(imageDir)
    if (watermarkedAvailable) {
      folder = 'watermarked'
    }
  }
  // qui al posto della folder andrá messa una funzione che controlla la presenza dell'immagine anche nella cartella 'watermarked'
  //   if (imageDir.includes('watermarked')) {
  //     folder = 'watermarked'
  //   }
  switch (folder) {
    case 'txt2img':
      imageIcon = <FaAlignLeft />
      tagColor = 'default'
      chipText = 'txt2img'
      break
    case 'img2img':
      imageIcon = <FaImage />
      tagColor = 'warning'
      chipText = 'img2img'
      break
    case 'extras':
      imageIcon = <FaCheck />
      tagColor = 'success'
      chipText = 'Complete'
      break
    case 'watermarked':
      imageIcon = <FaCopyright />
      tagColor = 'primary'
      chipText = 'Complete & Watermarked'
      break
  }

  if (displayPreferences?.includes('patreon') && parteonSelected) {
    return <></>
  }
  if (displayPreferences?.includes('twitter') && (twitterSelected || !watermarkedAvailable)) {
    return <></>
  }
  if (displayPreferences?.includes('pixiv') && (pixivSelected || !watermarkedAvailable)) {
    return <></>
  }
  return (
    <div className="flex flex-wrap justify-evenly content-center">
      <Card
        isPressable
        onPress={(event) => {
          if (event.shiftKey && folder === 'watermarked') {
            console.log('shift + click')
            ipcCopyToClipboard(imageDir, true)
            toast('👁️ Copied watermarked image to clipboard', {
              theme: 'dark',
              pauseOnFocusLoss: false
            })
          } else {
            ipcCopyToClipboard(imageDir)
            toast.success('Copied image to clipboard', { theme: 'dark', pauseOnFocusLoss: false })
          }
        }}
        className="p-2 max-w-64 m-4 h-min"
      >
        <div className="flex justify-center w-full">
          <Chip color="default">{imageName}</Chip>
        </div>
        <Spacer y={1} />
        {thumbnailDir === '' ? (
          <div className="flex w-full justify-center h-[250px]">
            <Spinner></Spinner>
          </div>
        ) : (
          <Image src={thumbnailDir} loading="lazy" width={200} className="z-0" />
        )}

        <Spacer y={1} />
        <Chip
          color={
            tagColor as
              | 'default'
              | 'warning'
              | 'success'
              | 'primary'
              | 'secondary'
              | 'danger'
              | undefined
          }
          startContent={imageIcon}
        >
          {chipText}
        </Chip>
        <Spacer y={1} />
        {folder === 'extras' || folder === 'watermarked' ? (
          <Checkbox
            value="patreon"
            isSelected={parteonSelected}
            onValueChange={setPatreonSelected}
            lineThrough
          >
            Posted on Patreon
          </Checkbox>
        ) : null}
        {/* if the folder is 'watermarked', also render the pixiv and twitter checkboxes. */}
        {folder === 'watermarked' ? (
          <>
            <Checkbox
              value="twitter"
              isSelected={twitterSelected}
              onValueChange={setTwitterSelected}
              lineThrough
            >
              Posted on Twitter
            </Checkbox>
            <Checkbox
              value="pixiv"
              isSelected={pixivSelected}
              onValueChange={setPixivSelected}
              lineThrough
            >
              Posted on Pixiv
            </Checkbox>
          </>
        ) : null}
      </Card>
    </div>
  )
}
export default ImageEntryCards
