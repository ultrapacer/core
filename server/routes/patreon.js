const express = require('express')
const router = {
  auth: express.Router(), // authenticated
  open: express.Router() // unauthenticated
}
const patreon = require('@nathanhigh/patreon')
const User = require('../models/User')
const url = require('url')

// REFRESH LIST OF PATRONAGE STATUS
router.auth.route('/patrons/refresh').get(async function (req, res) {
  try {
    const user = await User.findOne({ auth0ID: req.user.sub }).exec()

    const patreonAPIClient = patreon.patreon(user.membership.patreon.token)

    const apiurl = url.format({
      pathname: `/campaigns/${process.env.PATREON_CAMPAIGN}/members`,
      query: {
        include: 'user',
        'fields[member]': 'full_name,email'
      }
    })

    const { rawJson } = await patreonAPIClient(apiurl)
    const patrons = rawJson.data.map(p => {
      return {
        name: p.attributes.full_name,
        email: p.attributes.email,
        id: p.relationships.user.data.id
      }
    })

    if (!patrons.length) {
      throw (new Error('No patrons'))
    }

    // TEMPORARY fix membership to object in any records first:
    await User.updateMany({ membership: { $not: { $type: 'object' } } }, { membership: { active: false } }).exec()

    // find users with emails in the patreon list, set status and id in user database:
    const users = await User.find({ email: { $in: patrons.map(p => { return p.email }) } })
      .select(['email', 'membership']).exec()

    const newPatrons = []
    await Promise.all(
      users.map(u => {
        const patron = patrons.find(p => p.email === u.email)
        if (!u.membership.active) u.set('membership.active', true)
        if (!u.membership.patreon) u.set('membership.patreon', {})
        if (!u.membership.method || u.membership.method !== 'lifetime') u.set('membership.method', 'patreon')
        if (!u.membership.patreon.id) u.set('membership.patreon.id', patron.id)
        if (u.isModified('membership.active')) newPatrons.push({ _id: u._id, email: u.email })
        return u.isModified() ? u.save() : false
      })
    )
    console.log(`patreon/patrons/refresh : ${newPatrons.length} new patrons.`)
    console.log(newPatrons)

    // find users with patreon memberships not in the patron list:
    const oldUsers = await User.find(
      {
        $and: [
          {
            'membership.method': 'patreon'
          },
          {
            'membership.patreon.id': {
              $not: {
                $in: patrons.map(p => { return p.id })
              }
            }
          }
        ]
      }
    ).select(['email', 'membership']).exec()
    const oldPatrons = oldUsers.map(u => { return { _id: u._id, email: u.email } })
    console.log(`patreon/patrons/refresh : ${oldPatrons.length} old patrons no longer on list.`)
    console.log(oldPatrons)

    // return lists:
    res.json({
      active: users.map(u => { return { _id: u._id, email: u.email } }),
      added: newPatrons,
      old: oldPatrons
    })
  } catch (err) {
    console.log(err)
    res.status(400).send(err)
  }
})

const allowedHosts = [
  { domain: 'localhost:3000', prefix: 'http://' },
  { domain: 'ultrapacer.com' },
  { domain: 'racepacer.appspot.com' },
  { domain: 'racepacer.wl.r.appspot.com' }
]
function getRedirect (host) {
  const h = allowedHosts.find(h => host.endsWith(h.domain))
  if (h) {
    return `${host.startsWith(h.prefix) ? '' : h.prefix || 'https://'}${host}/api/open/patreon/callback`
  }
  return ''
}

router.auth.route('/url').get(async function (req, res) {
  const user = await User.findOne({ auth0ID: req.user.sub }).select('admin').exec()
  const scopes = ['identity', 'identity[email]']
  if (user.admin) scopes.push('campaigns', 'campaigns.members', 'campaigns.members[email]')
  const loginUrl = url.format({
    protocol: 'https',
    host: 'patreon.com',
    pathname: '/oauth2/authorize',
    query: {
      response_type: 'code',
      client_id: process.env.PATREON_CLIENT_ID,
      redirect_uri: getRedirect(req.headers.host),
      scope: scopes.join(' '),
      state: 'chill'
    }
  })
  res.send(loginUrl)
})

router.auth.route('/user/:code').put(async function (req, res) {
  try {
    const oauthClient = patreon.oauth(process.env.PATREON_CLIENT_ID, process.env.PATREON_CLIENT_SECRET)
    const { access_token: accessToken } = await oauthClient.getTokens(req.params.code, getRedirect(req.headers.host))
    const apiClient = patreon.patreon(accessToken)
    const apiurl = url.format({
      pathname: '/identity',
      query: {
        include: 'memberships',
        'fields[member]': 'patron_status'
      }
    })
    const { rawJson } = await apiClient(apiurl)
    const { id } = rawJson.data
    const user = await User.findOne({ auth0ID: req.user.sub }).exec()
    user.set('membership.patreon', { id: id, token: accessToken })
    const isMember = Boolean(
      rawJson?.included?.length &&
      rawJson.included.filter(i => i.attributes.patron_status === 'active_patron').length
    )
    if (isMember) {
      console.log('api/patreon/user/:code : User has pledge for ultraPacer')
      if (!user.membership.active) user.set('membership.active', true)
      if (user.membership.method !== 'lifetime') user.set('membership.method', 'patreon')
    } else {
      console.log('api/patreon/user/:code : User does not have pledge for ultraPacer')
    }
    await user.save()
    res.send(isMember)
  } catch (error) {
    console.log(error)
    res.status(400).send(error)
  }
})

router.open.route('/callback').get(async function (req, res) {
  try {
    const { code } = req.query
    console.log(`api/open/patreon/callback : Member code ${code}`)
    const page = `
<!DOCTYPE html>
<html>
  <head>
      <meta charset="utf-8">
      <title>Patreon Authentication Callback</title>
      <script>
        setTimeout(
          ()=>{
            window.opener.postMessage({
              source: 'ultrapacer-patreon-callback',
              code: '${code}'
            })
          }
          ,100
        )
      </script>
  </head>
  <body>
    <p>Please wait...</p>
  </body>
</html>`
    res.send(page)
  } catch (error) {
    console.log(error)
    res.status(400).send(error)
  }
})

module.exports = router
