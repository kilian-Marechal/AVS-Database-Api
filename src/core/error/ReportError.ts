import { sendDiscordReport } from '../modules/discord'

export class ReportError extends Error {
  localError?: Error | null

  constructor(message: string, localError: Error | null = null) {
    super(message)
    this.name = 'ReportError'
    this.localError = localError

    console.error('ReportError', message, localError)
    sendDiscordReport(this)
  }
}
