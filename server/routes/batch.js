const express = require('express')
const Plan = require('../models/Plan')
const PlanNote = require('../models/PlanNote')
const PlanDelay = require('../models/PlanDelay')
const logger = require('winston').child({ file: 'batch.js' })
const { getCurrentUser, routeName } = require('../util')

const mongoose = require('mongoose')
const batchRoutes = express.Router()

// this is a generic batch add/update/remove function
// needs to be improved a lot
batchRoutes.route('/').post(async function (req, res) {
  const log = logger.child({ method: routeName(req) })
  const count = { add: 0, update: 0, remove: 0 }
  try {
    log.info('run')
    const user = await getCurrentUser(req)
    const { add, update, remove } = req.body
    const models = [
      {
        doc: Plan,
        subDoc: 'notes',
        subModel: PlanNote
      }, {
        doc: Plan,
        subDoc: 'delays',
        subModel: PlanDelay
      }
    ]

    for (let i = 0; i < models.length; i++) {
      const Model = models[i].doc
      const SubModel = models[i].subModel
      const subDoc = models[i].subDoc || ''
      const type = `${Model.modelName}.${subDoc}`

      // for adding new objects:
      if (add?.[type]?.length) {
        await Promise.all(
          add[type].map(async (o) => {
            const doc = await Model.findById(o._parentId).exec()
            if (user.equals(doc._user)) {
              const obj = new SubModel(o)
              doc[subDoc].push(obj)
              await doc.save()
              log.info(`${type} ${obj._id} created.`)
              count.add += 1
            } else {
              log.warn('no permission')
            }
          })
        )
      }
      if (update?.[type]?.length) {
        await Promise.all(
          update[type].map(async (o) => {
            const q = {}
            q[`${subDoc}._id`] = mongoose.Types.ObjectId(o._id)
            const doc = await Model.findOne(q).exec()
            if (user.equals(doc._user)) {
              const obj = doc[subDoc].find(obj => obj._id.toString() === o._id)
              const changes = obj.modifyAllowedFields(o)
              if (changes.length) {
                await doc.save()
                log.info(`${type} ${obj._id} udpdated; fields: ${changes.join(', ')}.`)
                count.update += 1
              } else {
                log.warn(`${type} ${obj._id} unchanged.`)
              }
            } else {
              log.warn('no permission')
            }
          })
        )
      }

      if (remove?.[type]?.length) {
        await Promise.all(
          remove[type].map(async (o) => {
            const q = {}
            q[`${subDoc}._id`] = mongoose.Types.ObjectId(o._id)
            const doc = await Model.findOne(q).exec()
            if (user.equals(doc._user)) {
              const obj = doc[subDoc].find(obj => obj._id.toString() === o._id)
              await obj.remove()
              await doc.save()
              log.info(`${type} ${obj._id} removed.`)
              count.remove += 1
            } else {
              log.warn('no permission')
            }
          })
        )
      }
    }

    log.info(`added: ${count.add}, updated: ${count.update}, removed: ${count.remove}`)

    if (count.add + count.update + count.remove) {
      res.status(200).send('Batch action completed')
    } else {
      res.status(400).send('Batch action failed')
    }
  } catch (err) {
    log.error(err)
    res.status(400).send('Error performing batch action')
  }
})

module.exports = batchRoutes
