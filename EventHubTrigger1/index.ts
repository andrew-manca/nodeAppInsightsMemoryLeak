import { AzureFunction, Context } from '@azure/functions';
import appInsights = require('applicationinsights');

import * as _ from 'lodash';
import * as v8 from 'v8';

import * as data from './test.json';
import {trackMemUsage} from './OtherFunctions'
import {trackHeapStats} from './OtherFunctions'
import {flatten} from './OtherFunctions'


export type NonPrimitive = { [key: string]: any };


const appInsightsClient: appInsights.TelemetryClient = appInsights.defaultClient;


/**
 * The Azure Function
 *
 * @param {Context} context The function App Context
 * @param {any[]} eventHubMessages The batch of Event Hub Messages
 * @returns {Promise<void>} No real return. Ignore
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const main: AzureFunction = async function(context: Context, eventHubMessages: any[]): Promise<void> {
    trackMemUsage(context, appInsightsClient, 'Starting Main()');
    trackHeapStats(context, appInsightsClient, 'Starting Main()');

    try {
        const promises = eventHubMessages.map(async (message: any, index: number) => {

            // Inside of function app core code
            appInsightsClient.trackEvent({
                name: 'Logging a flattened random message',
                properties: flatten(data),
            });

        });

        await Promise.all(promises).catch(err => {
            context.log.error(`Error in Promise.all`, err);
        });
    } catch (ex) {
        appInsightsClient.trackException({
            exception: ex,
            properties: { extraMessage: 'Caught exception in azure function : main()' },
        });
    }
};

export default main;
