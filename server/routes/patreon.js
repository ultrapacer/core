const express = require('express')
const router = express.Router()
const { patreon } = require('patreon')
const User = require('../models/User')

// REFRESH LIST OF PATRONAGE STATUS
router.route('/patrons/refresh').get(async function (req, res) {
  try {
    refreshPatrons()
    res.json('Refresh complete')
  } catch (err) {
    console.log(err)
    res.status(400).send(err)
  }
})

async function refreshPatrons () {
  const patreonAPIClient = patreon(process.env.PATREON_ACCESS_TOKEN)
  const response = await patreonAPIClient(`/campaigns/${process.env.PATREON_CAMPAIGN}/pledges`)
  const patrons = response.rawJson.included.filter(p =>
    p.type === 'user'
  ).map(p => { return { email: p.attributes.email } })

  if (!patrons.length) {
    throw (new Error('No patrons'))
  }

  // first remove any old patrons:
  const removed = await User.updateMany(
    {
      $and: [
        {
          'membership.method': 'patreon'
        },
        {
          email: {
            $not: {
              $in: patrons.map(p => { return p.email })
            }
          }
        },
        {
          'membership.patreon.email': {
            $not: {
              $in: patrons.map(p => { return p.email })
            }
          }
        }
      ]
    },
    {
      $unset: {
        membership: ''
      }
    }
  ).exec()
  console.log(`patreon|refreshPatrons : removed ${removed.nModified} patrons`)

  // TEMPORARY fix membership to object in any records first:
  await User.updateMany({ membership: { $not: { $type: 'object' } } }, { membership: { active: false } }).exec()

  // populate patreon fields in membership:
  const added = await User.updateMany(
    {
      $and: [
        {
          'membership.active': {
            $ne: true
          }
        },
        {
          $or: [
            {
              email: {
                $in: patrons.map(p => { return p.email })
              }
            },
            {
              'membership.patreon.email': {
                $in: patrons.map(p => { return p.email })
              }
            }
          ]
        }
      ]
    },
    {
      'membership.active': true,
      'membership.method': 'patreon',
      'membership.status': 'member'
    }
  ).exec()
  console.log(`patreon|refreshPatrons : added ${added.nModified} patrons`)
}

module.exports = router
