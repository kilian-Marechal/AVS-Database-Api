import { isProd, isStaging } from './environment'

if (
  ((isProd || isStaging) &&
    (process.env.DISCORD_REPORT_WEBHOOK === undefined || process.env.DISCORD_REPORT_WEBHOOK.trim() === '')) ||
  process.env.DISCORD_MESSAGE_WEBHOOK === undefined ||
  process.env.DISCORD_MESSAGE_WEBHOOK.trim() === ''
)
  throw new Error('DISCORD_REPORT_WEBHOOK or DISCORD_MESSAGE_WEBHOOK are undefined !')

export const discord_report_webhook = process.env.DISCORD_REPORT_WEBHOOK
export const discord_message_webhook = process.env.DISCORD_MESSAGE_WEBHOOK

export const discord_report_name = `${process.env.NODE_NAME} API Error`
