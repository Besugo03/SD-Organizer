import { Input } from '@nextui-org/input'

type InputDirProps = {
  chosenDir: string
  setChosenDir: (dir: string) => void
}

function InputDir({ chosenDir, setChosenDir }: InputDirProps): JSX.Element {
  return <Input value={chosenDir} onValueChange={setChosenDir} placeholder="Insert the directory" />
}

export default InputDir
