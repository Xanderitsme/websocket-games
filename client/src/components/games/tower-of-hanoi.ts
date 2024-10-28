interface towerOfHanoiArgs {
  disks: number
  fromRod: string
  auxRod: string
  toRod: string
}

// const isEvenNumber = (num: number) => {
//   if (num < 0) {
//     return isEvenNumber(num * -1)
//   }

//   if (num % 2 === 1) {
//     return false
//   }

//   return true
// }

export const towerOfHanoi = ({
  disks,
  fromRod,
  auxRod,
  toRod
}: towerOfHanoiArgs) => {
  if (disks === 1) {
    console.log(`Move disk 1 from rod ${fromRod} to rod ${toRod}`)
    return
  }

  towerOfHanoi({
    disks: disks - 1,
    fromRod: fromRod,
    auxRod: toRod,
    toRod: auxRod
  })

  console.log(`Move disk ${disks} from rod ${fromRod} to rod ${toRod}`)

  towerOfHanoi({
    disks: disks - 1,
    fromRod: auxRod,
    auxRod: fromRod,
    toRod: toRod
  })
}

/* 
initial |
auxRod  |
final   |
*/
