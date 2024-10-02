import Cd from './cd'
import Cat from './cat'
import Mkdir from './mkdir'
import Mv from './mv'
import Touch from './touch'
import Rm from './rm'
import Ls from './ls'
import Cp from './cp'
import Cwd from './cwd'

const Fs = {
  cd: Cd,
  cat: Cat,
  mkdir: Mkdir,
  mv: Mv,
  touch: Touch,
  rm: Rm,
  ls: Ls,
  cp: Cp,
  cwd: Cwd,
}

export default Fs