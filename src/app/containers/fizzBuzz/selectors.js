import _ from 'lodash'

import {SLICE_NAME} from './constants'

export const selectCount = state => _.get(state, [SLICE_NAME, 'count'], null)
export const selectMessage = state => _.get(state, [SLICE_NAME, 'message'], null)
