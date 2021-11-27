import { spawn } from 'child_process'

export function pbcopy(data) {
  try {
    // macOS
    var proc = spawn('pbcopy')
    proc.stdin.write(data)
    proc.stdin.end()
    return true
  } catch (e) {
    try {
      // Windows & others
      var proc = spawn('xclip', ['-selection', 'c'])
      proc.stdin.write(data)
      proc.stdin.end()
      return true
    } catch (e) {
      return false
    }
  }
}
