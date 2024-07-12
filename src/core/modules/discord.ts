// import { PrismaClient } from '@prisma/client'
import { discord_report_name, discord_report_webhook } from '../environment/discord'
import { version } from '../environment/version'
import { ReportError } from '../error/ReportError'

export async function sendDiscordReport(error: ReportError) {
  const params = {
    username: discord_report_name,
    content: `Version: ${version}`,
    embeds: [
      {
        title: error.message,
        description: error.stack,
      },
      {
        title: 'Error',
        description: error.localError?.message || '',
      },
    ],
  }

  if (!discord_report_webhook || discord_report_webhook === '') return

  await fetch(discord_report_webhook, {
    method: 'POST',
    headers: {
      'Content-type': 'application/json',
    },
    body: JSON.stringify(params),
  })
}
