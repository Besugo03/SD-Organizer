import { Card, Chip, Spacer, Button, ScrollShadow } from '@nextui-org/react'
import { useEffect, useState } from 'react'
import { FaFolder, FaCheck } from 'react-icons/fa'

type ExplorerCardProps = {
  directory: string
  appStateUpdater: React.Dispatch<React.SetStateAction<string>>
  setChosenDirUpdater: React.Dispatch<React.SetStateAction<string>>
}
type FoldersImagesState = {
  folders: string[]
  images: string[][]
}
function ExplorerCard({
  directory,
  appStateUpdater,
  setChosenDirUpdater
}: ExplorerCardProps): JSX.Element {
  const [foldersimages, setFoldersImages] = useState<FoldersImagesState>({
    folders: [],
    images: []
  })
  useEffect(() => {
    window.electron.ipcRenderer.invoke('queryImageDirContents', directory).then((response) => {
      console.log(response)
      // reverse the array to show the latest images first
      setFoldersImages(response)
    })
  }, [])
  return (
    <div className="w-full p-1">
      <Card className="p-2">
        <div className="flex justify-center">
          {directory.includes('txt2img') ? <p>txt2img</p> : <p>img2img</p>}
        </div>
      </Card>
      <Spacer y={1} />
      <ScrollShadow className="h-[calc(100vh-53px)]">
        {/* display a button with the folder icon on the left, a folder name, and a Chip */}
        {foldersimages.folders.map((folder) => (
          <>
            <Button
              key={folder}
              fullWidth={true}
              onClick={() => {
                appStateUpdater('classify')
                setChosenDirUpdater(`${directory}\\${folder}`)
                console.log(`chosen dir : ${directory}\\${folder}`)
              }}
            >
              <FaFolder />
              <p>{folder}</p>
              <Spacer x={1} />
              {foldersimages.images[foldersimages.folders.indexOf(folder)].length > 0 ? (
                <Chip color="warning">
                  {foldersimages.images[foldersimages.folders.indexOf(folder)].length}
                </Chip>
              ) : (
                <Chip color="success">
                  <FaCheck color="white"></FaCheck>
                </Chip>
              )}
            </Button>
            <Spacer y={1} />
          </>
        ))}
      </ScrollShadow>
    </div>
  )
}

export default ExplorerCard
