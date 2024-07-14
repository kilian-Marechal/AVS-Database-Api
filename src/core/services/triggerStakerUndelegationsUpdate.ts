import { local_url } from '../environment/local'

export async function triggerStakerUndelegationsUpdate() {
  try {
    const response = await fetch(`${local_url}/stakerUndelegationsUpdate` ?? '', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (response.status !== 200) {
      throw new Error(`Failed to retrigger UndelegationsUpdate: ${response.status}`)
    }
  } catch (error) {
    throw new Error(`Failed to retrigger UndelegationsUpdate: ${error}`)
  }
}
