import { Card, Image, Spacer, Chip, CheckboxGroup, Checkbox } from '@nextui-org/react'
import { useEffect, useState } from 'react'
import { FaAlignLeft, FaImage, FaCheck, FaCopyright } from 'react-icons/fa'

type ImageEntryCardProps = {
  imageDir: string
}
function ImageEntryCard({ imageDir }: ImageEntryCardProps): JSX.Element {
  const [watermarkedAvailable, setWatermarkedAvailable] = useState(false)
  const imageName = imageDir.split('\\').slice(-1).join('\\')
  const [parteonSelected, setPatreonSelected] = useState(false)
  const [twitterSelected, setTwitterSelected] = useState(false)
  const [pixivSelected, setPixivSelected] = useState(false)
  const [socialStatesLoaded, setSocialStatesLoaded] = useState(false)
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const ipcAskForWatermarked = async (imageDir: string) => {
    const response = await window.electron.ipcRenderer.invoke('watermarkedImageCheck', imageDir)
    setWatermarkedAvailable(response)
  }

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
  return (
    <div className="flex flex-wrap justify-evenly content-center">
      <Card isPressable className="p-2 max-w-64 m-4 h-min">
        <div className="flex justify-center w-full">
          <Chip color="default">{imageName}</Chip>
        </div>
        <Spacer y={1} />
        <Image src={imageDir} />
        <Spacer y={1} />
        <Chip color={tagColor} startContent={imageIcon}>
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
export default ImageEntryCard
