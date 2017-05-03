import opn from 'opn'
import inquirer from 'inquirer'
import chalk from 'chalk'

import { getContext, getConfigPath, setContext, storeRuntimeConfig } from '../context'
import { confirmation } from '../utils/actions'
import { handleAsyncError as handle } from '../utils/async'
import { log } from '../utils/log'
import { highlightStyle } from '../utils/styles'
import { frame } from '../utils/text'

const APP_ID = '4cc8a42980af996977f7ec1d12b8ad4282c219e4913345c8313d145f53387278'
const REDIRECT_URI = 'https://contentful.github.io/contentful-cli-oauth-page/'
const oAuthURL = `https://be.contentful.com/oauth/authorize?response_type=token&client_id=${APP_ID}&redirect_uri=${REDIRECT_URI}&scope=content_management_manage`

export const command = 'login'

export const desc = 'Login to Contentful'

export async function login () {
  const context = await getContext()

  if (context.cmaToken) {
    log()
    log(`Looks like you already stored a CMA token on your machine. ${chalk.dim(`(Located at ${getConfigPath()})`)}`)
    log(frame(`Your CMA token: ${context.cmaToken}`))
    log(`Maybe you want to ${chalk.bold('contentful logout')}?`)
    return context.cmaToken
  }

  log(`A browser window will open where you will log in (or sign up if you don’t have an account), authorize the CLI application and paste your ${highlightStyle('CMA token')} here:`)
  log()

  await confirmation('We will now try to retrieve your CMA token. Open this window.')

  await opn(oAuthURL, {
    wait: false
  })

  const tokenAnswer = await inquirer.prompt([
    {
      type: 'input',
      name: 'cmaToken',
      message: 'Paste your token here:',
      validate: (val) => /^[a-f0-9]{64}$/.test(val.trim())
    }
  ])

  await setContext({
    cmaToken: tokenAnswer.cmaToken
  })
  await storeRuntimeConfig()
  log()
  log(`Great! Your ${highlightStyle('CMA token')} is now stored on your system. ${chalk.dim(`(Located at ${getConfigPath()})`)}`)
  log(`You can always run ${chalk.bold('contentful logout')} to remove it.`)

  return tokenAnswer.cmaToken
}

export const handler = handle(login)