import { Callback, Context } from 'aws-lambda'
import { log } from '../core/modules/logger'
import { sendDiscordReport } from '../core/modules/discord'

type EventType = {
  data: string
}

export const handler = async (event: EventType, context?: Context, callback?: Callback): Promise<any> => {
  try {
    // Do something
  } catch (err: any) {
    log.pinoError(err.message, {
      additionalData: {
        action: 'awsEventRequestError',
      },
    })

    await sendDiscordReport(err as Error)
  }
}
