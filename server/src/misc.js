
export default {

  // Split 'aaa:bbb' into { owner:'aaaa', name:'bbb' }
  splitOwnerName(ownerColonName) {
    let pos = ownerColonName.indexOf(':')
    if (pos <= 0) {
        throw new Error(`Invalid ownerName: expected ':'`)
    }
    let owner = ownerColonName.substring(0, pos)
    let name = ownerColonName.substring(pos + 1)
    return { owner, name }
  }
}