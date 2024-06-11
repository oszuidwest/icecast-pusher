addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest (request) {
  const url = 'https://rucphenrtv.nl/programmering/'

  try {
    // Fetch the HTML content from the URL
    const response = await fetch(url)
    const html = await response.text()

    // Decode HTML entities in the fetched HTML
    const decodedHtml = decodeHtmlEntities(html)

    // Get the current time in Europe/Amsterdam timezone
    const now = new Date().toLocaleString('en-US', { timeZone: 'Europe/Amsterdam' })
    const currentDate = new Date(now)
    const currentDayIndex = currentDate.getDay()
    const daysOfWeek = ['Zondag', 'Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag']
    const currentDay = daysOfWeek[currentDayIndex]
    const currentHour = currentDate.toTimeString().slice(0, 5)

    // Log the current day and time for debugging
    console.log(`Current day: ${currentDay}`)
    console.log(`Current time: ${currentHour}`)

    // Regular expression to capture the current day's section
    const dayRegex = new RegExp(`<a[^>]*class="elementor-accordion-title"[^>]*>\\s*${currentDay}\\s*</a>[\\s\\S]*?<div[^>]*class="elementor-tab-content[^>]*"[^>]*>([\\s\\S]*?)</div>`, 'i')
    const dayMatch = decodedHtml.match(dayRegex)

    if (!dayMatch) {
      console.log('Schedule section not found for today.')
      return new Response('Error: Unable to find the schedule for today.', { status: 500 })
    }

    // Extract the schedule for the current day
    const scheduleHtml = dayMatch[1]

    // Log the extracted HTML for debugging
    console.log(`Extracted schedule HTML: ${scheduleHtml}`)

    // Decode HTML entities in the extracted schedule
    const decodedScheduleHtml = decodeHtmlEntities(scheduleHtml)

    // Regular expression to find program entries
    const programRegex = /(\d{2}:\d{2})\s*–\s*(\d{2}:\d{2})\s*\|\s*([^<\n\r]*)/g
    let match
    let currentProgramName = 'No program scheduled for the current time.'

    while ((match = programRegex.exec(decodedScheduleHtml)) !== null) {
      const startTime = match[1]
      const endTime = match[2]
      const programName = match[3].trim()

      // Convert times to Date objects for comparison
      const startTimeParts = startTime.split(':').map(Number)
      const endTimeParts = endTime.split(':').map(Number)

      const startTimeDate = new Date(currentDate)
      startTimeDate.setHours(startTimeParts[0], startTimeParts[1], 0, 0)

      const endTimeDate = new Date(currentDate)
      endTimeDate.setHours(endTimeParts[0], endTimeParts[1], 0, 0)

      const currentHourParts = currentHour.split(':').map(Number)
      const currentHourDate = new Date(currentDate)
      currentHourDate.setHours(currentHourParts[0], currentHourParts[1], 0, 0)

      // Adjust for overnight programs that might end past midnight
      if (endTimeDate < startTimeDate) {
        endTimeDate.setDate(endTimeDate.getDate() + 1)
      }

      // Log the times for debugging
      console.log(`Comparing ${currentHourDate} with ${startTimeDate} - ${endTimeDate}`)

      if (currentHourDate >= startTimeDate && currentHourDate < endTimeDate) {
        currentProgramName = programName
        break
      }
    }

    return new Response(currentProgramName, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=UTF-8'
      }
    })
  } catch (error) {
    console.log(`Error: ${error.message}`)
    return new Response(`Error: ${error.message}`, { status: 500 })
  }
}

// Function to decode HTML entities
function decodeHtmlEntities (str) {
  const entities = {
    '&#8211;': '–',
    '&#8217;': "'",
    '&#8220;': '“',
    '&#8221;': '”',
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&nbsp;': ' '
    // Add more entities if needed
  }

  return str.replace(/&#?\w+;/g, match => entities[match] || match)
}
