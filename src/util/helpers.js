import api from '../api'
import moment from 'moment-timezone'

// ROUTINE TO DUPLCIATE A RACE FOR FOLLOWING YEAR
async function nextYear (id) {
  const [name, link, eventStart, eventTimezone] = await Promise.all([
    api.getCourseField(id, 'name'),
    api.getCourseField(id, 'link'),
    api.getCourseField(id, 'eventStart'),
    api.getCourseField(id, 'eventTimezone')
  ])

  // get new start date
  const m = moment(eventStart).tz(eventTimezone)
  while (m.isBefore(moment())) {
    m.add(1, 'y')
  }

  const newId = await api.copyCourse(id)

  await api.addCourseToGroup(newId, 'course', id)

  await api.updateCourse(
    id,
    {
      course: {
        link: null
      }
    }
  )
  await api.updateCourse(
    newId,
    {
      course: {
        name: name,
        link: link,
        eventStart: m.toDate()
      }
    }
  )
}

module.exports = {
  nextYear: nextYear
}
