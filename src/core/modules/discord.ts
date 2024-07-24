import { discord_message_webhook, discord_report_name, discord_report_webhook } from '../environment/discord'
import { envName, stage } from '../environment/environment'
import { version } from '../environment/version'
import { log } from './logger'

export enum Gravity {
  Low = 'LOW',
  Medium = 'MEDIUM',
  High = 'HIGH',
}

const colors = {
  [Gravity.Low]: 3066993, // Green
  [Gravity.Medium]: 15105570, // Yellow
  [Gravity.High]: 15158332, // Red
}

function respectMaxLimit(input: any, max: number) {
  if (!input) return undefined
  if (typeof input !== 'string') input = JSON.stringify(input)
  return input.length > max ? input.slice(0, max - 3) + '...' : input
}

function splitIntoChunks(text: string, chunkSize: number): string[] {
  const chunks = []
  for (let i = 0; i < text.length; i += chunkSize) {
    chunks.push(text.slice(i, i + chunkSize))
  }
  return chunks
}

export async function sendDiscordReport(functionOrigin: string, error: Error, gravity?: Gravity) {
  if (!discord_report_webhook || discord_report_webhook === '') return

  const { stack, cause } = error

  const _title = respectMaxLimit(functionOrigin, 256)
  const _cause = respectMaxLimit(cause, 1024)

  const fields = [
    {
      name: `> Service: __${envName}__`,
      value: '',
    },
    {
      name: `> Stage: __${stage}__`,
      value: '',
    },
    {
      name: `> Version: __${version}__`,
      value: '',
    },
  ]

  if (cause) {
    fields.push({
      name: 'Cause:',
      value: '```\n' + (_cause ? _cause : 'No cause available') + '\n```',
    })
  }

  if (stack) {
    const stackChunks = splitIntoChunks(stack, 1000)
    stackChunks.forEach((_chunk) => {
      fields.push({
        name: '',
        value: '```\n' + _chunk + '\n```',
      })
    })
  } else {
    fields.push({
      name: '',
      value: '```\nNo stack trace available\n```',
    })
  }

  const params = {
    username: discord_report_name,
    embeds: [
      {
        color: gravity ? colors[gravity] : undefined,
        title: '> Error in ' + '__' + _title + '__',
        fields: fields,
      },
    ],
  }

  try {
    const response = await fetch(discord_report_webhook, {
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
      },
      body: JSON.stringify(params),
    })

    if (!response.ok) {
      log.pinoError('Failed to send report to Discord:', {
        additionalData: {
          action: 'sendDiscordReport',
          response: response.statusText,
          params,
        },
      })
    }
  } catch (error) {
    console.error('Error sending report to Discord:', error)
  }
}

const embed = (title: string, description: string) => ({
  title: title.length > 256 ? title.slice(0, 253) + '...' : title, // Titles limited to 256 chars
  description: description.length > 2048 ? description.slice(0, 2045) + '...' : description, // Desc limited to 2048 chars
})

export async function sendDiscordMessage(title: string, description: string) {
  if (!discord_message_webhook || discord_message_webhook === '') return

  const params = {
    username: discord_report_name,
    embeds: [
      {
        ...embed(title, description),
        color: 0x0099ff, // blue
      },
    ],
  }

  try {
    const response = await fetch(discord_message_webhook, {
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
      },
      body: JSON.stringify(params),
    })

    if (!response.ok) {
      log.pinoError('Failed to send message to Discord:', {
        additionalData: {
          action: 'sendDiscordMessage',
          response: response.statusText,
        },
      })
    }
  } catch (error) {
    console.error('Error sending message to Discord:', error)
  }
}
