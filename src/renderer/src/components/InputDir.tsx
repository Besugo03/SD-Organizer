import { Input } from '@nextui-org/input'
import testimage from '../assets/testimage.png'
import { Card, Image, Spacer, Chip, CheckboxGroup, Checkbox } from '@nextui-org/react'
import { FaCheck, FaCopyright } from 'react-icons/fa'
import ImageEntryCard from './ImageEntryCard'
type InputDirProps = {
  chosenDir: string
  setChosenDir: (dir: string) => void
}

function InputDir({ chosenDir, setChosenDir }: InputDirProps): JSX.Element {
  return (
    <div>
      <Input value={chosenDir} onValueChange={setChosenDir} placeholder="Insert the directory" />
      <Spacer y={5} />
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
    </div>
  )
}

export default InputDir
